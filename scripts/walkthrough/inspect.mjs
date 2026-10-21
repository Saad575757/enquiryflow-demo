/**
 * Turns video frames into text so a recording can be checked without an image
 * viewer. Usage:
 *
 *   node scripts/walkthrough/inspect.mjs raw/02-dashboard.webm 3 12 25
 */
import { chromium } from "playwright";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";

const run = promisify(execFile);

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const TMP = path.join(ROOT, "inspect");

const [, , videoArg, ...timeArgs] = process.argv;
if (!videoArg) {
  console.error("usage: node inspect.mjs <video> [time ...]");
  process.exit(1);
}

const video = path.isAbsolute(videoArg)
  ? videoArg
  : path.join(ROOT, videoArg);
const times = timeArgs.length
  ? timeArgs.map(Number)
  : [2, 6, 10, 14, 18, 22, 26];

await mkdir(TMP, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();

for (const t of times) {
  const name = `frame-${t}.png`;
  const target = path.join(TMP, name);

  await run(ffmpegPath.path, [
    "-y",
    "-ss",
    String(t),
    "-i",
    video,
    "-frames:v",
    "1",
    target,
  ]);

  const data = (await readFile(target)).toString("base64");

  const map = await page.evaluate(async (base64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${base64}`;
    await img.decode();

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const { data: pixels } = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const ramp = " .:-=+*#%@";

    const render = (x0, y0, w, h, cols, rows) => {
      const lines = [];
      for (let row = 0; row < rows; row += 1) {
        let line = "";
        for (let col = 0; col < cols; col += 1) {
          const px = Math.floor(x0 + (col * w) / cols);
          const py = Math.floor(y0 + (row * h) / rows);
          const i = (py * canvas.width + px) * 4;
          const luma =
            0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
          line += ramp[Math.min(9, Math.floor((luma / 255) * 10))];
        }
        lines.push(line);
      }
      return lines.join("\n");
    };

    return {
      full: render(0, 0, canvas.width, canvas.height, 118, 44),
      bottom: render(0, canvas.height - 150, canvas.width, 150, 118, 12),
    };
  }, data);

  console.log(`\n===== ${path.basename(video)} @ ${t}s =====`);
  console.log(map.full);
  console.log("--- bottom 150px ---");
  console.log(map.bottom);
}

await browser.close();
