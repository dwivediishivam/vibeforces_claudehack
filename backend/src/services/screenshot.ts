import path from "node:path";
import puppeteer, { type Browser } from "puppeteer";
import { env } from "../config/env";

let browserPromise: Promise<Browser> | null = null;

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      executablePath: env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  return browserPromise;
}

export async function htmlToScreenshot(html: string) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle0" });

  const screenshot = await page.screenshot({
    type: "png",
    fullPage: true,
  });

  await page.close();
  return Buffer.from(screenshot);
}

export async function fileToBase64Screenshot(filePath: string) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  const absolute = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  await page.goto(`file://${absolute}`, { waitUntil: "networkidle0" });
  const screenshot = await page.screenshot({ type: "png", fullPage: true });
  await page.close();
  return Buffer.from(screenshot).toString("base64");
}

export async function htmlToBase64Screenshot(html: string) {
  const buffer = await htmlToScreenshot(html);
  return Buffer.from(buffer).toString("base64");
}
