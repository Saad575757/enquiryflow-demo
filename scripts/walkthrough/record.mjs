/**
 * Records the EnquiryFlow product walkthrough.
 *
 * Each scene is captured in its own browser context so the recordings can be
 * cut together afterwards, and so a crash in one scene never takes the whole
 * run down. The caption timeline is written to the manifest so the editor
 * knows which stretches of footage the viewer still needs to read.
 *
 *   node scripts/walkthrough/record.mjs
 */
import { chromium } from "playwright";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import {
  CURSOR_SCRIPT,
  createStage,
  isoDate,
  VIEWPORT,
} from "./stage.mjs";

const BASE = process.env.BASE_URL ?? "http://localhost:3112";
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(ROOT, "raw");

const FEATURED_TITLE = "Curriculum audit for a MAT with nine schools";

const state = { detailUrl: null, createdUrl: null };

async function open(page, url) {
  const target = url.startsWith("http") ? url : `${BASE}${url}`;
  await page.goto(target, { waitUntil: "load" });
  await page.waitForTimeout(700);
}

/** Scrolls an element into a comfortable reading position. */
async function scrollToElement(page, stage, locator, offset = -140) {
  const box = await locator.boundingBox();
  if (!box) return;
  const scrollY = await page.evaluate(() => window.scrollY);
  await stage.scrollTo(Math.max(0, box.y + scrollY + offset), { duration: 850 });
}

/**
 * Resolves the enquiry used across the walkthrough, so every scene can be
 * recorded on its own.
 */
async function ensureDetailUrl(page) {
  if (state.detailUrl) return state.detailUrl;

  await page.goto(`${BASE}/enquiries`, { waitUntil: "load" });
  await page.waitForSelector("table tbody tr", { timeout: 25000 });
  const href = await page
    .locator("table tbody tr td a", { hasText: FEATURED_TITLE })
    .first()
    .getAttribute("href");

  state.detailUrl = `${BASE}${href}`;
  return state.detailUrl;
}

