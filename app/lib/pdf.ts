// lib/pdf.ts
/**
 * Robust server/local PDF helper.
 *
 * Prefer @sparticuz/chromium + puppeteer-core (Vercel), but support local dev:
 *  - npm install puppeteer  <-- easiest local fix (downloads Chromium)
 *  - or set PUPPETEER_EXECUTABLE_PATH or CHROME_PATH to your Chrome exe path
 *
 * Usage: import { htmlToPdfBuffer } from './pdf'  (server-only)
 */

import fs from 'fs';

function fileExists(p: string | undefined) {
  try {
    return !!p && fs.existsSync(p);
  } catch {
    return false;
  }
}

function guessLocalChromePaths(): string[] {
  // common Windows paths + fallback cross-platform paths
  const guesses = [
    // Windows
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Chromium\\Application\\chrome.exe',
    // Mac (not used on Windows but left for completeness)
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    // Linux common
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ];
  return guesses;
}

async function resolveExecutablePathFromChromium(chromiumPkg: any): Promise<string | undefined> {
  if (!chromiumPkg) return undefined;

  const maybe = (chromiumPkg as any).executablePath;

  try {
    if (!maybe) return undefined;

    if (typeof maybe === 'function') {
      // some libs expose async function
      const result = await maybe();
      return typeof result === 'string' ? result : undefined;
    }

    if (typeof maybe === 'string') return maybe;

    // maybe it's a promise-like
    if (maybe && typeof (maybe as Promise<any>).then === 'function') {
      const result = await maybe;
      return typeof result === 'string' ? result : undefined;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export async function htmlToPdfBuffer(html: string): Promise<Buffer> {
  // 1) Try modern serverless package (@sparticuz/chromium or chrome-aws-lambda) + puppeteer-core
  const sparticuz = await import('@sparticuz/chromium').catch(() => null);
  const chromeAwsLambda = sparticuz; // fallback if sparticuz not present
  const puppeteerCore = await import('puppeteer-core').catch(() => null);

  // prefer sparticuz (smaller, modern), then chrome-aws-lambda
  const chromiumPkg = (sparticuz && (sparticuz as any).default) ? (sparticuz as any).default : (sparticuz ?? (chromeAwsLambda && (chromeAwsLambda as any).default ? (chromeAwsLambda as any).default : chromeAwsLambda));

  if (chromiumPkg && puppeteerCore) {
    const puppeteer = (puppeteerCore as any).default ?? puppeteerCore;

    const execPath = await resolveExecutablePathFromChromium(chromiumPkg);
    const args = (chromiumPkg && (chromiumPkg as any).args) || undefined;
    const defaultViewport = (chromiumPkg && (chromiumPkg as any).defaultViewport) || undefined;
    const headless = typeof (chromiumPkg && (chromiumPkg as any).headless) !== 'undefined' ? (chromiumPkg as any).headless : true;

    const launchOptions: any = {
      args: args || undefined,
      defaultViewport: defaultViewport || undefined,
      executablePath: execPath || undefined,
      headless,
    };

    const browser = await puppeteer.launch(launchOptions);

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        width: '210mm',
        height: '297mm',
        printBackground: true,
        margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
      });
      return pdfBuffer;
    } finally {
      try { await browser.close(); } catch {}
    }
  }

  // 2) Try puppeteer (full) — convenient for local dev because it downloads Chromium
  const puppeteerFull = await import('puppeteer').catch(() => null);
  if (puppeteerFull) {
    const puppeteer = (puppeteerFull as any).default ?? puppeteerFull;
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        width: '210mm',
        height: '297mm',
        printBackground: true,
        margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
      });
      return pdfBuffer;
    } finally {
      try { await browser.close(); } catch {}
    }
  }

  // 3) Try puppeteer-core + system Chrome (user must set env or have Chrome in common path)
  if (puppeteerCore) {
    const puppeteer = (puppeteerCore as any).default ?? puppeteerCore;

    // Check env variables for executable
    const envPath =
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      process.env.CHROME_PATH ||
      process.env.PUPPETEER_PATH ||
      process.env.CHROME_EXECUTABLE_PATH;

    let executablePath = envPath && fileExists(envPath) ? envPath : undefined;

    if (!executablePath) {
      // try common guesses
      const guesses = guessLocalChromePaths();
      executablePath = guesses.find((g) => fileExists(g));
    }

    if (!executablePath) {
      throw new Error(
        'Could not find expected browser (chrome) locally. Install "puppeteer" (npm i puppeteer) or set PUPPETEER_EXECUTABLE_PATH to your chrome executable.'
      );
    }

    const browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        width: '210mm',
        height: '297mm',
        printBackground: true,
        margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
      });
      return pdfBuffer;
    } finally {
      try { await browser.close(); } catch {}
    }
  }

  throw new Error(
    'PDF generation not available: install "puppeteer" for local dev (npm i puppeteer) or ensure @sparticuz/chromium / chrome-aws-lambda + puppeteer-core are available in server environment.'
  );
}
