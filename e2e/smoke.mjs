/**
 * Smoke test for the rebuilt Galeb site.
 * SITE_URL=http://127.0.0.1:8899 node e2e/smoke.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.SITE_URL || 'http://127.0.0.1:8899';
const OUT = new URL('./artifacts/', import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });

const results = { ok: true, checks: {}, errors: [] };
const log = (k, v, ok = true) => {
  results.checks[k] = { ok, value: v };
  if (!ok) {
    results.ok = false;
    results.errors.push(`${k}: ${JSON.stringify(v)}`);
  }
};

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const consoleErrors = [];
const failedRequests = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 220));
});
page.on('response', (resp) => {
  if (resp.status() >= 400 && !resp.url().includes('favicon')) {
    failedRequests.push(`HTTP ${resp.status()} ${resp.url()}`);
  }
});

console.log('▶', BASE);
const resp = await page.goto(BASE + '/?cb=' + Date.now(), { waitUntil: 'networkidle', timeout: 45000 });
log('home_http', resp.status(), resp.status() === 200);

const title = await page.title();
log('title', title, /Gabriel Galeb/i.test(title) && /Transplante Capilar/i.test(title));

const metaDesc = await page.getAttribute('meta[name="description"]', 'content');
log('meta_description', (metaDesc || '').length, (metaDesc || '').length >= 80);

const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
log('canonical', canonical, canonical === 'https://www.drgabrielgaleb.com.br/');

const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
let graph = [];
try {
  graph = JSON.parse(ld)['@graph'] || [];
  log('json_ld_parses', true);
} catch (e) {
  log('json_ld_parses', e.message, false);
}
const types = graph.flatMap((n) => (Array.isArray(n['@type']) ? n['@type'] : [n['@type']]));
log('schema_clinic', types, types.includes('MedicalClinic') || types.includes('MedicalBusiness'));
log('schema_physician', types, types.includes('Physician'));
log('schema_faq', types, types.includes('FAQPage'));
log('no_self_rating', !JSON.stringify(graph).includes('aggregateRating'), !JSON.stringify(graph).includes('aggregateRating'));

for (const sel of ['.topbar', '.masthead', '.hero', '#tratamentos', '#resultados', '#jornada', '#duvidas', '#contato', 'footer', '.fab']) {
  const visible = await page.locator(sel).first().isVisible().catch(() => false);
  log(`visible:${sel}`, visible, visible);
}

const wa = await page.locator('a[href*="wa.me"]').count();
log('whatsapp_ctas', wa, wa >= 3);

const cases = await page.locator('.case').count();
log('home_cases', cases, cases >= 3);

const bodyBg = await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor);
log('body_bone', bodyBg, bodyBg === 'rgb(250, 247, 241)');

const heroBg = await page.locator('.hero').evaluate((el) => getComputedStyle(el).backgroundColor);
log('hero_ink', heroBg, heroBg === 'rgb(10, 13, 24)');

const goldBtn = await page.locator('.btn').first().evaluate((el) => getComputedStyle(el).backgroundColor);
log('btn_gold', goldBtn, goldBtn === 'rgb(201, 169, 97)');

const serif = await page.locator('.hero h1').evaluate((el) => getComputedStyle(el).fontFamily);
log('display_font', serif, /cormorant/i.test(serif));

const portrait = await page.locator('.portrait__frame img').evaluate((img) => ({
  w: img.naturalWidth,
  complete: img.complete,
  src: img.currentSrc,
}));
log('portrait_loaded', portrait, portrait.complete && portrait.w > 200);

await page.locator('.faq summary').first().click();
await page.waitForTimeout(200);
log('faq_opens', await page.locator('.faq details[open]').count(), (await page.locator('.faq details[open]').count()) >= 1);

// Sub-pages
for (const path of ['/sobre/', '/transplante-capilar-fue/', '/mmp-capilar/', '/resultados/']) {
  const r = await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 });
  log(`page:${path}`, r.status(), r.status() === 200);
  const h1 = (await page.locator('h1').first().textContent()) || '';
  log(`h1:${path}`, h1.trim().slice(0, 60), h1.trim().length > 5);
  const can = await page.getAttribute('link[rel="canonical"]', 'href');
  log(`canonical:${path}`, can, can === `https://www.drgabrielgaleb.com.br${path}`);
}

// Mobile menu
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
const burgerVisible = await page.locator('#burger').isVisible();
log('mobile_burger', burgerVisible, burgerVisible);
if (burgerVisible) {
  await page.locator('#burger').click();
  await page.waitForTimeout(350);
  const open = await page.locator('#nav').evaluate((el) => el.dataset.open === 'true');
  log('mobile_nav_opens', open, open);
}

await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/home-hero.png` });
await page.goto(BASE + '/resultados/', { waitUntil: 'networkidle' });
await page.screenshot({ path: `${OUT}/resultados.png`, fullPage: false });

await browser.close();

log('console_errors', consoleErrors, consoleErrors.length === 0);
log('failed_requests', failedRequests, failedRequests.length === 0);

console.log('\n========== SMOKE ==========');
const failed = Object.entries(results.checks).filter(([, v]) => !v.ok);
if (failed.length === 0) {
  console.log('ALL', Object.keys(results.checks).length, 'CHECKS PASSED');
} else {
  console.log(failed.length, 'FAILED:');
  failed.forEach(([k, v]) => console.log(' -', k, '=', v.value));
}
console.log('===========================\n');
process.exit(results.ok ? 0 : 1);
