import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMAGE_DIR = path.join(ROOT, 'assets', 'img');

const expectedImages = [
  ...Array.from({ length: 6 }, (_, index) => {
    const caseNumber = String(index + 1).padStart(2, '0');
    return [
      [`case-${caseNumber}-before.webp`, 1080, 1350],
      [`case-${caseNumber}-after.webp`, 1080, 1350],
    ];
  }).flat(),
  ['doctor-hero-source.webp', 768, 1024],
  ['doctor-about-source.webp', 628, 1024],
];

async function validateImage([fileName, expectedWidth, expectedHeight]) {
  const filePath = path.join(IMAGE_DIR, fileName);
  const [{ format, width, height }, { size }] = await Promise.all([
    sharp(filePath).metadata(),
    fs.stat(filePath),
  ]);

  if (format !== 'webp' || width !== expectedWidth || height !== expectedHeight) {
    throw new Error(
      `${fileName}: expected WebP ${expectedWidth}x${expectedHeight}, received ${format ?? 'unknown'} ${width ?? '?'}x${height ?? '?'}`,
    );
  }

  return `${fileName}: ${width}x${height}, ${Math.round(size / 1024)} KB`;
}

const results = await Promise.all(expectedImages.map(validateImage));
console.log(`Validated ${results.length} source-faithful WebP images:\n${results.join('\n')}`);
