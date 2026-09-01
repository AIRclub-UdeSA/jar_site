import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const projectRoot = new URL('../', import.meta.url);
const sourceUrl = new URL('brand/favicon-source.png', projectRoot);
const source = await readFile(sourceUrl);
const tabIconSource = await readFile(new URL('public/tab-icon-v2.svg', projectRoot));

const removeOuterBackground = async (input) => {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  const isBackground = (pixel) => {
    const offset = pixel * channels;
    return data[offset] <= 2 && data[offset + 1] <= 2 && data[offset + 2] <= 2;
  };

  const enqueue = (pixel) => {
    if (visited[pixel] || !isBackground(pixel)) return;
    visited[pixel] = 1;
    queue[tail++] = pixel;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }

  for (let y = 1; y < height - 1; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }

  while (head < tail) {
    const pixel = queue[head++];
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    data[pixel * channels + 3] = 0;

    if (x > 0) enqueue(pixel - 1);
    if (x < width - 1) enqueue(pixel + 1);
    if (y > 0) enqueue(pixel - width);
    if (y < height - 1) enqueue(pixel + width);
  }

  return { data, raw: { width, height, channels } };
};

const transparentSource = await removeOuterBackground(source);

const renderIcon = (size) =>
  sharp(transparentSource.data, { raw: transparentSource.raw })
    .resize(size, size, { kernel: sharp.kernel.nearest })
    .png({ compressionLevel: 9 })
    .toBuffer();

const [png192] = await Promise.all([192].map(renderIcon));

const renderTabIcon = (size) =>
  sharp(tabIconSource, { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();

const [png16, png32] = await Promise.all([16, 32].map(renderTabIcon));

await Promise.all([
  writeFile(new URL('public/favicon-192x192.png', projectRoot), png192),
  writeFile(new URL('public/tab-icon-v2-16x16.png', projectRoot), png16),
  writeFile(new URL('public/tab-icon-v2-32x32.png', projectRoot), png32),
]);

const icoHeader = Buffer.alloc(38);
icoHeader.writeUInt16LE(0, 0);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(2, 4);

const writeIcoEntry = (offset, size, png, dataOffset) => {
  icoHeader.writeUInt8(size, offset);
  icoHeader.writeUInt8(size, offset + 1);
  icoHeader.writeUInt8(0, offset + 2);
  icoHeader.writeUInt8(0, offset + 3);
  icoHeader.writeUInt16LE(1, offset + 4);
  icoHeader.writeUInt16LE(32, offset + 6);
  icoHeader.writeUInt32LE(png.length, offset + 8);
  icoHeader.writeUInt32LE(dataOffset, offset + 12);
};

writeIcoEntry(6, 16, png16, icoHeader.length);
writeIcoEntry(22, 32, png32, icoHeader.length + png16.length);

const ico = Buffer.concat([icoHeader, png16, png32]);

await writeFile(new URL('public/tab-icon-v2.ico', projectRoot), ico);

console.log('Generated transparent brand assets and circular high-contrast tab icons.');
