// Отпечаток каталога (issue #68, НФТ-5): sha256 от списка «<sha256 файла>  ./<путь>»,
// отсортированного побайтово, — то же, что выдаёт
//   cd site && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum | sha256sum
// Одинаковый отпечаток = побайтово одинаковые файлы с одинаковыми путями.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const sha256 = (data) => createHash('sha256').update(data).digest('hex');

// Все файлы каталога: пути относительно dir через «/», побайтовый порядок (как LC_ALL=C sort).
export function listFiles(dir) {
  const files = readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(dir, path.join(entry.parentPath, entry.name)).split(path.sep).join('/'));
  return files.sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)));
}

export function treeHash(dir) {
  const lines = listFiles(dir).map((rel) => {
    if (/[\n\\]/.test(rel)) throw new Error(`Недопустимое имя файла: ${JSON.stringify(rel)}`);
    return `${sha256(readFileSync(path.join(dir, rel)))}  ./${rel}\n`;
  });
  return { sha256: sha256(lines.join('')), files: lines.length };
}
