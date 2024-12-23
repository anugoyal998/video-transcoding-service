// import ffmpeg from "fluent-ffmpeg";
// import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { getResolutionInfo } from "./services/getResolutionInfo";
import { SupportedTranscodingFormats } from "@prisma/client";
import path from "path";
import { exec } from "child_process";
import fs from "fs/promises";

//       const command = `ffmpeg -i "${originalVideoPath}" \
        //       -profile:v baseline \
        //       -level 3.0 \
        //       -start_number 0 \
        //       -hls_time 30 \
        //       -hls_list_size 0 \
        //       -c:v libx264 \
        //       -c:a aac \
        //       -f hls \
        //       -hls_segment_filename ${outputSegmentPath} \
        //       -vf scale=${formatInfo.width}:${formatInfo.height} \
        //       "${outputIndexPath}"
        // `;

async function fn() {
  const username = "anugoyal998";
  const videoId = "cm4wxeotd0001ksk4xeruia8n";
  const transcodedFormats: SupportedTranscodingFormats[] = ["FORMAT_360"];
  const format = transcodedFormats[0];
  const formatInfo = getResolutionInfo(format);
  const fileName = "videoplayback (1).mp4";
  const fileNameWithoutExt = fileName.split(".").slice(0, -1);
  const originalFilePath = `src/video/original/${fileName}`;
  const outputFolder = `src/video/transcoded/${username}/${videoId}/${formatInfo.name}`;
  const outputFilePath = `${outputFolder}/${fileNameWithoutExt}-${formatInfo.name}.m3u8`;
  const outputVideoPath = path.resolve(outputFilePath);
  //   console.log(ffmpegInstaller.path)
  //   await new Promise((resolve, reject) => {
  //     ffmpeg(originalFilePath)
  //       .setFfmpegPath(ffmpegInstaller.path)
  //       .outputOptions([
  //         "-hls_time 10",
  //         "-hls_list_size 0",
  //         "-c:v h264",
  //         "-c:a aac",
  //       ])
  //       .on("start", () => console.log("Transcoding started..."))
  //       .on("error", (error) => console.log(error))
  //       .on("end", () => console.log("transcoding completed..."))
  //       .output(outputVideoPath)
  //       .run()
  //   });
}

async function fn1() {
  const resolution = "480:360";
  const username = "anugoyal998";
  const videoId = "cm4wxeotd0001ksk4xeruia8n";
  const transcodedFormats: SupportedTranscodingFormats[] = ["FORMAT_360"];
  const format = transcodedFormats[0];
  const formatInfo = getResolutionInfo(format);
  const fileName = "videoplayback (1).mp4";
  const fileNameWithoutExt = fileName.split(".").slice(0, -1);
  const originalFilePath = `src/video/original/${fileName}`;
  const originalVideoPath = path.resolve(originalFilePath);
  const outputFolder = `src/video/transcoded/${username}/${videoId}/${formatInfo.name}`;
  const outputFilePath = `${outputFolder}/${fileNameWithoutExt}-${formatInfo.name}.m3u8`;
  const outputIndexPath = path.resolve(outputFilePath);
  const outputSegmentPath = path.resolve(`${outputFolder}/segment_%03d.ts`);
  await fs.mkdir(outputFolder, { recursive: true });
  const command = `ffmpeg -i "${originalVideoPath}" \
        -profile:v baseline \
        -level 3.0 \
        -start_number 0 \
        -hls_time 30 \
        -hls_list_size 0 \
        -c:v h264 \
        -c:a aac \
        -f hls \
        -hls_segment_filename ${outputSegmentPath} \
        -vf scale=${resolution} \
        "${outputIndexPath}"
  `;
  console.log(command)
}

fn1();
