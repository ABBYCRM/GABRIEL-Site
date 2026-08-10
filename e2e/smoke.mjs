import { createServer } from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'e2e', 'artifacts');
const externalUrl = process.env.SITE_URL?.replace(/\/$/, '');
const CASE_COUNT = 6;
const twoDigitCase = (index) => String(index + 1).padStart(2, '0');

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
};

const report = { ok: true, checks: {}, consoleErrors: [], failedRequests: [] };
const check = (name, condition, detail = condition) => {
  report.checks[name] = { ok: Boolean(condition), detail };
  if (!condition) report.ok = false;
};

const isInsideRoot = (candidate) => candidate === ROOT || candidate.startsWith(`${ROOT}${path.sep}`);

async function resolveRequestFile(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, 'http://127.0.0.1').pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const candidate = path.resolve(ROOT, relativePath);
  if (!isInsideRoot(candidate)) return null;
  try {
    const fileStats = await stat(candidate);
    return fileStats.isDirectory() ? path.join(candidate, 'index.html') : candidate;
  } catch {
    return candidate;
  }
}

async function handleRequest(request, response) {
  const filePath = await resolveRequestFile(request.url || '/');
  if (!filePath || !isInsideRoot(filePath)) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Forbidden');
    return;
  }

  try {
    const body = await readFile(filePath);
    const contentType = mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    response.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}

async function startStaticServer() {
  const server = createServer((request, response) => {
    handleRequest(request, response).catch((error) => {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(error.message);
    });
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  return { server, url: `http://127.0.0.1:${address.port}` };
}

async function closeStaticServer(server) {
  if (!server) return;
  server.closeAllConnections?.();
  await new Promise((resolve) => server.close(resolve));
}

function resolveBrowserExecutable() {
  const candidates = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    chromium.executablePath(),
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  return candidates.find((candidate) => existsSync(candidate));
}

async function waitForPageReady(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});
  await page.evaluate(() => {
    document.querySelectorAll('img').forEach((image) => { image.loading = 'eager'; });
  });
  await page.waitForFunction(
    () => [...document.images].every((image) => image.complete && image.naturalWidth > 0),
    null,
    { timeout: 15_000 },
  );
  await page.evaluate(() => document.fonts?.ready);
}

