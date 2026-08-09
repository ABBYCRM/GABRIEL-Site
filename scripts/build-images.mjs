/**
 * Derives every image the site ships from the originals in assets/src/.
 *
 * The originals were downloaded from Dr. Gabriel Galeb's own site
 * (drgabrielgaleb.com.br). assets/src keeps them so the shipped derivatives can
 * always be rebuilt. Run with: npm run build:images
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'assets/src';
const OUT = 'assets/img';

const JPEG = { quality: 82, mozjpeg: true, chromaSubsampling: '4:4:4' };
const WEBP = { quality: 80, effort: 5 };
const AVIF = { quality: 55, effort: 4 };

const GOLD = '#C9A961';
const GOLD_SOFT = '#E3CE9B';
const INK = '#0A0D18';

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

function src(name) {
  // Prefer luxe-processed clinical frames (eye blur + studio backdrop).
  const luxeDir = path.join(SRC, 'luxe');
  if (fs.existsSync(luxeDir)) {
    const luxeHit = fs.readdirSync(luxeDir).find((f) => path.parse(f).name === name);
    if (luxeHit) return path.join(luxeDir, luxeHit);
  }
  const hit = fs.readdirSync(SRC).find((f) => path.parse(f).name === name);
  if (!hit) throw new Error(`missing source: ${name}`);
  return path.join(SRC, hit);
}

/** Writes avif/webp/jpg at each width; returns dimensions for the HTML. */
async function emit(pipeline, base, widths) {
  const out = { widths };
  for (const w of widths) {
    const buf = await pipeline
      .clone()
      .resize({ width: w, kernel: 'lanczos3' })
      .sharpen({ sigma: 0.6, m1: 0.5, m2: 0.9 })
      .toBuffer();
    await sharp(buf).avif(AVIF).toFile(`${OUT}/${base}-${w}.avif`);
    await sharp(buf).webp(WEBP).toFile(`${OUT}/${base}-${w}.webp`);
    await sharp(buf).jpeg(JPEG).toFile(`${OUT}/${base}-${w}.jpg`);
    const m = await sharp(buf).metadata();
    out.width = m.width;
    out.height = m.height;
  }
  console.log(`  ${base}  ${out.width}x${out.height}  [${widths.join(', ')}]`);
  return out;
}

/**
 * Patient frames ship as pre-harmonized 16:9 luxe clinical plates when present
 * (see scripts/luxe-patients.py). Fallback: crop the treated scalp band from the
 * raw clinic originals so every before/after pair shares the same framing.
 */
const SCALP_RATIO = 16 / 9;
async function scalp(name, crop) {
  const file = src(name);
  const meta = await sharp(file).metadata();
  // Privacy-processed plates retain the original background at 4:5.
  if (meta.width === 1080 && meta.height === 1350) {
    return sharp(file).modulate({ saturation: 1.02 }).linear(1.02, -2);
  }
  const { left, top, width, height } = crop;
  return sharp(file)
    .extract({ left, top, width, height })
    .resize(1440, Math.round(1440 / SCALP_RATIO), { fit: 'cover' })
    .modulate({ saturation: 1.04 })
    .linear(1.04, -4);
}

function portrait(name, ratio) {
  return sharp(src(name))
    .resize(1400, Math.round(1400 / ratio), { fit: 'cover', position: 'center' })
    .modulate({ saturation: 0.97 })
    .linear(1.05, -6);
}

const img = {};

// 1080x1350 clinic frames: privacy bar begins at y=1015 / 522 / 866 / 522 / 522 / 674.
const BAND = { left: 78, top: 0, width: 924, height: 520 };
console.log('Before / after pairs');
img['case-01-antes'] = await emit(await scalp('case-01-antes', BAND), 'case-01-antes', [640, 960, 1440]);
img['case-01-depois'] = await emit(await scalp('case-01-depois', BAND), 'case-01-depois', [640, 960, 1440]);
img['case-02-antes'] = await emit(await scalp('case-02-antes', BAND), 'case-02-antes', [640, 960, 1440]);
img['case-02-depois'] = await emit(await scalp('case-02-depois', BAND), 'case-02-depois', [640, 960, 1440]);
// 3024x4032 phone frames, cropped around the parting.
img['case-03-antes'] = await emit(
  await scalp('case-03-antes', { left: 0, top: 1250, width: 3024, height: 1701 }),
  'case-03-antes',
  [640, 960, 1440],
);
img['case-03-depois'] = await emit(
  await scalp('case-03-depois', { left: 0, top: 1150, width: 3024, height: 1701 }),
  'case-03-depois',
  [640, 960, 1440],
);

console.log('Clinical documentation');
img['eval-vertice'] = await emit(await scalp('eval-vertice', BAND), 'eval-vertice', [640, 960, 1440]);
img['result-frontal'] = await emit(await scalp('result-frontal', BAND), 'result-frontal', [640, 960, 1440]);
{
  const file = src('eval-feminina');
  const meta = await sharp(file).metadata();
  const pipeline =
    meta.width === 1080 && meta.height === 1350
      ? sharp(file).modulate({ saturation: 1.02 }).linear(1.02, -2)
      : sharp(file)
          .extract({ left: 300, top: 700, width: 2424, height: 2424 })
          .resize(1440, 810, { fit: 'cover' })
          .modulate({ saturation: 1.03 })
          .linear(1.03, -3);
  img['eval-feminina'] = await emit(pipeline, 'eval-feminina', [640, 960, 1440]);
}

