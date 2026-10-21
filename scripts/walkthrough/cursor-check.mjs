/**
 * Decisive pixel checks for the injected cursor and caption bar.
 *
 * A magenta marker is planted at a known position, the pointer is moved onto
 * it, and the region is printed as a fine ASCII map. The marker proves the
 * screencast is capturing live page content; the arrow proves the cursor
 * overlay is being recorded.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { CURSOR_SCRIPT, createStage, VIEWPORT } from "./stage.mjs";

const BASE = process.env.BASE_URL ?? "http://localhost:3112";
const ROOT = path.dirname(fileURLToPath(import.meta.url));
await mkdir(path.join(ROOT, "inspect"), { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
const page = await context.newPage();
await page.addInitScript(CURSOR_SCRIPT);
const stage = createStage(page);

await page.goto(`${BASE}/`, { waitUntil: "load" });
await page.waitForSelector("text=Enquiry volume", { timeout: 25000 });
await page.waitForTimeout(1500);

// Plant a magenta marker under the pointer.
await page.evaluate(() => {
  const marker = document.createElement("div");
  marker.id = "wf-marker";
  marker.style.cssText =
    "position:fixed;left:820px;top:420px;width:200px;height:160px;background:#ff00ff;z-index:1;";
  document.body.appendChild(marker);
});

await stage.glideToPoint(920, 500, { duration: 600 });
await page.waitForTimeout(600);

const cursorBox = await page.evaluate(() => {
  const el = document.getElementById("wf-cursor");
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height, opacity: getComputedStyle(el).opacity };
});

console.log("cursor element:", JSON.stringify(cursorBox));

await page.screenshot({ path: path.join(ROOT, "inspect", "cursor-check.png") });

const map = await page.evaluate(async () => {
  const el = document.getElementById("wf-marker");
  const r = el.getBoundingClientRect();
  const x0 = Math.round(r.x) - 40;
  const y0 = Math.round(r.y) - 40;
  const w = 280;
  const h = 240;

  // Read the pixels straight from a fresh screenshot of that region.
  return { x0, y0, w, h };
});

console.log("region:", JSON.stringify(map));

// Render the region as text from the saved screenshot.
const { execFile } = await import("node:child_process");
const { promisify } = await import("node:util");
const ffmpegPath = (await import("@ffmpeg-installer/ffmpeg")).default;
const run = promisify(execFile);

const crop = path.join(ROOT, "inspect", "cursor-crop.png");
await run(ffmpegPath.path, [
  "-y",
  "-i",
  path.join(ROOT, "inspect", "cursor-check.png"),
  "-vf",
  `crop=${map.w}:${map.h}:${map.x0}:${map.y0}`,
  crop,
]);

const { readFile } = await import("node:fs/promises");
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
  const cols = 70;
  const rows = 30;
  for (let row = 0; row < rows; row += 1) {
    let line = "";
    for (let col = 0; col < cols; col += 1) {
      const x = Math.floor((col * canvas.width) / cols);
      const y = Math.floor((row * canvas.height) / rows);
      const i = (y * canvas.width + x) * 4;
      const r = px[i];
      const g = px[i + 1];
      const b = px[i + 2];
      if (r > 200 && g < 60 && b > 200) {
        line += "M"; // magenta marker
        continue;
      }
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      line += luma > 235 ? " " : luma > 200 ? "." : luma > 150 ? ":" : luma > 90 ? "*" : "#";
    }
    lines.push(line);
  }
  return lines.join("\n");
}, data);

console.log(ascii);

await browser.close();