async function prepareScreenshotCapture(page) {
  await page.addStyleTag({
    content: `
      .nav { position: relative !important; }
      .fab-wa, .skip-link { visibility: hidden !important; }
    `,
  });

  await page.evaluate(async () => {
    const step = Math.max(320, Math.floor(window.innerHeight * 0.75));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(200);
}

async function openPage(page, url) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  check(`http:${new URL(url).searchParams.get('viewport') || 'initial'}`, response?.status() === 200, response?.status());
  await waitForPageReady(page);
}

async function auditCoreExperience(page, baseUrl) {
  await openPage(page, `${baseUrl}/?lang=pt`);

  check('title', (await page.title()).includes('Gabriel Galeb'), await page.title());
  check('title-local-intent', (await page.title()).includes('Alphaville'), await page.title());
  check('meta-description', (await page.locator('meta[name="description"]').getAttribute('content'))?.length > 80);
  check('meta-description-local-intent', (await page.locator('meta[name="description"]').getAttribute('content'))?.includes('Barueri'));
  check('canonical', (await page.locator('link[rel="canonical"]').getAttribute('href')) === 'https://www.drgabrielgaleb.com.br/');

  const structuredData = await page.locator('script[type="application/ld+json"]').first().textContent();
  let schema;
  try { schema = JSON.parse(structuredData); } catch { schema = null; }
  check('structured-data-parses', Boolean(schema));
  check('structured-data-physician', Boolean(schema?.['@graph']?.find((node) => Array.isArray(node['@type']) && node['@type'].includes('Physician'))));
  check('structured-data-no-unverified-rating', !structuredData.includes('aggregateRating'));
  check('structured-data-no-unverified-hours', !structuredData.includes('openingHours'));
  check('structured-data-locality', structuredData.includes('"addressLocality": "Barueri"'));
  check('structured-data-service-area', structuredData.includes('"name": "Alphaville"') && structuredData.includes('"name": "Grande São Paulo"'));
  check('structured-data-ai-simulator', Boolean(schema?.['@graph']?.find((node) => node['@id'] === 'https://www.drgabrielgaleb.com.br/#simulador-capilar-ia' && node['@type'] === 'Service')));

  const robots = await readFile(path.join(ROOT, 'robots.txt'), 'utf8');
  const sitemap = await readFile(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const llms = await readFile(path.join(ROOT, 'llms.txt'), 'utf8');
  check('robots-search-crawlers', robots.includes('OAI-SearchBot') && robots.includes('Googlebot'));
  check('robots-sitemap', robots.includes('Sitemap: https://www.drgabrielgaleb.com.br/sitemap.xml'));
  check('image-sitemap', (sitemap.match(/<image:loc>/g) || []).length === 9, (sitemap.match(/<image:loc>/g) || []).length);
  check('llms-discovery-file', llms.includes('Alphaville, Barueri') && llms.includes('Transplante Capilar Masculino') && llms.includes('Simulador Capilar IA'));

  const requiredSections = ['.topbar', '.nav', '.hero', '#sobre', '#solucoes', '#resultados', '#simulador', '.diffs-section', '#processo', '#depoimentos', '#contato', 'footer'];
  for (const selector of requiredSections) {
    check(`section:${selector}`, await page.locator(selector).first().isVisible());
  }

  check('language-buttons', await page.locator('[data-lang]').count() === 3, await page.locator('[data-lang]').count());
  check('comparison-cases', await page.locator('[data-case-index]').count() === 6, await page.locator('[data-case-index]').count());
  check('after-gallery-count', await page.locator('.after-gallery .gallery-item').count() === 6, await page.locator('.after-gallery .gallery-item').count());
  const missingImageAlts = await page.locator('img').evaluateAll((images) => images.filter((image) => !image.alt.trim()).length);
  check('descriptive-image-alt', missingImageAlts === 0, missingImageAlts);

  const gallerySources = await page.locator('.after-gallery img').evaluateAll((images) => images.map((image) => image.getAttribute('src')));
  check('after-gallery-only-after', gallerySources.every((source) => /case-\d{2}-after\.webp$/.test(source)), gallerySources);
  const simulatorLink = page.locator('#simulador a[href="https://tanah-hair-gen-gmq6b.ondigitalocean.app/"]');
  check('simulator-link-visible', await simulatorLink.isVisible());
  check('simulator-link-new-tab', await simulatorLink.getAttribute('target') === '_blank');
  check('simulator-link-no-opener', (await simulatorLink.getAttribute('rel'))?.includes('noopener'));

  const geometry = await page.locator('.comparison-frame').evaluate((frame) => {
    const before = frame.querySelector('.comparison-image--before').getBoundingClientRect();
    const after = frame.querySelector('.comparison-image--after').getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    const divider = frame.querySelector('.comparison-divider').getBoundingClientRect();
    return {
      before: { x: before.x, y: before.y, width: before.width, height: before.height },
      after: { x: after.x, y: after.y, width: after.width, height: after.height },
      dividerCenter: divider.x + divider.width / 2,
      expectedCenter: frameRect.x + frameRect.width / 2,
    };
  });
  const imagesAligned = ['x', 'y', 'width', 'height'].every((key) => Math.abs(geometry.before[key] - geometry.after[key]) < 0.5);
  check('comparison-images-aligned', imagesAligned, geometry);
  check('comparison-divider-centered', Math.abs(geometry.dividerCenter - geometry.expectedCenter) < 1, geometry);

  await page.locator('[data-comparison-range]').fill('75');
  const reveal = await page.locator('.comparison-frame').evaluate((frame) => frame.style.getPropertyValue('--reveal'));
  check('comparison-range-updates', reveal === '75%', reveal);

  await page.locator('[data-case-next]').click();
  await page.waitForFunction(() => document.querySelector('[data-before-image]')?.getAttribute('src')?.includes('case-02-before.webp'));
  check('carousel-next-case', (await page.locator('[data-before-image]').getAttribute('src')).includes('case-02-before.webp'));
  check('carousel-active-dot', await page.locator('.comparison-dot.is-active').textContent() === '2');

  const renderedCases = [];
  for (let index = 0; index < CASE_COUNT; index += 1) {
    await page.locator(`[data-case-index="${index}"]`).click();
    await page.waitForFunction((caseNumber) => {
      const before = document.querySelector('[data-before-image]');
      const after = document.querySelector('[data-after-image]');
      return before?.src.includes(`case-${caseNumber}-before.webp`)
        && after?.src.includes(`case-${caseNumber}-after.webp`)
        && before.naturalWidth > 0
        && after.naturalWidth > 0;
    }, String(index + 1).padStart(2, '0'));
    renderedCases.push(await page.locator('.comparison-frame').evaluate((frame) => {
      const before = frame.querySelector('.comparison-image--before');
      const after = frame.querySelector('.comparison-image--after');
      const beforeRect = before.getBoundingClientRect();
      const afterRect = after.getBoundingClientRect();
      return {
        beforeNatural: [before.naturalWidth, before.naturalHeight],
        afterNatural: [after.naturalWidth, after.naturalHeight],
        aligned: ['x', 'y', 'width', 'height'].every((key) => Math.abs(beforeRect[key] - afterRect[key]) < 0.5),
      };
    }));
  }
  check('all-comparison-cases-decoded', renderedCases.every((item) => item.beforeNatural[0] > 0 && item.afterNatural[0] > 0), renderedCases);
  check('all-comparison-cases-same-geometry', renderedCases.every((item) => item.aligned), renderedCases);
  check('all-comparison-assets-normalized', renderedCases.every((item) => (
    item.beforeNatural[0] === 1080
    && item.beforeNatural[1] === 1350
    && item.afterNatural[0] === 1080
    && item.afterNatural[1] === 1350
  )), renderedCases);

  await page.locator('[data-lang="es"]').click();
  check('spanish-html-lang', await page.locator('html').getAttribute('lang') === 'es');
  check('spanish-hero', (await page.locator('#hero-title').innerText()).includes('Recupera tu confianza'));
  check('spanish-whatsapp', decodeURIComponent(await page.locator('[data-wa="schedule"]').first().getAttribute('href')).includes('Hola Dr. Gabriel'));
  check('spanish-simulator-copy', (await page.locator('#simulador').innerText()).toLowerCase().includes('nueva tecnología'));

  await page.locator('[data-lang="en"]').click();
  check('english-html-lang', await page.locator('html').getAttribute('lang') === 'en');
  check('english-hero', (await page.locator('#hero-title').innerText()).includes('Restore your confidence'));
  check('english-gallery-copy', (await page.locator('.after-gallery-heading').innerText()).includes('after images'));
  check('english-simulator-copy', (await page.locator('#simulador').innerText()).toLowerCase().includes('new technology'));

  await page.locator('[data-lang="pt"]').click();
  check('portuguese-restored', await page.locator('html').getAttribute('lang') === 'pt-BR');

  const missingTranslations = await page.locator('[data-i18n], [data-i18n-html], [data-i18n-aria], [data-i18n-alt]').evaluateAll((elements) => elements.filter((element) => {
    const value = element.textContent || element.getAttribute('aria-label') || element.getAttribute('alt') || '';
    return !value.trim() || /^(accessibility|actions|about|brand|cta|diffs|doctor|footer|gallery|hero|images|journey|nav|results|services|simulator|stats|testimonials|topbar)\./.test(value.trim());
  }).length);
  check('translations-complete', missingTranslations === 0, missingTranslations);
}

async function captureResponsiveScreenshots(page, baseUrl) {
  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 834, height: 1112 },
    { name: 'mobile', width: 390, height: 844 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await openPage(page, `${baseUrl}/?lang=pt&viewport=${viewport.name}`);

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    check(`${viewport.name}:no-horizontal-overflow`, overflow.scrollWidth <= overflow.clientWidth + 1, overflow);
    check(`${viewport.name}:language-selector-visible`, await page.locator('.language-switcher').isVisible());

    const menuVisible = await page.locator('#menuToggle').isVisible();
    check(`${viewport.name}:menu-visibility`, viewport.width <= 1120 ? menuVisible : !menuVisible, menuVisible);
    if (viewport.width <= 1120) {
      await page.locator('#menuToggle').click();
      check(`${viewport.name}:menu-opens`, await page.locator('#navLinks').evaluate((element) => element.classList.contains('open')));
      check(`${viewport.name}:menu-expanded`, await page.locator('#menuToggle').getAttribute('aria-expanded') === 'true');
      await page.locator('#menuToggle').press('Escape');
      check(`${viewport.name}:menu-closes-with-escape`, await page.locator('#menuToggle').getAttribute('aria-expanded') === 'false');
    }

    await prepareScreenshotCapture(page);
    await page.screenshot({ path: path.join(OUT, `${viewport.name}-full.png`), fullPage: true });
    await page.locator('#resultados').screenshot({ path: path.join(OUT, `${viewport.name}-results.png`) });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await openPage(page, `${baseUrl}/?lang=pt&viewport=comparison`);
  await prepareScreenshotCapture(page);
  for (const [name, value] of [['before', '0'], ['split', '50'], ['after', '100']]) {
    await page.locator('[data-comparison-range]').fill(value);
    await page.locator('.comparison-carousel').screenshot({ path: path.join(OUT, `desktop-comparison-${name}.png`) });
  }
  for (let index = 0; index < CASE_COUNT; index += 1) {
    await page.locator(`[data-case-index="${index}"]`).click();
    await page.locator('[data-comparison-range]').fill('50');
    await page.locator('.comparison-frame').screenshot({ path: path.join(OUT, `desktop-case-${twoDigitCase(index)}-split.png`) });
  }
}

await mkdir(OUT, { recursive: true });
let localServer;
let browser;

try {
  let baseUrl = externalUrl;
  if (!baseUrl) {
    const started = await startStaticServer();
    localServer = started.server;
    baseUrl = started.url;
  }

  const executablePath = resolveBrowserExecutable();
  const browserArgs = ['--no-sandbox', '--disable-setuid-sandbox'];
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
    browserArgs.push('--single-process', '--no-zygote', '--disable-gpu', '--disable-webgl', '--disable-software-rasterizer');
  }
  browser = await chromium.launch({
    headless: true,
    executablePath,
    ignoreDefaultArgs: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? ['--disable-dev-shm-usage'] : undefined,
    args: browserArgs,
  });
  const context = await browser.newContext({ colorScheme: 'dark', reducedMotion: 'reduce' });
  const page = await context.newPage();

  page.on('console', (message) => {
    if (message.type() === 'error') report.consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => {
    report.failedRequests.push(`${request.failure()?.errorText || 'Request failed'} ${request.url()}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400) report.failedRequests.push(`HTTP ${response.status()} ${response.url()}`);
  });

  await auditCoreExperience(page, baseUrl);
  await captureResponsiveScreenshots(page, baseUrl);

  check('console-errors', report.consoleErrors.length === 0, report.consoleErrors);
  check('failed-requests', report.failedRequests.length === 0, report.failedRequests);
} catch (error) {
  report.ok = false;
  report.fatalError = error.stack || error.message;
} finally {
  await browser?.close();
  await closeStaticServer(localServer);
}

await writeFile(path.join(OUT, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);

const failedChecks = Object.entries(report.checks).filter(([, result]) => !result.ok);
console.log(`Playwright checks: ${Object.keys(report.checks).length - failedChecks.length} passed, ${failedChecks.length} failed.`);
for (const [name, result] of failedChecks) console.error(`- ${name}: ${JSON.stringify(result.detail)}`);
if (report.fatalError) console.error(report.fatalError);
console.log(`Screenshots and report: ${OUT}`);

process.exitCode = report.ok ? 0 : 1;
