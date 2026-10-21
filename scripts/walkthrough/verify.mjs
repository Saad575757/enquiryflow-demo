/**
 * Verifies the finished walkthrough.
 *
 * The video is silent and captioned, so the captions are the narration. This
 * checks that every caption survived the edit, that each scene is present,
 * and that no long frozen stretches or black frames slipped through.
 *
 *   node scripts/walkthrough/verify.mjs
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";

const run = promisify(execFile);

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(ROOT, "raw");
const OUT = path.join(ROOT, "out");

const VIDEO = path.join(OUT, "EnquiryFlow-product-walkthrough.mp4");

const FPS = 4;
const WIDTH = 1920;
/** The caption pill, cropped out of the frame so the text can be measured. */
const BAND_TOP = 986;
const BAND_HEIGHT = 62;

/** White text sitting on the dark pill counts as caption text. */
const BRIGHT = 225;
const DARK = 80;
const TEXT_THRESHOLD = 300;

const { stdout } = await run(
  ffmpegPath.path,
  [
    "-i",
    VIDEO,
    "-vf",
    `fps=${FPS},crop=${WIDTH}:${BAND_HEIGHT}:0:${BAND_TOP},format=gray`,
    "-f",
    "rawvideo",
    "-pix_fmt",
    "gray",
    "-",
  ],
  { encoding: "buffer", maxBuffer: 1024 * 1024 * 1024 },
);

const frameSize = WIDTH * BAND_HEIGHT;
const frames = Math.floor(stdout.length / frameSize);
const duration = frames / FPS;

console.log(`video ${duration.toFixed(2)}s, ${frames} sampled frames\n`);

// ---------------------------------------------------------------------------
// Caption runs: contiguous stretches where caption text is visible.
// ---------------------------------------------------------------------------
const captionAt = [];

for (let i = 0; i < frames; i += 1) {
  const base = i * frameSize;
  let text = 0;

  for (let y = 0; y < BAND_HEIGHT; y += 2) {
    const row = base + y * WIDTH;
    for (let x = 2; x < WIDTH - 2; x += 1) {
      if (stdout[row + x] > BRIGHT) {
        const before = stdout[row + x - 3];
        const after = stdout[row + x + 3];
        if (before < DARK || after < DARK) text += 1;
      }
    }
  }

  captionAt.push({ t: i / FPS, text, on: text > TEXT_THRESHOLD });
}

const runs = [];
let current = null;
for (const f of captionAt) {
  if (f.on) {
    if (!current) current = { from: f.t, to: f.t + 1 / FPS, peak: f.text };
    current.to = f.t + 1 / FPS;
    current.peak = Math.max(current.peak, f.text);
  } else if (current) {
    runs.push(current);
    current = null;
  }
}
if (current) runs.push(current);

console.log(`caption runs found: ${runs.length}`);
for (const run of runs) {
  console.log(
    `  ${run.from.toFixed(2).padStart(7)}s -> ${run.to.toFixed(2).padStart(7)}s  ` +
      `${(run.to - run.from).toFixed(2)}s  (peak ${run.peak} px)`,
  );
}

// ---------------------------------------------------------------------------
// Expected captions: project the recorded captions through the edit plan.
// ---------------------------------------------------------------------------
const manifest = JSON.parse(await readFile(path.join(RAW, "manifest.json"), "utf8"));
const plan = JSON.parse(await readFile(path.join(OUT, "plan.json"), "utf8"));

const expected = [];
for (const clip of plan.clips) {
  const scene = manifest.scenes.find((s) => s.id === clip.id);
  if (!scene) continue;

  for (const caption of scene.captions ?? []) {
    for (const [rawFrom, rawTo] of clip.ranges) {
      const from = Math.max(caption.from, rawFrom);
      const to = Math.min(caption.to ?? rawTo, rawTo);
      if (to - from > 0.15) {
        expected.push({
          id: clip.id,
          from: clip.from + (from - rawFrom),
          to: clip.from + (to - rawFrom),
        });
      }
    }
  }
}

console.log(`\ncaptions expected from the edit plan: ${expected.length}`);
let missing = 0;
for (const want of expected) {
  const mid = (want.from + want.to) / 2;
  const hit = captionAt.find((f) => Math.abs(f.t - mid) < 0.2);
  const ok = hit?.on;
  if (!ok) missing += 1;
  console.log(
    `  ${want.id.padEnd(15)} ${want.from.toFixed(2).padStart(7)}s -> ${want.to
      .toFixed(2)
      .padStart(7)}s  ${ok ? "ok" : `MISSING (${hit?.text ?? 0} px)`}`,
  );
}

// ---------------------------------------------------------------------------
// Scene coverage: every recorded scene must appear in the finished video.
// ---------------------------------------------------------------------------
console.log("");
for (const clip of plan.clips) {
  const scene = manifest.scenes.find((s) => s.id === clip.id);
  const captions = scene?.captions?.length ?? 0;
  console.log(
    `  ${clip.id.padEnd(15)} ${clip.from.toFixed(2).padStart(7)}s -> ${clip.to
      .toFixed(2)
      .padStart(7)}s  (${(clip.to - clip.from).toFixed(2)}s, ${captions} caption${
      captions === 1 ? "" : "s"
    })`,
  );
}

// ---------------------------------------------------------------------------
// Frozen stretches and black frames.
// ---------------------------------------------------------------------------
const { stderr } = await run(ffmpegPath.path, [
  "-hide_banner",
  "-i",
  VIDEO,
  "-vf",
  "freezedetect=n=0.003:d=2.5,blackdetect=d=0.6:pix_th=0.10",
  "-an",
  "-f",
  "null",
  "-",
]).catch((error) => ({ stderr: error.stderr ?? "" }));

const freezes = [...(stderr ?? "").matchAll(/freeze_duration: ([\d.]+)/g)].map(
  (m) => Number(m[1]),
);
const blacks = [...(stderr ?? "").matchAll(/black_duration:([\d.]+)/g)].map((m) =>
  Number(m[1]),
);

console.log(
  `\nfrozen stretches over 2.5s: ${freezes.length}` +
    (freezes.length ? ` (longest ${Math.max(...freezes).toFixed(2)}s)` : ""),
);
console.log(
  `black stretches over 0.6s: ${blacks.length}` +
    (blacks.length ? ` (longest ${Math.max(...blacks).toFixed(2)}s)` : ""),
);

console.log(
  `\nresult: ${missing === 0 ? "all captions present" : `${missing} caption(s) missing`}`,
);
process.exit(missing === 0 ? 0 : 1);
