// Image processing v2 - more conservative, preserve natural color
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const IMG_DIR = 'assets/img';
const OUT_DIR = 'assets/img/processed';
fs.mkdirSync(OUT_DIR, { recursive: true });

// Black bar positions detected in 1080x1350 phone screenshots:
// case2-after.png, case3-before.png: rows 522-757
// case-man-bald-before.png: rows 1015-1250 (different position)
// Other images (taller 3:4 photos) have no black bar

const imageConfigs = {
  'case2-after.png': { cropBottom: 520 },
  'case3-before.png': { cropBottom: 520 },
  'case-man-bald-before.png': { cropBottom: 1010 },
  // 3024x4032 photos: no black bars, but may need slight crop to focus on head
  'case4-after.jpg': { cropTop: 0, cropBottom: 0, focusTop: 0.05 }, // keep top 90%
  'case4-before.jpeg': { cropTop: 0, cropBottom: 0, focusTop: 0.05 },
  'case5-before.jpeg': { cropTop: 0, cropBottom: 0, focusTop: 0.0 },
  'case6-before.jpeg': { cropTop: 0, cropBottom: 0, focusTop: 0.05 },
};

async function processPatientPhoto(inputFile, outputName, config) {
  const inputPath = path.join(IMG_DIR, inputFile);
  const outputPath = path.join(OUT_DIR, outputName);
  if (!fs.existsSync(inputPath)) return;

  const meta = await sharp(inputPath).metadata();
  console.log('  Processing', inputFile, '(' + meta.width + 'x' + meta.height + ')');

  let pipeline = sharp(inputPath);

  // Apply crops
  let cropHeight = meta.height;
  let cropTop = config.cropTop || 0;

  if (config.cropBottom > 0) {
    cropHeight = config.cropBottom - cropTop;
  } else if (config.focusTop !== undefined && config.focusTop > 0) {
    // For taller images, take the top portion (where the head is)
    const focusTopPx = Math.floor(meta.height * config.focusTop);
    cropTop = focusTopPx;
    cropHeight = Math.floor(meta.height * 0.85);
  }

  pipeline = pipeline.extract({
    left: 0,
    top: cropTop,
    width: meta.width,
    height: cropHeight,
  });

  // Resize to 4:5 (1080x1350)
  pipeline = pipeline.resize(1080, 1350, {
    fit: 'cover',
    position: 'top', // keep head visible
  });

  // Minimal treatment: just slight saturation boost and warm tone
  // The original photos are already well-lit, don't need heavy processing
  pipeline = pipeline
    .modulate({ saturation: 1.05, brightness: 1.02 })
    .linear(1.03, -3)
    .jpeg({ quality: 90, mozjpeg: true });

  await pipeline.toFile(outputPath);
  const outMeta = await sharp(outputPath).metadata();
  const outSize = fs.statSync(outputPath).size;
  console.log('    ->', outMeta.width + 'x' + outMeta.height, outSize, 'bytes');
}

async function processDoctorPhoto(inputFile, outputName, treatment = 'warm') {
  const inputPath = path.join(IMG_DIR, inputFile);
  const outputPath = path.join(OUT_DIR, outputName);
  if (!fs.existsSync(inputPath)) return;

  const meta = await sharp(inputPath).metadata();
  console.log('  Doctor', inputFile, '(' + meta.width + 'x' + meta.height + ')');

  let pipeline = sharp(inputPath);

  if (treatment === 'cinematic') {
    // Hero: dramatic but tasteful, slight cinematic grade
    pipeline = pipeline
      .resize(1200, 1500, { fit: 'cover', position: 'center' })
      .modulate({ saturation: 0.95, brightness: 0.98 })
      .linear(1.08, -8)  // contrast boost
      .jpeg({ quality: 90, mozjpeg: true });
  } else {
    // Standard editorial: keep natural, slight warm shift
    pipeline = pipeline
      .resize(1080, 1350, { fit: 'cover', position: 'center' })
      .modulate({ saturation: 1.0, brightness: 1.0 })
      .jpeg({ quality: 90, mozjpeg: true });
  }

  await pipeline.toFile(outputPath);
  const outMeta = await sharp(outputPath).metadata();
  console.log('    ->', outMeta.width + 'x' + outMeta.height, fs.statSync(outputPath).size, 'bytes');
}

async function processClinicPhoto(inputFile, outputName) {
  const inputPath = path.join(IMG_DIR, inputFile);
  const outputPath = path.join(OUT_DIR, outputName);
  if (!fs.existsSync(inputPath)) return;

  // 4:3 ratio for clinic procedural, top-crop to focus on hands/face
  await sharp(inputPath)
    .resize(1200, 1500, { fit: 'cover', position: 'top' })
    .modulate({ saturation: 1.05, brightness: 1.0 })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(outputPath);
  const outMeta = await sharp(outputPath).metadata();
  console.log('  Clinic', inputFile, '->', outMeta.width + 'x' + outMeta.height, fs.statSync(outputPath).size, 'bytes');
}

