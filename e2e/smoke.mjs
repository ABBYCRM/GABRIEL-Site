// Playwright smoke test for Dr. Gabriel Galeb site
// Tests: load, console errors, network failures, key sections, CTAs, mobile responsive, structured data
import { chromium } from 'playwright';
import fs from 'fs';

const URL = process.env.SITE_URL || 'https://gabriel-galeb-site.onrender.com';
const OUT = '/workspace/GABRIEL-Site/e2e/artifacts';
fs.mkdirSync(OUT, { recursive: true });

const results = { ok: true, errors: [], warnings: [], checks: {} };
const log = (k, v, ok = true) => { results.checks[k] = { ok, value: v }; if (!ok) results.ok = false; };

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
});
const page = await ctx.newPage();

const consoleErrors = [];
const failedRequests = [];
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('requestfailed', (req) => failedRequests.push(`${req.failure()?.errorText} ${req.url()}`));
page.on('response', (resp) => {
  if (resp.status() >= 400) failedRequests.push(`HTTP ${resp.status()} ${resp.url()}`);
});

console.log('▶ Navigating to', URL);
const resp = await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
log('http_status', resp.status(), resp.status() === 200);
log('url_loaded', page.url());

// Wait for fonts and CSS to settle
await page.waitForLoadState('networkidle');

// Check title and meta
const title = await page.title();
log('title_present', title, title.length > 10 && title.includes('Gabriel Galeb'));
log('title_text', title);

const metaDesc = await page.getAttribute('meta[name="description"]', 'content');
log('meta_description', metaDesc?.slice(0, 80) + '...', (metaDesc || '').length > 50);

const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
log('canonical', canonical, !!canonical);

const ogImage = await page.getAttribute('meta[property="og:image"]', 'content');
log('og_image', ogImage, !!ogImage);

// Structured data
const jsonLdCount = await page.locator('script[type="application/ld+json"]').count();
log('json_ld_blocks', jsonLdCount, jsonLdCount >= 1);
const ldText = await page.locator('script[type="application/ld+json"]').first().textContent();
try {
  const parsed = JSON.parse(ldText);
  log('json_ld_parses', true);
  log('json_ld_physician', !!parsed['@graph']?.find(n => n['@type']?.includes('Physician')), true);
  log('json_ld_faqpage', !!parsed['@graph']?.find(n => n['@type'] === 'FAQPage'), true);
} catch (e) {
  log('json_ld_parses', false, false);
  results.errors.push('JSON-LD parse error: ' + e.message);
}

// Section presence
const sections = ['.topbar', '.nav', '.hero', '#sobre', '#servicos', '#processo', '#resultados', '#faq', '#contato', 'footer'];
for (const sel of sections) {
  const visible = await page.locator(sel).first().isVisible().catch(() => false);
  log(`section:${sel}`, visible, visible);
}

// CTAs point to WhatsApp
const whatsappLinks = await page.locator('a[href*="wa.me"]').count();
log('whatsapp_cta_count', whatsappLinks, whatsappLinks >= 3);

// Hero text
const heroH1 = await page.locator('.hero h1').first().textContent();
log('hero_h1', heroH1?.replace(/\s+/g, ' ').trim().slice(0, 60), (heroH1 || '').includes('Renove'));

// Skeuomorphism — verify the aluminum plate has the expected gradient computed
const alumBg = await page.locator('.alum-plate').first().evaluate((el) => getComputedStyle(el).backgroundImage);
log('alum_plate_styled', alumBg.includes('gradient'), alumBg.includes('gradient'));

// Leather — verify the doctor section has the leather look
const leatherBg = await page.locator('.doctor-portrait').first().evaluate((el) => getComputedStyle(el).backgroundImage);
log('doctor_portrait_styled', leatherBg.includes('gradient'), leatherBg.includes('gradient'));

// FAQ interaction
await page.locator('.faq-item summary').first().click();
await page.waitForTimeout(300);
const faqOpen = await page.locator('.faq-item[open]').count();
log('faq_toggleable', faqOpen, faqOpen === 1);

// Service cards count
const serviceCount = await page.locator('.service-card').count();
log('service_cards', serviceCount, serviceCount === 3);

// Gallery items
const galleryCount = await page.locator('.gallery-item').count();
log('gallery_items', galleryCount, galleryCount === 6);

// Testimonials
const tCount = await page.locator('.t-card').count();
log('testimonials', tCount, tCount === 3);

// Take a desktop screenshot
await page.screenshot({ path: `${OUT}/desktop-hero.png`, fullPage: false });
await page.screenshot({ path: `${OUT}/desktop-full.png`, fullPage: true });

// Mobile responsive
await page.setViewportSize({ width: 375, height: 812 });
await page.reload({ waitUntil: 'networkidle' });
await page.waitForFunction(() => {
  const t = document.getElementById('menuToggle');
  return t && typeof t.addEventListener === 'function' && document.getElementById('navLinks');
}, { timeout: 5000 });
await page.waitForTimeout(800);
const mobileHamburger = await page.locator('#menuToggle').isVisible();
log('mobile_menu_visible', mobileHamburger, mobileHamburger);
await page.screenshot({ path: `${OUT}/mobile-hero.png`, fullPage: false });
await page.screenshot({ path: `${OUT}/mobile-full.png`, fullPage: true });

// Open mobile menu
if (mobileHamburger) {
  await page.locator('#menuToggle').click();
  await page.waitForTimeout(500);
  const menuHasOpen = await page.evaluate(() => document.getElementById('navLinks').classList.contains('open'));
  log('mobile_menu_opens', menuHasOpen, menuHasOpen);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/mobile-menu.png`, fullPage: false });
}

await browser.close();

// Report
log('console_errors', consoleErrors.length, consoleErrors.length === 0);
log('failed_requests', failedRequests.length, failedRequests.length === 0);
results.consoleErrors = consoleErrors;
results.failedRequests = failedRequests;

console.log('\n========== SMOKE TEST RESULTS ==========');
console.log(JSON.stringify(results, null, 2));
console.log('=========================================\n');
process.exit(results.ok ? 0 : 1);
