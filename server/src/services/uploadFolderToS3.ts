import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "./s3Client";
import fs from "fs/promises";
import path from "path";
import { Job } from "bullmq";

export const uploadFolderToS3 = async ({
  localFolder,
  remoteFolder,
  bucketName,
  job,
}: {
  localFolder: string;
  remoteFolder: string;
  bucketName: string;
  job?: Job;
}) => {
  const contents = await fs.readdir(localFolder, { withFileTypes: true });
  if (!contents || contents.length === 0) return;

  for (const content of contents) {
    const contentPath = path.join(localFolder, content.name);
    if (content.isDirectory()) {
      await uploadFolderToS3({
        localFolder: contentPath,
        remoteFolder: path.join(remoteFolder, content.name),
        bucketName,
        job,
      });
      if (job) {
        await job.updateProgress({
          action: "UPLOADED",
          folderPath: contentPath,
          isRootFolder: false,
        });
      }
    } else {
      const fileContent = await fs.readFile(contentPath);
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: path.join(remoteFolder, content.name).replace(/\\/g, "/"),
          Body: fileContent,
        })
      );
    }
  }

  //   fs.readdir(localFolder, async (error, contents) => {
  //     if (error) throw error;
  //     if (!contents || contents.length === 0) return;

  //     for (const content of contents) {
  //       const contentPath = path.join(localFolder, content);
  //       if (fs.lstatSync(contentPath).isDirectory()) {
  //         await uploadFolderToS3({
  //           localFolder: contentPath,
  //           remoteFolder: path.join(remoteFolder, content),
  //           bucketName,
  //         });
  //         if (job)
  //           await job.updateProgress({
  //             action: "UPLOADED",
  //             folderPath: contentPath,
  //             isRootFolder: false,
  //           });
  //       } else {
  //         fs.readFile(contentPath, async (error, fileContent) => {
  //           if (error) throw error;
  //           await s3Client.send(
  //             new PutObjectCommand({
  //               Bucket: bucketName,
  //               Key: path.join(remoteFolder, content).replace(/\\/g, "/"),
  //               Body: fileContent,
  //             })
  //           );
  //         });
  //       }
  //     }
  //   });
};
