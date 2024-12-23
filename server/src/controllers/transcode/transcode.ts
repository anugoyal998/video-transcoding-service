import { NextFunction, Request, Response } from "express";
import { TOKEN_PAYLOAD } from "../../types";
import { z } from "zod";
import { SupportedTranscodingFormats } from "@prisma/client";
import { db } from "../../db";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import { Queue, Worker, QueueEvents } from "bullmq";
import { redisConnection } from "../../redis";

import fs from "fs";
import stream, { Readable } from "stream";
import fsPromises from "fs/promises";
import path from "path";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import s3Client from "../../services/s3Client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { AWS_S3_BUCKET_NAME } from "../../config";
import { getResolutionInfo } from "../../services/getResolutionInfo";
import { uploadFolderToS3 } from "../../services/uploadFolderToS3";

const pipeline = promisify(stream.pipeline);

export const startTranscoding = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const payload = req.user as TOKEN_PAYLOAD;
    const schema = z
      .object({
        videoId: z.string().cuid(),
        transcodedFormats: z.array(
          z.enum([
            SupportedTranscodingFormats.FORMAT_240,
            SupportedTranscodingFormats.FORMAT_360,
            SupportedTranscodingFormats.FORMAT_480,
            SupportedTranscodingFormats.FORMAT_720,
            SupportedTranscodingFormats.FORMAT_1080,
          ])
        ),
      })
      .strict();
    const { videoId, transcodedFormats } = schema.parse(req.body);
    const video = await db.video.findFirst({
      where: { id: videoId, username: payload.username },
      select: {
        fileName: true,
        originalS3Path: true,
        uploadStatus: true,
        transcodeStatus: true,
      },
    });
    if (!video) throw CustomErrorHandler.notFound();
    if (video.uploadStatus !== "COMPLETED")
      throw new Error("Upload video to S3 before transcoding");
    if (video.transcodeStatus !== "NOT_STARTED")
      throw new Error("Transcoding in progress");

    // start transcoding
    await db.video.update({
      where: { id_username: { id: videoId, username: payload.username } },
      data: { transcodeStatus: "STARTED", transcodedFormats },
    });
    const queueName = `${videoId}-${video.fileName}`;
    const jobName = "transcode-video";
    const jobPayload = {
      videoId,
      transcodedFormats,
      fileName: video.fileName,
      originalS3Path: video.originalS3Path as string, // TODO: update originalS3Path in complete multipart upload api
      username: payload.username,
    };
    const queue = new Queue(queueName, {
      connection: redisConnection,
    });
    const worker = new Worker<typeof jobPayload, any, string>(
      queueName,
      async (job) => {
        const {
          videoId,
          fileName,
          transcodedFormats,
          originalS3Path,
          username,
        } = job.data;
        const response = await s3Client.send(
          new GetObjectCommand({
            Bucket: AWS_S3_BUCKET_NAME,
            Key: originalS3Path,
          })
        );
        if (!response.Body) throw new Error("Video not found");
        const fileNameWithoutExt = fileName.split(".").slice(0, -1);
        const originalFilePath = `src/video/original/${fileName}`;
        if (response.Body instanceof Readable) {
          await pipeline(response.Body, fs.createWriteStream(originalFilePath));
        }
        ffmpeg.setFfmpegPath(ffmpegInstaller.path);
        const originalVideoPath = path.resolve(originalFilePath);
        await db.video.update({
          where: { id_username: { id: videoId, username } },
          data: { transcodeStatus: "PROGRESS" },
        });
        for (let i = 0; i < transcodedFormats.length; i++) {
          const format = transcodedFormats[i];
          const formatInfo = getResolutionInfo(format);
          const outputFolder = `src/video/transcoded/${username}/${videoId}/${formatInfo.name}`;
          await fsPromises.mkdir(outputFolder, { recursive: true });
          const outputFilePath = `${outputFolder}/${fileNameWithoutExt}-${formatInfo.name}.m3u8`;
          const outputIndexPath = path.resolve(outputFilePath);
          const outputSegmentPath = path.resolve(
            `${outputFolder}/segment_%01d.ts`
          );
          await job.updateProgress({
            action: "TRANSCODE_START",
            indexPath: outputIndexPath,
            format,
          });
          await new Promise((resolve, reject) => {
            ffmpeg(originalVideoPath)
              .addOptions([
                "-profile:v baseline",
                "-level 3.0",
                "-start_number 0",
                "-hls_time 10",
                "-hls_list_size 0",
                "-c:v libx264",
                "-c:a aac",
                "-f hls",
                `-hls_segment_filename ${outputSegmentPath}`,
                `-vf scale=${formatInfo.width}:${formatInfo.height}`,
              ])
              .output(outputIndexPath)
              .on("end", () => resolve(outputIndexPath))
              .on("error", (error) => reject(error))
              .run();
          });
          await job.updateProgress({
            action: "TRANSCODE_END",
            indexPath: outputIndexPath,
            format,
          });
        }
        await uploadFolderToS3({
          localFolder: path.join("src/video/transcoded", username, videoId),
          remoteFolder: `transcoded/${username}/${videoId}`,
          bucketName: AWS_S3_BUCKET_NAME,
          job,
        });
        await job.updateProgress({
          action: "UPLOADED",
          folderPath: path.join("src/video/transcoded", username, videoId),
          isRootFolder: true,
        });
        await fsPromises.rm(`src/video/transcoded/${username}/${videoId}`, {
          recursive: true,
          force: true,
        });
        await fsPromises.rm(`src/video/original/${fileName}`, {
          recursive: true,
          force: true,
        });
        await db.video.update({
          where: { id_username: { id: videoId, username } },
          data: {
            transcodeStatus: "COMPLETED",
            transcodedS3Path: `transcoded/${username}/${videoId}`,
          },
        });
      },
      {
        connection: redisConnection,
      }
    );
    const queueEvents = new QueueEvents(queueName, {
      connection: redisConnection,
    });
    queue.add(jobName, jobPayload);
    res.status(200).json({ queueName });
    queueEvents.on("drained", () => queue.obliterate());
  } catch (err) {
    return next(err);
  }
};
