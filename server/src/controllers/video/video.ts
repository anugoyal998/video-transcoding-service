import { NextFunction, Request, Response } from "express";
import { TOKEN_PAYLOAD } from "../../types";
import { db } from "../../db";
import { z } from "zod";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "../../services/s3Client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { AWS_S3_BUCKET_NAME, DEFAULT_RESOLUTION } from "../../config";
import { SupportedTranscodingFormats } from "@prisma/client";

export const getVideo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const payload = req.user as TOKEN_PAYLOAD;
    const schema = z.object({
      id: z.string().cuid(),
      format: z.enum([
        SupportedTranscodingFormats.FORMAT_240,
        SupportedTranscodingFormats.FORMAT_360,
        SupportedTranscodingFormats.FORMAT_480,
        SupportedTranscodingFormats.FORMAT_720,
        SupportedTranscodingFormats.FORMAT_1080,
        "undefined",
      ]),
    });
    let { id, format } = schema.parse(req.params);
    const video = await db.video.findFirst({
      where: { id, username: payload.username },
      select: {
        id: true,
        fileName: true,
        multipartUploadId: true,
        originalS3Path: true,
        uploadProgress: true,
        uploadStatus: true,
        transcodeProgress: true,
        transcodeStatus: true,
        transcodedFormats: true,
        transcodedS3Path: true,
        createdAt: true,
        thumbnail: true
      },
    });
    if (!video) throw CustomErrorHandler.notFound();
    let preSignedUrl = null;
    if (video.transcodeStatus === "COMPLETED") {
      if (format === "undefined" || !video.transcodedFormats.includes(format)) {
        // @ts-ignore
        format = video.transcodedFormats[0].split("_")[1] + "p";
      } else format = format.split("_")[1] + "p";
      const fileNameWithoutExt = video.fileName.split(".").slice(0, -1);
      preSignedUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: AWS_S3_BUCKET_NAME,
          Key: `transcoded/${payload.username}/${id}/${format}/${fileNameWithoutExt}-${format}.m3u8`,
        }),
        {
          expiresIn: 3600, // 1hr
        }
      );
    }
    res.status(200).json({ ...video, preSignedUrl });
  } catch (err) {
    return next(err);
  }
};

export const getVideos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const payload = req.user as TOKEN_PAYLOAD;
    const video = await db.video.findMany({
      where: { username: payload.username },
      select: {
        id: true,
        fileName: true,
        multipartUploadId: true,
        originalS3Path: true,
        uploadProgress: true,
        uploadStatus: true,
        transcodeStatus: true,
        transcodedFormats: true,
        transcodedS3Path: true,
        transcodeProgress: true,
        createdAt: true,
        thumbnail: true,
      },
    });
    res.status(200).json(video);
  } catch (err) {
    return next(err);
  }
};
