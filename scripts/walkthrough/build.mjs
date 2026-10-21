/**
 * Cuts the recorded scenes into the final walkthrough.
 *
 * The raw clips contain a lot of dead air: the page settles, the presenter
 * waits, the viewer reads the caption. This script measures motion frame by
 * frame and shortens the static runs, but it protects every stretch where a
 * caption is on screen — that is reading time, not dead air.
 *
 *   node scripts/walkthrough/build.mjs
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";

import { motionProfile } from "./analyze.mjs";

const run = promisify(execFile);

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(ROOT, "raw");
const OUT = path.join(ROOT, "out");

/** A static run shorter than this is a natural pause and is left alone. */
const MIN_DEAD = 0.9;
/** How much of an unprotected static run is kept. */
const KEEP_DEAD = 0.4;
/** Dip to black between sections. */
const FADE = 0.28;
/** Cards (title / outro) need a longer hold so they can be read. */
const CARD_HOLD = 3.8;
/** How long the card takes to fade in. */
const CARD_FADE = 0.7;
/** Slack around a caption window, to absorb recording start-up jitter. */
const CAPTION_PAD = 0.45;

const cardScenes = new Set(["01-title", "13-outro"]);

const files = (await readdir(RAW))
  .filter((name) => name.endsWith(".webm"))
  .sort();

if (!files.length) {
  console.error("no clips found — run record.mjs first");
  process.exit(1);
}

const manifest = await readFile(path.join(RAW, "manifest.json"), "utf8")
  .then((text) => JSON.parse(text))
  .catch(() => ({ scenes: [] }));

const captionWindows = new Map(
  manifest.scenes.map((scene) => [scene.id, scene.captions ?? []]),
);
const cardWindows = new Map(
  manifest.scenes.map((scene) => [scene.id, scene.cards ?? []]),
);

/**
 * The stretches of a clip where a caption was on screen. These are never cut.
 */
function protectedRanges(captions, duration) {
  return captions
    .filter((c) => typeof c.from === "number")
    .map((c) => [
      Math.max(0, c.from - CAPTION_PAD),
      Math.min(duration, (c.to ?? duration) + CAPTION_PAD),
    ])
    .sort((a, b) => a[0] - b[0]);
}

function isProtected(range, windows) {
  return windows.some(
    ([from, to]) => range[0] < to && range[1] > from,
  );
}

/**
 * Splits a clip into the ranges worth keeping.
 */
function keepRanges(diffs, duration, isCard, captions, cards) {
  const FPS = 10;
  const THRESHOLD = 0.0001; // 0.01% of pixels changing by >14 levels

  const activity = diffs.map((d) => d.changed);
  const smooth = activity.map((_, i) => {
    let sum = 0;
    let n = 0;
    for (
      let k = Math.max(0, i - 2);
      k <= Math.min(activity.length - 1, i + 2);
      k += 1
    ) {
      sum += activity[k];
      n += 1;
    }
    return sum / n;
  });

  const windows = protectedRanges(captions ?? [], duration);

  // Split the clip into alternating runs of motion and stillness.
  const runs = [];
  let runStart = 0;
  let still = smooth[0] <= THRESHOLD;

  for (let i = 1; i < smooth.length; i += 1) {
    const nowStill = smooth[i] <= THRESHOLD;
    if (nowStill !== still) {
      runs.push({ still, from: runStart / FPS, to: i / FPS });
      runStart = i;
      still = nowStill;
    }
  }
  runs.push({ still, from: runStart / FPS, to: duration });

  const ranges = [];
  for (const run of runs) {
    const length = run.to - run.from;
    if (length <= 0) continue;

    if (!run.still) {
      ranges.push([run.from, run.to]);
      continue;
    }

    // Stillness with a caption on screen is reading time — keep all of it.
    if (isProtected([run.from, run.to], windows)) {
      ranges.push([run.from, run.to]);
      continue;
    }

    if (length > MIN_DEAD) {
      ranges.push([run.from, Math.min(run.to, run.from + KEEP_DEAD)]);
    } else {
      ranges.push([run.from, run.to]);
    }
  }

  if (isCard) {
    // Cards are static by design: keep the fade-in and a long hold on the
    // card itself, and drop the dashboard that was behind it.
    const card = (cards ?? [])[0];
    const from = card
      ? Math.max(0, card.from - 0.1)
      : Math.max(0, overlayStart(diffs) - 0.2);
    const to = card
      ? Math.min(duration, card.from + CARD_FADE + CARD_HOLD)
      : Math.min(duration, from + 0.3 + CARD_HOLD);
    return [[from, to]];
  }

  return merge(ranges);
}

/**
 * Joins ranges that touch or overlap, so the ffmpeg graph stays small.
 */
function merge(ranges) {
  const sorted = ranges
    .filter(([a, b]) => b > a)
    .sort((a, b) => a[0] - b[0]);
  const merged = [];

  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1] + 0.05) {
      last[1] = Math.max(last[1], range[1]);
    } else {
      merged.push([...range]);
    }
  }

  return merged;
}

