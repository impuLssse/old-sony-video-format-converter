import path from "path";
import { exists } from "fs";
import fs from "fs/promises";
import { promisify } from "util";
import { exec } from "child_process";
const execPromise = promisify(exec);
const existsPromise = promisify(exists);

const sourceDirectory = path.resolve(
  "/Volumes/Untitled/private/AVCHD/BDMV/STREAM"
);
const outputDirectory = path.resolve(
  "/Users/maximsafronov/Movies/AVCHD_TO_MP4_SYNCED"
);

const bootstrapApp = async () => {
  const sourceVideos = await fs.readdir(sourceDirectory);
  const videoPlaylists = [];
  const videoLimit = 6;

  let addedVideoCounter = 0;
  for (let v = 0; v < sourceVideos.length; v++) {
    const sourceVideo = sourceVideos.find((_, i) => i == v);
    if (sourceVideo.includes("_")) {
      continue;
    }

    const sourceVideoPath = path.join(
      path.resolve(sourceDirectory, sourceVideo)
    );
    const mtsToMp4Renamed =
      sourceVideo
        .split(".")
        .filter((word) => word !== "MTS")
        .join() + ".mp4";
    const destinationVideoPath = path.join(
      path.resolve(outputDirectory, mtsToMp4Renamed)
    );

    if (await existsPromise(destinationVideoPath)) {
      console.log(`Skip already exists:`, sourceVideo);
      continue;
    }

    const ffmpegCommand = `ffmpeg -i ${sourceVideoPath} -c:v libx264 -profile:v high -level 4.1 -movflags +faststart -c:a aac ${destinationVideoPath}`;

    if (addedVideoCounter % videoLimit == 0) {
      // Создаём новый массив в двумерном массиве вида [..., [вот такой новый]]
      videoPlaylists.push([ffmpegCommand]);
      addedVideoCounter++;
    } else {
      if (!Array.isArray(videoPlaylists[videoPlaylists.length - 1])) {
        videoPlaylists[videoPlaylists.length] = [];
      }

      // В последний элемент массива [[..., сюда]] добавляем новый child_process
      videoPlaylists[videoPlaylists.length - 1].push(ffmpegCommand);
      addedVideoCounter++;
    }
  }

  console.log(videoPlaylists);
  for (let p = 0; p < videoPlaylists.length; p++) {
    console.log(`Загружаю ${p + 1}-ую часть`);
    await Promise.all(videoPlaylists[p].map((command) => execPromise(command)));
  }
};
bootstrapApp();
