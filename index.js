import path from "path";
import fs from "fs/promises";
import { exists } from "fs";
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
  const promisesToBeCompleted = [];

  for (const sourceVideo of sourceVideos) {
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

    promisesToBeCompleted.push(
      execPromise(
        `ffmpeg -i ${sourceVideoPath} -c:v copy -c:a aac -strict experimental ${destinationVideoPath}`
      )
    );
  }

  await Promise.all(promisesToBeCompleted);
};
bootstrapApp();
