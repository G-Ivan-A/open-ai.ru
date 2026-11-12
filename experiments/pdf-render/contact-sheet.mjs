// Контактный лист страниц PDF: node contact-sheet.mjs <file.pdf> <out.png> [cols] [width]
import { readFileSync, writeFileSync } from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
const [file, out, colsArg = '4', widthArg = '300'] = process.argv.slice(2);
const doc = await pdfjs.getDocument({ data: new Uint8Array(readFileSync(file)) }).promise;
const cols = Number(colsArg); const w = Number(widthArg); const gap = 16;
const first = await doc.getPage(1); const base = first.getViewport({ scale: 1 });
const scale = w / base.width; const h = Math.ceil(base.height * scale);
const rows = Math.ceil(doc.numPages / cols);
const sheet = createCanvas(cols * (w + gap) + gap, rows * (h + gap) + gap);
const sctx = sheet.getContext('2d'); sctx.fillStyle = '#d9dde5'; sctx.fillRect(0, 0, sheet.width, sheet.height);
for (let n = 1; n <= doc.numPages; n += 1) {
  const page = await doc.getPage(n); const vp = page.getViewport({ scale });
  const c = createCanvas(Math.ceil(vp.width), Math.ceil(vp.height)); const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
  await page.render({ canvasContext: ctx, viewport: vp, canvas: c }).promise;
  const i = n - 1; sctx.drawImage(c, gap + (i % cols) * (w + gap), gap + Math.floor(i / cols) * (h + gap));
}
writeFileSync(out, sheet.toBuffer('image/png'));
console.log(`${doc.numPages} pages → ${out}`);
