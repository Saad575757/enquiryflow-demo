/**
 * Pixel check for the caption bar: prints the pill region as a fine ASCII map
 * so the rendered text can be confirmed.
 */
import { chromium } from "playwright";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";

import { CURSOR_SCRIPT, createStage, VIEWPORT } from "./stage.mjs";

const BASE = process.env.BASE_URL ?? "http://localhost:3112";
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const run = promisify(execFile);

await mkdir(path.join(ROOT, "inspect"), { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
const page = await context.newPage();
await page.addInitScript(CURSOR_SCRIPT);
const stage = createStage(page);

await page.goto(`${BASE}/`, { waitUntil: "load" });
await page.waitForSelector("text=Enquiry volume", { timeout: 25000 });
await page.waitForTimeout(1500);

await stage.caption(
  "One screen for the whole pipeline — open enquiries, overdue actions and conversion rate.",
);
await page.waitForTimeout(1200);

const pill = await page.evaluate(() => {
  const el = document.querySelector("#wf-caption > div");
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
});

console.log("caption pill box:", JSON.stringify(pill));

await page.screenshot({ path: path.join(ROOT, "inspect", "caption-check.png") });

const crop = path.join(ROOT, "inspect", "caption-crop.png");
await run(ffmpegPath.path, [
  "-y",
  "-i",
  path.join(ROOT, "inspect", "caption-check.png"),
  "-vf",
  `crop=${Math.round(pill.w)}:${Math.round(pill.h)}:${Math.round(pill.x)}:${Math.round(pill.y)}`,
  crop,
]);

const data = (await readFile(crop)).toString("base64");

const ascii = await page.evaluate(async (base64) => {
  const img = new Image();
  img.src = `data:image/png;base64,${base64}`;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const { data: px } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const lines = [];
  const cols = 150;
  const rows = 16;
  for (let row = 0; row < rows; row += 1) {
    let line = "";
    for (let col = 0; col < cols; col += 1) {
      const x = Math.floor((col * canvas.width) / cols);
      const y = Math.floor((row * canvas.height) / rows);
      const i = (y * canvas.width + x) * 4;
      const r = px[i];
      const g = px[i + 1];
      const b = px[i + 2];
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      line += luma > 200 ? "#" : luma > 140 ? "+" : luma > 80 ? "." : " ";
    }
    lines.push(line);
  }
  return lines.join("\n");
}, data);

console.log(ascii);

await browser.close();