async function generateTestimonialAvatar(name, treatment = 'gold') {
  const size = 400;
  const initials = name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
    <defs>
      <radialGradient id="g" cx="50%" cy="40%">
        <stop offset="0%" stop-color="#222226"/>
        <stop offset="100%" stop-color="#0B0B0F"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <circle cx="50%" cy="38%" r="68" fill="none" stroke="#B8963E" stroke-width="0.8" opacity="0.25"/>
    <circle cx="50%" cy="38%" r="80" fill="none" stroke="#B8963E" stroke-width="0.4" opacity="0.15"/>
    <text x="50%" y="50%" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="62" font-weight="500" fill="#D4AF37">${initials}</text>
    <line x1="32%" y1="68%" x2="68%" y2="68%" stroke="#B8963E" stroke-width="0.5" opacity="0.4"/>
    <text x="50%" y="78%" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="500" letter-spacing="0.3em" fill="#FAF6EE" opacity="0.65">SÃO PAULO</text>
  </svg>`;
  const outPath = path.join(OUT_DIR, `avatar-${name.toLowerCase().replace(/\s+/g, '-').replace('é','e')}.jpg`);
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 92 })
    .toFile(outPath);
  console.log('  Avatar:', path.basename(outPath));
}

async function generateOgCover() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
    <defs>
      <radialGradient id="goldGlow" cx="80%" cy="30%" r="60%">
        <stop offset="0%" stop-color="#3a2a1a" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#0B0B0F" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="goldLine" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#B8963E" stop-opacity="0"/>
        <stop offset="50%" stop-color="#D4AF37" stop-opacity="1"/>
        <stop offset="100%" stop-color="#B8963E" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="#0B0B0F"/>
    <rect width="1200" height="630" fill="url(#goldGlow)"/>
    <line x1="0" y1="60" x2="1200" y2="60" stroke="url(#goldLine)" stroke-width="1"/>
    <circle cx="1080" cy="120" r="40" fill="none" stroke="#D4AF37" stroke-width="1.5"/>
    <text x="1080" y="135" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="38" font-weight="500" fill="#D4AF37">G</text>
    <text x="80" y="120" font-family="Inter, sans-serif" font-size="14" font-weight="500" letter-spacing="6" fill="#D4AF37">TRANSPLANTE CAPILAR · SÃO PAULO</text>
    <text x="80" y="290" font-family="Cormorant Garamond, Georgia, serif" font-size="76" font-weight="500" fill="#FAF6EE" letter-spacing="-0.01em">
      <tspan x="80" dy="0">A arte da</tspan>
      <tspan x="80" dy="86" font-style="italic" fill="#D4AF37">restauração</tspan>
      <tspan x="80" dy="86" font-style="italic" fill="#D4AF37">capilar.</tspan>
    </text>
    <text x="80" y="555" font-family="Inter, sans-serif" font-size="15" font-weight="300" fill="#9A9A9F" letter-spacing="0.05em">
      <tspan x="80" dy="0">Dr. Gabriel Galeb · CRM-SP · ASAHRS</tspan>
      <tspan x="80" dy="22">+1.000 procedimentos · São Paulo</tspan>
    </text>
    <line x1="0" y1="590" x2="1200" y2="590" stroke="url(#goldLine)" stroke-width="1"/>
  </svg>`;
  const outPath = path.join(OUT_DIR, 'og-cover.jpg');
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 92 })
    .toFile(outPath);
  console.log('  OG cover:', fs.statSync(outPath).size, 'bytes');
}

console.log('=== Patient photos ===');
for (const [file, config] of Object.entries(imageConfigs)) {
  await processPatientPhoto(file, file, config);
}

console.log('\n=== Doctor portraits ===');
await processDoctorPhoto('doctor-hero.jpeg', 'doctor-hero.jpg', 'cinematic');
await processDoctorPhoto('doctor-cufflink.jpeg', 'doctor-cufflink.jpg', 'natural');

console.log('\n=== Clinic photo ===');
await processClinicPhoto('clinic-procedure.jpg', 'clinic-procedure.jpg');

console.log('\n=== Testimonial avatars ===');
await generateTestimonialAvatar('Ricardo M');
await generateTestimonialAvatar('Felipe A');
await generateTestimonialAvatar('André L');

console.log('\n=== OG cover ===');
await generateOgCover();
console.log('\n=== Done! ===');
