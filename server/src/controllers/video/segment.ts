import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import s3Client from "../../services/s3Client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { AWS_S3_BUCKET_NAME } from "../../config";

export const getSegment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const payload = req.user as TOKEN_PAYLOAD;
    const schema = z
      .object({
        segmentUrl: z.string().url(),
      })
      .strict();
    const { segmentUrl } = schema.parse(req.body);
    // https://video-transcoding-anugoyal998.s3.eu-north-1.amazonaws.com/transcoded/anugoyal998/cm52phmr10001kssklnkav59c/240p/segment_0.ts
    const segmentPath = segmentUrl.split(
      "https://video-transcoding-anugoyal998.s3.eu-north-1.amazonaws.com/"
    )[1];
    const preSignedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({ Bucket: AWS_S3_BUCKET_NAME, Key: segmentPath }),
      {
        expiresIn: 10 * 60, // 10 min
      }
    );
    res.status(200).json({ preSignedUrl })
  } catch (err) {
    return next(err);
  }
};
