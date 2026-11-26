// Derives the site's logo and icons from `assets/logo-source.png`.
import { URL, fileURLToPath } from 'node:url';
import sharp from 'sharp';

const path = (file) => fileURLToPath(new URL(`../${file}`, import.meta.url));
const white = '#ffffff';
const trimmed = await sharp(path('assets/logo-source.png'))
  .trim({ background: white, threshold: 20 })
  .toBuffer();

for (const [file, size] of [
  ['public/logo.png', 512],
  ['app/icon.png', 96],
  ['app/apple-icon.png', 180],
]) {
  const margin = Math.round(size * 0.04);
  const inner = size - margin * 2;
  await sharp(trimmed)
    .resize(inner, inner, { fit: 'contain', background: white })
    .extend({ top: margin, bottom: margin, left: margin, right: margin, background: white })
    .png({ compressionLevel: 9 })
    .toFile(path(file));
}