console.log('Doctor portraits');
img['dr-portrait'] = await emit(portrait('dr-portrait-cufflink@2x', 0.78), 'dr-portrait', [560, 760, 1120]);
img['dr-standing'] = await emit(portrait('dr-portrait-standing@2x', 0.78), 'dr-standing', [560, 760, 1120]);
img['dr-planning'] = await emit(portrait('dr-planning@2x', 0.8), 'dr-planning', [560, 840, 1120]);

/**
 * The wordmark on the source site is gold foil photographed on brushed grey, so
 * it can't be keyed out cleanly. It is redrawn here in Cormorant Garamond —
 * including the mirrored E of the original lockup — which also makes it crisp at
 * any size. The live site renders the same lockup in HTML; this raster exists
 * only for social cards and other contexts that can't run CSS.
 */
function wordmarkSvg({ width = 720, color = GOLD, sub = 'TRANSPLANTE CAPILAR' } = {}) {
  // Letters are placed individually so the E can be mirrored in place, the way
  // it is in the clinic's own lockup.
  const letters = [
    ['G', 92],
    ['A', 226],
    ['L', 356],
    ['E', 484, true],
    ['B', 616],
  ];
  const glyphs = letters
    .map(([ch, cx, flip]) => {
      const t = flip ? ` transform="translate(${cx * 2} 0) scale(-1 1)"` : '';
      return `<text x="${cx}" y="152" text-anchor="middle"${t}>${ch}</text>`;
    })
    .join('\n      ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${Math.round(width * 0.42)}" viewBox="0 0 720 302">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${GOLD_SOFT}"/>
        <stop offset="52%" stop-color="${color}"/>
        <stop offset="100%" stop-color="#A9863F"/>
      </linearGradient>
    </defs>
    <g fill="url(#g)" font-family="Cormorant Garamond" font-weight="500" font-size="158">
      ${glyphs}
    </g>
    <g stroke="${color}" stroke-opacity="0.6" stroke-width="1.2">
      <line x1="132" y1="198" x2="338" y2="198"/>
      <line x1="382" y1="198" x2="588" y2="198"/>
    </g>
    <path d="M360 190 L368 198 L360 206 L352 198 Z" fill="${color}" fill-opacity="0.85"/>
    <text x="360" y="256" text-anchor="middle" font-family="Inter, DejaVu Sans, sans-serif"
      font-size="29" letter-spacing="10" fill="${color}" fill-opacity="0.9">${sub}</text>
  </svg>`;
}

console.log('Brand');
{
  const svg = Buffer.from(wordmarkSvg({ width: 720 }));
  for (const w of [320, 640]) {
    await sharp(svg, { density: 300 }).resize({ width: w }).png({ compressionLevel: 9 }).toFile(`${OUT}/logo-galeb-${w}.png`);
  }
  console.log('  logo-galeb 320/640');
}

/** Favicon and PWA icons reuse the clinic's own gold follicle mark. */
{
  const buf = await sharp(src('mark-follicle')).resize(512, 512, { fit: 'cover' }).toBuffer();
  for (const s of [16, 32, 180, 192, 512]) {
    await sharp(buf).resize(s, s).png({ compressionLevel: 9 }).toFile(`${OUT}/favicon-${s}.png`);
  }
  console.log('  favicons 16/32/180/192/512');
}

/** Social share card. Kept legible at WhatsApp thumbnail size. */
{
  const logo = await sharp(Buffer.from(wordmarkSvg({ width: 900 })), { density: 300 })
    .resize({ width: 520 })
    .toBuffer();
  const card = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0B0F1C"/>
        <stop offset="55%" stop-color="#121729"/>
        <stop offset="100%" stop-color="#07090F"/>
      </linearGradient>
      <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${GOLD}" stop-opacity="0"/>
        <stop offset="50%" stop-color="${GOLD}" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <rect x="44" y="44" width="1112" height="542" fill="none" stroke="${GOLD}" stroke-opacity="0.25"/>
    <text x="600" y="420" text-anchor="middle" font-family="Cormorant Garamond, DejaVu Serif, serif"
      font-size="52" fill="#F5F1E8">Transplante Capilar em S&#227;o Paulo</text>
    <rect x="450" y="452" width="300" height="1" fill="url(#rule)"/>
    <text x="600" y="502" text-anchor="middle" font-family="Inter, DejaVu Sans, sans-serif"
      font-size="20" letter-spacing="5" fill="${GOLD}">DR. GABRIEL GALEB</text>
    <text x="600" y="540" text-anchor="middle" font-family="Inter, DejaVu Sans, sans-serif"
      font-size="16" letter-spacing="2" fill="#8B90A3">T&#233;cnica FUE &#183; ASAHRS &#183; +1.000 procedimentos</text>
  </svg>`;
  const base = await sharp(Buffer.from(card), { density: 200 }).resize(1200, 630).png().toBuffer();
  await sharp(base)
    .composite([{ input: logo, top: 118, left: 340 }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(`${OUT}/og-cover.jpg`);
  console.log('  og-cover 1200x630');
}

fs.writeFileSync(`${OUT}/manifest.json`, JSON.stringify(img, null, 2));
const files = fs.readdirSync(OUT);
const total = files.reduce((n, f) => n + fs.statSync(path.join(OUT, f)).size, 0);
console.log(`\n${files.length} files, ${(total / 1024 / 1024).toFixed(2)} MB`);
