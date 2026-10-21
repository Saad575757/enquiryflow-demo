/**
 * Measures how much each frame of a clip differs from the one before it.
 *
 * Screen recordings are mostly static: the presenter pauses while the viewer
 * reads, and the page does nothing. This produces a per-frame "motion" profile
 * that the editor uses to find (and cut) dead air.
 *
 *   node scripts/walkthrough/analyze.mjs raw/02-dashboard.webm
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";

const run = promisify(execFile);

const WIDTH = 320;
const HEIGHT = 180;
const FPS = 10;

export async function motionProfile(file) {
  const { stdout } = await run(
    ffmpegPath.path,
    [
      "-i",
      file,
      "-vf",
      `fps=${FPS},scale=${WIDTH}:${HEIGHT},format=gray`,
      "-f",
      "rawvideo",
      "-pix_fmt",
      "gray",
      "-",
    ],
    { encoding: "buffer", maxBuffer: 1024 * 1024 * 1024 },
  );

  const frameSize = WIDTH * HEIGHT;
  const frames = Math.floor(stdout.length / frameSize);
  const diffs = [];

  for (let i = 1; i < frames; i += 1) {
    const a = (i - 1) * frameSize;
    const b = i * frameSize;
    let sum = 0;
    let changed = 0;

    for (let p = 0; p < frameSize; p += 1) {
      const d = Math.abs(stdout[b + p] - stdout[a + p]);
      sum += d;
      if (d > 14) changed += 1;
    }

    diffs.push({
      t: i / FPS,
      mean: sum / frameSize,
      changed: changed / frameSize,
    });
  }

  return { diffs, frames, duration: frames / FPS };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const ROOT = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(ROOT, process.argv[2]);

  const { diffs, duration } = await motionProfile(file);
  console.log(`duration ${duration.toFixed(2)}s`);

  let maxMean = 0;
  let maxChanged = 0;
  for (const d of diffs) {
    maxMean = Math.max(maxMean, d.mean);
    maxChanged = Math.max(maxChanged, d.changed);
  }
  console.log(`max mean=${maxMean.toFixed(3)}  max changed=${(maxChanged * 100).toFixed(3)}%`);

  const bucket = 0.5;
  const rows = new Map();
  for (const d of diffs) {
    const key = Math.floor(d.t / bucket) * bucket;
    const row = rows.get(key) ?? { mean: 0, changed: 0, avg: 0, n: 0 };
    row.mean = Math.max(row.mean, d.mean);
    row.changed = Math.max(row.changed, d.changed);
    row.avg += d.changed;
    row.n += 1;
    rows.set(key, row);
  }

  for (const [key, row] of rows) {
    const bar = "#".repeat(Math.min(60, Math.round(row.avg * 1200)));
    console.log(
      `${key.toFixed(1).padStart(6)}s mean=${row.mean.toFixed(3).padStart(7)} changed=${(row.changed * 100)
        .toFixed(3)
        .padStart(7)}% avg=${((row.avg / row.n) * 100).toFixed(3).padStart(7)}% ${bar}`,
    );
  }
}
