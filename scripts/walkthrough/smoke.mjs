import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL ?? "http://localhost:3112";
const OUT = new URL("./out/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

page.on("console", (m) => {
  if (m.type() === "error") console.log("  [console error]", m.text());
});
page.on("pageerror", (e) => console.log("  [page error]", e.message));

async function shot(name) {
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}${name}.png` });
  console.log("captured", name);
}

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForSelector("text=Enquiry volume", { timeout: 20000 });
await shot("01-dashboard");

await page.getByRole("link", { name: "Enquiries", exact: true }).first().click();
await page.waitForURL("**/enquiries");
await page.waitForSelector("table tbody tr", { timeout: 20000 });
await shot("02-enquiries");

const firstRowTitle = await page.locator("table tbody tr td a").first().textContent();
console.log("first row:", firstRowTitle?.trim());

await page.locator("table tbody tr td a").first().click();
await page.waitForSelector("text=Follow-up history", { timeout: 20000 });
await shot("03-detail");
console.log("detail url:", page.url());

await page.getByRole("link", { name: "New enquiry" }).first().click();
await page.waitForURL("**/enquiries/new");
await page.waitForSelector("#title", { timeout: 20000 });
await shot("04-new");

await page.getByRole("link", { name: "Team", exact: true }).first().click();
await page.waitForURL("**/team");
await page.waitForSelector("text=Team members", { timeout: 20000 });
await shot("05-team");

await browser.close();
console.log("done");
