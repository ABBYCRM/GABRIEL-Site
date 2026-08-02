// Screenshot helper: node scripts/shoot.mjs <url> <outPrefix> [width]
import { chromium } from 'playwright';

const url = process.argv[2] || 'http://127.0.0.1:8899/';
const prefix = process.argv[3] || '/tmp/shot';
const width = Number(process.argv[4] || 1440);

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width, height: 900 },
  deviceScaleFactor: 1,
});
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
// Full-page capture re-renders the document, which drops images that were
// lazily loaded during the scroll pass. Force them eager before scrolling.
await page.evaluate(() => {
  document.querySelectorAll('img[loading="lazy"]').forEach((i) => i.setAttribute('loading', 'eager'));
});
await page.waitForTimeout(1200);
await page.evaluate(async () => {
  await new Promise((resolve) => {
    let y = 0;
    const t = setInterval(() => {
      window.scrollBy(0, 600);
      y += 600;
      if (y > document.body.scrollHeight) {
        clearInterval(t);
        window.scrollTo(0, 0);
        resolve();
      }
    }, 60);
  });
});
await page.waitForTimeout(1500);
await page.screenshot({ path: `${prefix}-full.png`, fullPage: true });
console.log('saved', `${prefix}-full.png`);
await browser.close();
