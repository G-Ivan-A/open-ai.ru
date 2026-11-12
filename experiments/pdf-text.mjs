// Текст PDF по страницам (pdf.js): node experiments/pdf-text.mjs <файл.pdf>
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../projects/ai-team-management-program/package.json', import.meta.url));
const { getDocument } = await import(require.resolve('pdfjs-dist/legacy/build/pdf.mjs'));
const pdf = await getDocument({ data: new Uint8Array(readFileSync(process.argv[2])), verbosity: 0 }).promise;
for (let n = 1; n <= pdf.numPages; n += 1) {
  const { items } = await (await pdf.getPage(n)).getTextContent();
  console.log(`=== стр. ${n}`);
  console.log(items.map((it) => it.str + (it.hasEOL ? '\n' : '')).join(''));
}