const scenes = [
  {
    id: "01-title",
    async run(page, stage) {
      await open(page, "/");
      await page.waitForSelector("text=Enquiry volume", { timeout: 25000 });
      await page.waitForTimeout(900);

      await stage.overlayCard({
        eyebrow: "Product walkthrough",
        title: "EnquiryFlow",
        subtitle:
          "Every enquiry tracked from first contact to conversion — with the next action always clear.",
        footer: "Enquiry management for consultancies",
      });

      await page.waitForTimeout(4200);
    },
  },

  {
    id: "02-dashboard",
    async run(page, stage) {
      await open(page, "/");
      await page.waitForSelector("text=Enquiry volume", { timeout: 25000 });
      await page.waitForTimeout(1000);

      await stage.caption(
        "One screen for the whole pipeline — open enquiries, overdue actions and conversion rate.",
      );
      await stage.glide(page.getByText("Open enquiries").first(), { duration: 550 });
      await page.waitForTimeout(800);
      await stage.glideToPoint(1480, 240, { duration: 550 });
      await page.waitForTimeout(600);

      await stage.scrollTo(560, { duration: 900 });
      await page.waitForTimeout(900);
      await stage.caption(
        "Enquiry volume and pipeline status, read live from the database.",
      );
      await stage.glide(page.getByText("Pipeline by status").first(), { duration: 550 });
      await page.waitForTimeout(1000);

      await stage.scrollTo(1250, { duration: 900 });
      await page.waitForTimeout(1000);
      await stage.caption(
        "Follow-ups due and team workload — the work that is outstanding right now.",
      );
      await stage.glide(page.getByText("Team workload").first(), { duration: 550 });
      await page.waitForTimeout(1400);

      await stage.clearCaption();
      await page.waitForTimeout(500);
    },
  },

  {
    id: "03-enquiries",
    async run(page, stage) {
      await open(page, "/enquiries");
      await page.waitForSelector("table tbody tr", { timeout: 25000 });
      await page.waitForTimeout(1000);

      await stage.caption(
        "Every enquiry in one list — search, filter and triage without leaving the page.",
      );
      await stage.glide(page.locator("table tbody tr").first(), { duration: 550 });
      await page.waitForTimeout(900);

      const search = page.getByPlaceholder(
        "Search title, contact, organisation or email…",
      );
      await stage.glide(search, { duration: 550 });
      await search.click();
      await search.pressSequentially("curriculum", { delay: 60 });
      await page.waitForTimeout(1400);

      await stage.caption(
        "Search runs across titles, contacts, organisations and email addresses.",
      );
      await page.waitForTimeout(1200);

      await page.getByRole("button", { name: "Clear filters" }).click();
      await page.waitForTimeout(1200);

      await stage.glide(page.getByLabel("Filter by status"), { duration: 550 });
      await page.getByLabel("Filter by status").click();
      await page.waitForTimeout(600);
      await stage.glide(page.getByRole("option", { name: "Awaiting response" }), {
        duration: 500,
      });
      await page.getByRole("option", { name: "Awaiting response" }).click();
      await page.waitForTimeout(1400);

      await stage.caption(
        "Stack filters together to build the exact queue you need to work through.",
      );
      await page.waitForTimeout(1400);

      await page.getByRole("button", { name: "Clear filters" }).click();
      await page.waitForTimeout(1200);
      await stage.clearCaption();
      await page.waitForTimeout(500);
    },
  },

  {
    id: "04-detail",
    async run(page, stage) {
      await open(page, "/enquiries");
      await page.waitForSelector("table tbody tr", { timeout: 25000 });
      await page.waitForTimeout(1000);

      await stage.caption(
        "Open an enquiry for the full brief, contact details and history.",
      );
      const link = page.getByRole("link", { name: FEATURED_TITLE }).first();
      await stage.glide(link, { duration: 550 });
      await link.click();

      await page.waitForSelector("text=Follow-up history", { timeout: 25000 });
      state.detailUrl = page.url();
      await page.waitForTimeout(1700);

      await stage.caption(
        "The whole story: what they need, who owns it and what happens next.",
      );
      await stage.scrollTo(430, { duration: 850 });
      await page.waitForTimeout(1100);
      await stage.scrollTo(920, { duration: 850 });
      await page.waitForTimeout(1300);

      await stage.clearCaption();
      await page.waitForTimeout(500);
    },
  },

  {
    id: "05-status",
    async run(page, stage) {
      const detailUrl = await ensureDetailUrl(page);
      await open(page, detailUrl);
      await page.waitForSelector("text=Follow-up history", { timeout: 25000 });
      await page.waitForTimeout(1000);

      await stage.caption(
        "Move an enquiry through the pipeline and assign an owner — both save instantly.",
      );
      await stage.glide(page.getByLabel("Update status"), { duration: 550 });
      await page.getByLabel("Update status").click();
      await page.waitForTimeout(600);
      await stage.glide(page.getByRole("option", { name: "Qualified" }), {
        duration: 500,
      });
      await page.getByRole("option", { name: "Qualified" }).click();
      await page.waitForTimeout(1600);

      await stage.caption(
        "Every change is confirmed with a toast and written straight to the record.",
      );
      await page.waitForTimeout(1000);

      await stage.glide(page.getByLabel("Assign owner"), { duration: 550 });
      await page.getByLabel("Assign owner").click();
      await page.waitForTimeout(600);
      await stage.glide(page.getByRole("option", { name: "Amara Okafor" }), {
        duration: 500,
      });
      await page.getByRole("option", { name: "Amara Okafor" }).click();
      await page.waitForTimeout(1600);

      await stage.caption("Owners see their own workload on the team page.");
      await page.waitForTimeout(1200);
      await stage.clearCaption();
      await page.waitForTimeout(500);
    },
  },

  {
    id: "06-followup",
    async run(page, stage) {
      const detailUrl = await ensureDetailUrl(page);
      await open(page, detailUrl);
      await page.waitForSelector("text=Follow-up history", { timeout: 25000 });
      await page.waitForTimeout(900);

      await scrollToElement(page, stage, page.getByText("Follow-up history"));
      await page.waitForTimeout(1000);

      await stage.caption(
        "Every follow-up is logged against the enquiry — the timeline is the audit trail.",
      );

      const outstanding = page
        .getByRole("button", { name: /^Mark ".*" as completed$/ })
        .first();
      await stage.glide(outstanding, { duration: 550 });
      await outstanding.click();
      await page.waitForTimeout(1600);

      await stage.caption(
        "Tick an action off to complete it, or reopen it in one click.",
      );
      await page.waitForTimeout(1100);

      const action = page.locator("#followUpAction");
      await stage.glide(action, { duration: 550 });
      await action.click();
      await action.pressSequentially(
        "Send the revised scoping document to the trust",
        { delay: 16 },
      );
      await page.waitForTimeout(500);

      await page.locator("#followUpDueAt").fill(isoDate(4));
      await page.waitForTimeout(500);

      await stage.caption(
        "Add the next action and a due date — it flows straight to the dashboard.",
      );
      await page.waitForTimeout(800);

      const addButton = page.getByRole("button", { name: "Add", exact: true });
      await stage.glide(addButton, { duration: 550 });
      await addButton.click();
      await page.waitForTimeout(1700);

      await stage.clearCaption();
      await page.waitForTimeout(600);
    },
  },

  {
    id: "07-notes",
    async run(page, stage) {
      const detailUrl = await ensureDetailUrl(page);
      await open(page, detailUrl);
      await page.waitForSelector("text=Internal notes", { timeout: 25000 });
      await page.waitForTimeout(900);

      await stage.scrollTo(1150, { duration: 850 });
      await page.waitForTimeout(1000);

      await stage.caption(
        "Keep context in internal notes that the customer never sees.",
      );

      const edit = page.getByRole("button", { name: /notes$/ }).first();
      await stage.glide(edit, { duration: 550 });
      await edit.click();
      await page.waitForTimeout(700);

      const textarea = page.locator("textarea").first();
      await stage.glide(textarea, { duration: 550 });
      await textarea.click();
      await page.keyboard.press("Control+End");
      await page.waitForTimeout(200);
      await textarea.pressSequentially(" Budget confirmed by the trust.", {
        delay: 18,
      });
      await page.waitForTimeout(700);

      const save = page.getByRole("button", { name: "Save notes" });
      await stage.glide(save, { duration: 550 });
      await save.click();
      await page.waitForTimeout(1600);

      await stage.caption("Saved to the record, visible to your team only.");
      await page.waitForTimeout(1300);
      await stage.clearCaption();
      await page.waitForTimeout(500);
    },
  },

  {
    id: "08-new-enquiry",
    async run(page, stage) {
      await open(page, "/enquiries/new");
      await page.waitForSelector("#title", { timeout: 25000 });
      await page.waitForTimeout(1000);

      await stage.caption(
        "Capture a new enquiry in seconds — every field is validated as you type.",
      );

      const type = async (selector, text, delay = 14) => {
        const field = page.locator(selector);
        await field.click();
        await field.pressSequentially(text, { delay });
      };

      await stage.glide(page.locator("#title"), { duration: 550 });
      await type("#title", "Curriculum review for a new academy trust");
      await type("#contactName", "Rachel Nkemdirim");
      await type("#organisation", "Brightpath Schools");
      await type("#email", "rachel@brightpathschools.co.uk", 10);
      await page.waitForTimeout(400);

      await stage.glide(page.locator("#enquiryType"), { duration: 550 });
      await page.locator("#enquiryType").click();
      await page.waitForTimeout(600);
      await page.getByRole("option", { name: "Training", exact: true }).click();
      await page.waitForTimeout(400);

      await stage.glide(page.locator("#assignedOwnerId"), { duration: 550 });
      await page.locator("#assignedOwnerId").click();
      await page.waitForTimeout(600);
      await page.getByRole("option", { name: "Tomas Berger" }).click();
      await page.waitForTimeout(400);

      await stage.scrollTo(700, { duration: 800 });
      await page.waitForTimeout(700);
      await type(
        "#description",
        "A whole trust wants an independent curriculum review across five schools before the new academic year.",
        8,
      );
      await page.waitForTimeout(300);

      await stage.scrollTo(1150, { duration: 800 });
      await page.waitForTimeout(700);
      await type("#nextAction", "Send the scoping document and book a discovery call");
      await page.locator("#nextActionDueAt").fill(isoDate(5));
      await page.waitForTimeout(600);

      await stage.caption(
        "Set the next action and a due date — it appears on the dashboard immediately.",
      );
      await page.waitForTimeout(1000);

      const create = page.getByRole("button", { name: "Create enquiry" });
      await stage.glide(create, { duration: 550 });
      await create.click();

      await page.waitForSelector("text=Follow-up history", { timeout: 25000 });
      state.createdUrl = page.url();
      await page.waitForTimeout(1900);

      await stage.caption("Saved, assigned and already on the dashboard.");
      await page.waitForTimeout(1400);
      await stage.clearCaption();
      await page.waitForTimeout(500);
    },
  },

  {
    id: "09-created",
    async run(page, stage) {
      await open(page, state.createdUrl);
      await page.waitForSelector("text=Follow-up history", { timeout: 25000 });
      await page.waitForTimeout(1700);

      await stage.caption(
        "The new enquiry is immediately a live record with an owner and a next action.",
      );
      await stage.scrollTo(430, { duration: 850 });
      await page.waitForTimeout(1200);
      await stage.scrollTo(920, { duration: 850 });
      await page.waitForTimeout(1300);

      await stage.clearCaption();
      await page.waitForTimeout(500);
    },
  },

  {
    id: "10-delete",
    async run(page, stage) {
      await open(page, state.createdUrl);
      await page.waitForSelector("text=Follow-up history", { timeout: 25000 });
      await page.waitForTimeout(1000);

      await stage.caption(
        "Nothing is removed by accident — deletions always ask first.",
      );

      const remove = page.getByRole("button", { name: "Delete", exact: true });
      await stage.glide(remove, { duration: 550 });
      await remove.click();
      await page.waitForTimeout(900);

      const confirm = page.getByRole("button", { name: "Delete enquiry" });
      await stage.glide(confirm, { duration: 550 });
      await confirm.click();

      await page.waitForURL("**/enquiries", { timeout: 25000 });
      await page.waitForTimeout(1800);

      await stage.caption("Back to the list, with the record gone.");
      await page.waitForTimeout(1300);
      await stage.clearCaption();
      await page.waitForTimeout(500);
    },
  },

  {
    id: "11-team",
    async run(page, stage) {
      await open(page, "/team");
      await page.waitForSelector("text=Team members", { timeout: 25000 });
      await page.waitForTimeout(1100);

      await stage.caption(
        "Team workload shows who is carrying what — and what is still unassigned.",
      );
      await stage.glide(page.getByText("Amara Okafor").first(), { duration: 550 });
      await page.waitForTimeout(1000);

      const view = page.getByRole("link", { name: /View their enquiries/ }).first();
      await stage.glide(view, { duration: 550 });
      await view.click();
      await page.waitForURL("**/enquiries**", { timeout: 25000 });
      await page.waitForTimeout(1500);

      await stage.caption(
        "Jump straight into anyone's queue to see exactly what they are handling.",
      );
      await page.waitForTimeout(1400);
      await stage.clearCaption();
      await page.waitForTimeout(500);
    },
  },

  {
    id: "12-dark",
    async run(page, stage) {
      await open(page, "/");
      await page.waitForSelector("text=Enquiry volume", { timeout: 25000 });
      await page.waitForTimeout(1000);

      await stage.caption(
        "Light and dark themes are built in, with the same contrast in both.",
      );

      const dark = page.locator("header").getByRole("radio", { name: "Dark" });
      await stage.glide(dark, { duration: 550 });
      await dark.click();
      await page.waitForTimeout(1800);

      await stage.scrollTo(600, { duration: 850 });
      await page.waitForTimeout(1600);

      await stage.clearCaption();
      await page.waitForTimeout(600);
    },
  },

  {
    id: "13-outro",
    async run(page, stage) {
      await open(page, "/");
      await page.waitForSelector("text=Enquiry volume", { timeout: 25000 });
      await page.waitForTimeout(1200);

      await stage.overlayCard({
        eyebrow: "EnquiryFlow",
        title: "Every enquiry, owned.",
        subtitle:
          "One workspace for the team to capture enquiries, chase next actions and see exactly where the pipeline stands.",
        footer: "Thank you",
      });

      await page.waitForTimeout(4400);
    },
  },
];

