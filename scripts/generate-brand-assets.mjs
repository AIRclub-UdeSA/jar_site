import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const projectRoot = new URL('../', import.meta.url);
const sourceUrl = new URL('public/favicon-source.png', projectRoot);
const source = await readFile(sourceUrl);

const png16 = await sharp(source)
  .resize(16, 16, { kernel: sharp.kernel.nearest })
  .png({ compressionLevel: 9 })
  .toBuffer();
const png32 = await sharp(source)
  .resize(32, 32, { kernel: sharp.kernel.nearest })
  .png({ compressionLevel: 9 })
  .toBuffer();
const png192 = await sharp(source)
  .resize(192, 192, { kernel: sharp.kernel.nearest })
  .png({ compressionLevel: 9 })
  .toBuffer();
const png512 = await sharp(source)
  .resize(512, 512, { kernel: sharp.kernel.nearest })
  .png({ compressionLevel: 9 })
  .toBuffer();

await Promise.all([
  writeFile(new URL('public/favicon-16x16.png', projectRoot), png16),
  writeFile(new URL('public/favicon-32x32.png', projectRoot), png32),
  writeFile(new URL('public/favicon-192x192.png', projectRoot), png192),
  writeFile(new URL('public/favicon-512x512.png', projectRoot), png512),
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

await writeFile(
  new URL('public/favicon.ico', projectRoot),
  Buffer.concat([icoHeader, png16, png32]),
);

console.log('Generated favicon assets at 16, 32, 192 and 512 px, plus favicon.ico.');