/**
 * The title and outro cards fade a full-screen scrim over the app, which is
 * the only moment in those clips where every pixel changes at once.
 */
function overlayStart(diffs) {
  for (const d of diffs) {
    if (d.mean > 25) return Math.max(0, d.t - 0.15);
  }
  return 0;
}

const clips = [];

for (const file of files) {
  const id = file.replace(/\.webm$/, "");
  const full = path.join(RAW, file);
  const { diffs, duration } = await motionProfile(full);
  const isCard = cardScenes.has(id);
  const ranges = keepRanges(
    diffs,
    duration,
    isCard,
    captionWindows.get(id),
    cardWindows.get(id),
  );

  const kept = ranges.reduce((sum, [a, b]) => sum + (b - a), 0);
  clips.push({ id, file: full, ranges, duration, kept });

  console.log(
    `${id.padEnd(16)} ${duration.toFixed(2)}s -> ${kept.toFixed(2)}s  ` +
      `(${ranges.length} segment${ranges.length === 1 ? "" : "s"})`,
  );
}

const totalRaw = clips.reduce((sum, c) => sum + c.duration, 0);
const totalKept = clips.reduce((sum, c) => sum + c.kept, 0);
console.log(
  `\ntotal ${totalRaw.toFixed(1)}s -> ${totalKept.toFixed(1)}s ` +
    `(${Math.round((1 - totalKept / totalRaw) * 100)}% dead air removed)\n`,
);

// ---------------------------------------------------------------------------
// One ffmpeg pass: trim every segment, join the segments of a clip, fade the
// clip in and out, then join the clips.
// ---------------------------------------------------------------------------
const lines = [];
const clipLabels = [];

clips.forEach((clip, index) => {
  const segLabels = [];

  clip.ranges.forEach(([from, to], segIndex) => {
    const label = `s${index}_${segIndex}`;
    // No fps filter: the recordings are already constant 25fps, and running
    // them through `fps` before `concat` corrupts the segment durations.
    lines.push(
      `[${index}:v]trim=start=${from.toFixed(3)}:end=${to.toFixed(3)},` +
        `setpts=PTS-STARTPTS,format=yuv420p[${label}]`,
    );
    segLabels.push(`[${label}]`);
  });

  const joined = `c${index}`;
  lines.push(
    `${segLabels.join("")}concat=n=${segLabels.length}:v=1:a=0[${joined}]`,
  );

  const out = `v${index}`;
  const fadeOut = Math.max(0, clip.kept - FADE);
  lines.push(
    `[${joined}]fade=t=in:st=0:d=${FADE},fade=t=out:st=${fadeOut.toFixed(3)}:d=${FADE}[${out}]`,
  );
  clipLabels.push(`[${out}]`);
});

lines.push(`${clipLabels.join("")}concat=n=${clips.length}:v=1:a=0[out]`);

const filterFile = path.join(OUT, "filter.txt");
await mkdir(OUT, { recursive: true });
await writeFile(filterFile, lines.join(";\n"));

// The edit plan, so the verifier can cross-check the finished video against
// the captions that were meant to survive.
let cursor = 0;
const plan = clips.map((clip) => {
  const entry = { id: clip.id, from: cursor, ranges: clip.ranges };
  cursor += clip.kept;
  entry.to = cursor;
  return entry;
});
await writeFile(
  path.join(OUT, "plan.json"),
  JSON.stringify({ duration: cursor, clips: plan }, null, 2),
);

const output = path.join(OUT, "EnquiryFlow-product-walkthrough.mp4");
await rm(output, { force: true });

console.log("encoding ...");
const started = Date.now();

await run(
  ffmpegPath.path,
  [
    "-y",
    ...clips.flatMap((clip) => ["-i", clip.file]),
    "-filter_complex_script",
    filterFile,
    "-map",
    "[out]",
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "20",
    "-pix_fmt",
    "yuv420p",
    "-profile:v",
    "high",
    "-level",
    "4.1",
    "-movflags",
    "+faststart",
    output,
  ],
  { maxBuffer: 1024 * 1024 * 512 },
);

console.log(
  `done in ${((Date.now() - started) / 1000).toFixed(0)}s -> ${output}`,
);

const probe = await run(
  ffmpegPath.path,
  ["-hide_banner", "-i", output],
  { maxBuffer: 1024 * 1024 * 64 },
).catch((error) => ({ stderr: error.stderr ?? "" }));

const measured = /Duration: (\d+):(\d+):([\d.]+)/.exec(probe.stderr ?? "");
if (measured) {
  const seconds =
    Number(measured[1]) * 3600 + Number(measured[2]) * 60 + Number(measured[3]);
  console.log(`final duration ${seconds.toFixed(2)}s (${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")})`);
}