await rm(RAW, { recursive: true, force: true });
await mkdir(RAW, { recursive: true });

const browser = await chromium.launch({
  args: ["--force-device-scale-factor=1", "--font-render-hinting=none"],
});

const manifest = { scenes: [] };

const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null;

for (const scene of scenes) {
  if (only && !only.test(scene.id)) continue;

  const started = Date.now();
  process.stdout.write(`recording ${scene.id} ... `);

  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    recordVideo: { dir: RAW, size: VIEWPORT },
  });
  const page = await context.newPage();
  await page.addInitScript(CURSOR_SCRIPT);
  const stage = createStage(page);

  page.on("pageerror", (error) => {
    console.log(`\n  !! page error in ${scene.id}: ${error.message}`);
  });

  try {
    await scene.run(page, stage);
  } catch (error) {
    console.log(`\n  !! scene failed: ${error.message}`);
    await page.screenshot({ path: path.join(RAW, `${scene.id}-error.png`) });
  }

  stage.closeCaption();

  const video = page.video();
  await context.close();
  const source = await video.path();
  await rename(source, path.join(RAW, `${scene.id}.webm`));

  const elapsed = (Date.now() - started) / 1000;
  manifest.scenes.push({
    id: scene.id,
    seconds: Number(elapsed.toFixed(2)),
    captions: stage.captions.map((c) => ({
      text: c.text,
      from: Number(c.from.toFixed(2)),
      to: c.to === null ? null : Number(c.to.toFixed(2)),
    })),
    cards: stage.cards.map((c) => ({
      from: Number(c.from.toFixed(2)),
      to: c.to === null ? null : Number(c.to.toFixed(2)),
    })),
  });
  console.log(`${elapsed.toFixed(1)}s`);
}

await writeFile(
  path.join(RAW, "manifest.json"),
  JSON.stringify(
    { ...manifest, detailUrl: state.detailUrl, createdUrl: state.createdUrl },
    null,
    2,
  ),
);

// ---------------------------------------------------------------------------
// Restore the workspace to its seeded state so the demo database is untouched.
// ---------------------------------------------------------------------------
if (!only) {
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await page.waitForSelector("text=Enquiry volume", { timeout: 25000 });
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await page.waitForTimeout(900);
  await page.getByRole("button", { name: "Reset demo data" }).last().click();
  await page.waitForTimeout(4000);

  console.log("cleanup: demo data reset");
  await context.close();
}

await browser.close();
console.log("recording complete");
