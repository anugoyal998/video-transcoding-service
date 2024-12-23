import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import s3Client from "../../services/s3Client";
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  GetObjectCommand,
  PutObjectCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AWS_S3_BUCKET_NAME } from "../../config";
import { db } from "../../db";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import { TOKEN_PAYLOAD } from "../../types";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { readFile, rm } from "fs/promises";
import path from "path";

export const initUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const { username } = req.user as TOKEN_PAYLOAD;
    const schema = z
      .object({
        fileName: z.string(),
      })
      .strict();
    let { fileName } = schema.parse(req.body);
    let fileNameWithoutExt = fileName.split(".").slice(0, -1);
    if (fileNameWithoutExt.length < 1) {
      throw new Error("Invalid file name, file extension is missing");
    }
    fileName = `${fileNameWithoutExt.join(".")}-${Math.floor(
      Math.random() * 1000000
    )}-${Date.now()}.${fileName.split(".").at(-1)}`;
    const { UploadId } = await s3Client.send(
      new CreateMultipartUploadCommand({
        Bucket: AWS_S3_BUCKET_NAME,
        Key: fileName,
      })
    );
    if (!UploadId) throw CustomErrorHandler.serverError();
    const { id: videoId } = await db.video.create({
      data: {
        fileName,
        uploadStatus: "STARTED",
        uploadProgress: 0,
        transcodeStatus: "NOT_STARTED",
        transcodeProgress: 0,
        multipartUploadId: UploadId,
        username,
      },
      select: { id: true },
    });
    res.status(200).json({ uploadId: UploadId, fileName, videoId });
  } catch (err) {
    return next(err);
  }
};

export const uploadMultiPart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z
      .object({
        fileName: z.string(),
        uploadId: z.string(),
        partNumber: z.number().int(),
      })
      .strict();
    // TODO: validate fileName
    const { fileName, uploadId, partNumber } = schema.parse(req.body);
    const preSignedUrl = await getSignedUrl(
      s3Client,
      new UploadPartCommand({
        Bucket: AWS_S3_BUCKET_NAME,
        Key: fileName,
        UploadId: uploadId,
        PartNumber: partNumber,
      }),
      { expiresIn: 3600 }
    );
    res.status(200).json({ preSignedUrl });
  } catch (err) {
    return next(err);
  }
};

export const updateUploadProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const { username } = req.user as TOKEN_PAYLOAD;
    const schema = z
      .object({
        videoId: z.string().cuid(),
        uploadProgress: z.number().int(),
      })
      .strict();
    const { videoId, uploadProgress } = schema.parse(req.body);
    await db.video.update({
      data: { uploadProgress, uploadStatus: "PROGRESS" },
      where: { id_username: { id: videoId, username } },
    });
    res.status(200).json({ message: "Upload Progress Updated" });
  } catch (err) {
    return next(err);
  }
};

export const completeUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const { username } = req.user as TOKEN_PAYLOAD;
    const schema = z.object({
      videoId: z.string().cuid(),
      uploadId: z.string(),
      fileName: z.string(),
      parts: z.array(
        z.object({ ETag: z.string(), PartNumber: z.number().int() }).strict()
      ),
    });
    const { videoId, uploadId, fileName, parts } = schema.parse(req.body);
    await s3Client.send(
      new CompleteMultipartUploadCommand({
        Bucket: AWS_S3_BUCKET_NAME,
        Key: fileName,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts },
      })
    );
    const preSignedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: AWS_S3_BUCKET_NAME,
        Key: fileName,
      }),
      {
        expiresIn: 10 * 60, // 10 min
      }
    );
    const thumbnailFolder = path.resolve(`src/video/thumbnail`);
    const thumbnailFileName = `thumbnail-${username}-${videoId}.jpg`;
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
    await new Promise((resolve, reject) => {
      ffmpeg(preSignedUrl)
        .screenshots({
          timestamps: [1],
          filename: thumbnailFileName,
          folder: thumbnailFolder,
        })
        .on("end", () => resolve(thumbnailFileName))
        .on("error", (error) => reject(error));
    });
    await s3Client.send(
      new PutObjectCommand({
        Bucket: AWS_S3_BUCKET_NAME,
        Key: `thumbnail/${thumbnailFileName}`,
        Body: await readFile(path.join(thumbnailFolder, thumbnailFileName)),
      })
    );
    await db.video.update({
      data: {
        uploadStatus: "COMPLETED",
        uploadProgress: 100,
        originalS3Path: fileName,
        thumbnail: `thumbnail/${thumbnailFileName}`,
      },
      where: { id_username: { id: videoId, username } },
    });
    await rm(path.join(thumbnailFolder, thumbnailFileName), {
      recursive: true,
      force: true,
    });
    res.status(200).json({ message: "Upload Completed" });
  } catch (err) {
    return next(err);
  }
};
