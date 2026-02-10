#!/usr/bin/env node
import path from 'node:path';
import fs from 'node:fs/promises';

const HELP_TEXT = `
Convert Gemini public shared-chat links to PDF files.

Usage:
  node scripts/gemini-share-to-pdf.mjs <link1> [link2 ...] [--out-dir <dir>]

Examples:
  node scripts/gemini-share-to-pdf.mjs https://g.co/gemini/share/abc123
  node scripts/gemini-share-to-pdf.mjs https://g.co/gemini/share/abc123 https://g.co/gemini/share/def456 --out-dir ./exports
`;

function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    return { help: true, urls: [], outDir: 'exports' };
  }

  const urls = [];
  let outDir = 'exports';

  for (let i = 0; i < args.length; i += 1) {
    const current = args[i];

    if (current === '--out-dir') {
      const nextValue = args[i + 1];
      if (!nextValue || nextValue.startsWith('--')) {
        throw new Error('Missing value for --out-dir.');
      }
      outDir = nextValue;
      i += 1;
      continue;
    }

    if (current.startsWith('http://') || current.startsWith('https://')) {
      urls.push(current);
      continue;
    }

    throw new Error(`Unknown argument: ${current}`);
  }

  if (urls.length === 0) {
    throw new Error('Please provide at least one Gemini shared link.');
  }

  return { help: false, urls, outDir };
}

function filenameFromUrl(url, index) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    const shareId = parts.at(-1) || `chat-${index + 1}`;
    return `${shareId.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  } catch {
    return `chat-${index + 1}.pdf`;
  }
}

async function getChromium() {
  try {
    const playwright = await import('playwright');
    return playwright.chromium;
  } catch {
    throw new Error(
      'Playwright is not installed. Run `npm install` and then `npx playwright install chromium`.'
    );
  }
}

async function clickIfVisible(page, selectors) {
  for (const selector of selectors) {
    const element = page.locator(selector).first();
    if (await element.isVisible().catch(() => false)) {
      await element.click().catch(() => {});
      return true;
    }
  }
  return false;
}

async function expandAll(page) {
  const expandableSelectors = [
    'button:has-text("Show more")',
    'button:has-text("View more")',
    'button:has-text("Read more")',
    '[role="button"]:has-text("Show more")'
  ];

  let clicked = true;
  let iteration = 0;

  while (clicked && iteration < 8) {
    clicked = false;
    for (const selector of expandableSelectors) {
      const locator = page.locator(selector);
      const count = await locator.count();
      for (let i = 0; i < count; i += 1) {
        const button = locator.nth(i);
        if (await button.isVisible().catch(() => false)) {
          await button.click().catch(() => {});
          clicked = true;
        }
      }
    }
    iteration += 1;
    if (clicked) {
      await page.waitForTimeout(300);
    }
  }
}

async function autoScroll(page) {
  let stableIterations = 0;
  let previousHeight = 0;

  while (stableIterations < 3) {
    const currentHeight = await page.evaluate(async () => {
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      window.scrollTo(0, document.body.scrollHeight);
      await sleep(400);
      return document.body.scrollHeight;
    });

    if (currentHeight === previousHeight) {
      stableIterations += 1;
    } else {
      stableIterations = 0;
      previousHeight = currentHeight;
    }
  }

  await page.evaluate(() => window.scrollTo(0, 0));
}

async function exportLinkToPdf(browser, url, outputPath) {
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log(`Opening: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });

    await clickIfVisible(page, [
      'button:has-text("Accept all")',
      'button:has-text("I agree")',
      'button:has-text("Continue")'
    ]);

    await page.waitForTimeout(1000);
    await expandAll(page);
    await autoScroll(page);

    await page.pdf({
      path: outputPath,
      printBackground: true,
      format: 'A4',
      margin: {
        top: '12mm',
        right: '10mm',
        bottom: '12mm',
        left: '10mm'
      }
    });

    console.log(`Saved: ${outputPath}`);
  } finally {
    await context.close();
  }
}

async function main() {
  const { help, urls, outDir } = parseArgs(process.argv);
  if (help) {
    console.log(HELP_TEXT.trim());
    return;
  }

  const chromium = await getChromium();
  await fs.mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  try {
    for (let i = 0; i < urls.length; i += 1) {
      const fileName = filenameFromUrl(urls[i], i);
      const outputPath = path.resolve(outDir, fileName);
      await exportLinkToPdf(browser, urls[i], outputPath);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(`Failed: ${error.message}`);
  process.exitCode = 1;
});
