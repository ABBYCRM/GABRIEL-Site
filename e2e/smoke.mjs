// Playwright smoke test for Dr. Gabriel Galeb site (v2 — luxury minimal)
import { chromium } from 'playwright';
import fs from 'fs';

const URL = process.env.SITE_URL || 'https://gabriel-galeb-site.onrender.com';
const OUT = '/workspace/GABRIEL-Site/e2e/artifacts';
fs.mkdirSync(OUT, { recursive: true });

const results = { ok: true, errors: [], checks: {} };
const log = (k, v, ok = true) => { results.checks[k] = { ok, value: v }; if (!ok) results.ok = false; };

const browser = await chromium.launch({
  executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome',
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
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 200)); });
page.on('requestfailed', (req) => failedRequests.push(`${req.failure()?.errorText} ${req.url()}`));
page.on('response', (resp) => { if (resp.status() >= 400) failedRequests.push(`HTTP ${resp.status()} ${resp.url()}`); });

console.log('▶ Navigating to', URL);
const resp = await page.goto(URL + '?cb=' + Date.now(), { waitUntil: 'networkidle', timeout: 30000 });
log('http_status', resp.status(), resp.status() === 200);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1500);

// Basic meta
const title = await page.title();
log('title_present', title.length > 10 && title.includes('Gabriel Galeb'));
log('title_text', title);
const metaDesc = await page.getAttribute('meta[name="description"]', 'content');
log('meta_description', (metaDesc || '').length > 50);
const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
log('canonical', !!canonical);

// Structured data
const jsonLdCount = await page.locator('script[type="application/ld+json"]').count();
log('json_ld_blocks', jsonLdCount, jsonLdCount >= 1);
const ldText = await page.locator('script[type="application/ld+json"]').first().textContent();
try {
  const parsed = JSON.parse(ldText);
  log('json_ld_parses', true);
  log('json_ld_physician', !!parsed['@graph']?.find(n => n['@type']?.includes('Physician')));
  log('json_ld_faqpage', !!parsed['@graph']?.find(n => n['@type'] === 'FAQPage'));
} catch (e) {
  log('json_ld_parses', false);
  results.errors.push('JSON-LD parse error: ' + e.message);
}

// Sections
const sections = ['.topbar', '.nav', '.hero', '#sobre', '#servicos', '#processo', '#resultados', '#faq', '#contato', 'footer'];
for (const sel of sections) {
  const visible = await page.locator(sel).first().isVisible().catch(() => false);
  log(`section:${sel}`, visible, visible);
}

// WhatsApp CTAs
const waLinks = await page.locator('a[href*="wa.me"]').count();
log('whatsapp_cta_count', waLinks, waLinks >= 3);

// Floating WhatsApp button — KEY CHECK
const fabPos = await page.locator('.fab-wa').evaluate(el => getComputedStyle(el).position);
const fabBg = await page.locator('.fab-wa').evaluate(el => getComputedStyle(el).backgroundColor);
log('fab_wa_position_fixed', fabPos === 'fixed', fabPos === 'fixed');
log('fab_wa_bg_green', fabBg === 'rgb(37, 211, 102)', fabBg === 'rgb(37, 211, 102)');

// Hero text
const heroH1 = await page.locator('.hero h1').first().textContent();
log('hero_h1', heroH1.replace(/\s+/g, ' ').trim().slice(0, 80), heroH1.includes('renove'));

// Skeuomorphic — red glow on hero portrait
const heroGlow = await page.locator('.hero-portrait').first().evaluate(el => getComputedStyle(el).boxShadow);
log('hero_portrait_red_glow', heroGlow.includes('203, 44, 48') || heroGlow.includes('rgb(203'), heroGlow.length > 0);

// Service cards count
const serviceCount = await page.locator('.service-card').count();
log('service_cards', serviceCount, serviceCount === 3);

// Gallery items
const galleryCount = await page.locator('.gallery-item').count();
log('gallery_items', galleryCount, galleryCount === 6);

// Testimonials
const tCount = await page.locator('.t-card').count();
log('testimonials', tCount, tCount === 3);

// FAQ toggleable
await page.locator('.faq-item summary').first().click();
await page.waitForTimeout(300);
const faqOpen = await page.locator('.faq-item[open]').count();
log('faq_toggleable', faqOpen, faqOpen >= 1);

// Mobile
await page.setViewportSize({ width: 375, height: 812 });
await page.reload({ waitUntil: 'networkidle' });
await page.waitForFunction(() => document.getElementById('menuToggle') !== null, { timeout: 5000 });
await page.waitForTimeout(800);
const mobileHamburger = await page.locator('#menuToggle').isVisible();
log('mobile_menu_visible', mobileHamburger, mobileHamburger);
if (mobileHamburger) {
  await page.locator('#menuToggle').click();
  await page.waitForTimeout(500);
  const menuHasOpen = await page.evaluate(() => document.getElementById('navLinks').classList.contains('open'));
  log('mobile_menu_opens', menuHasOpen, menuHasOpen);
}

// Take screenshots
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(URL + '?cb=' + Date.now(), { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/v2-final-hero.png` });
for (const s of ['sobre', 'servicos', 'processo', 'resultados', 'faq', 'contato']) {
  await page.evaluate((sel) => document.getElementById(sel)?.scrollIntoView({ block: 'start' }), s);
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/v2-final-${s}.png` });
}

await browser.close();

log('console_errors', consoleErrors.length, consoleErrors.length === 0);
log('failed_requests', failedRequests.length, failedRequests.length === 0);
results.consoleErrors = consoleErrors;
results.failedRequests = failedRequests;

console.log('\n========== V2 SMOKE TEST RESULTS ==========');
const failed = Object.entries(results.checks).filter(([k, v]) => !v.ok);
if (failed.length === 0) {
  console.log('✅ ALL', Object.keys(results.checks).length, 'CHECKS PASSED');
} else {
  console.log('❌', failed.length, 'FAILED:');
  failed.forEach(([k, v]) => console.log('  -', k, '=', v.value));
}
console.log('===========================================\n');
process.exit(results.ok ? 0 : 1);
