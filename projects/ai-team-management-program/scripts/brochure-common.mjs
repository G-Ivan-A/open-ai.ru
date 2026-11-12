// Общие функции генерации и проверки brochure.pdf.
// SSOT — content/*.md; порядок PDF и правило согласия кандидатов — здесь же,
// чтобы скрипт генерации и проверка не расходились.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const REPO = path.resolve(PROJECT, '..', '..');
export const DEFAULT_SITE = path.join(REPO, '_site', 'projects', 'ai-team-management-program');

// Строгий порядок разделов PDF (issue #61): 01 → 02 → 05 → 03.
export const ORDER = [
  'content/01-project-summary.md',
  'content/02-project-passport.md',
  'content/05-detailed-economics.md',
  'content/03-appendix.md',
];

// Файлы, от которых зависит PDF: собранная страница, её стили и скрипт генерации.
export const HASH_INPUTS = ['brochure.html', 'assets/css/brochure.css'];
export const HASH_PREFIX = 'ssot-sha256:';

export function sourceHash(site) {
  const h = createHash('sha256');
  for (const rel of HASH_INPUTS) {
    h.update(rel + '\0');
    h.update(readFileSync(path.join(site, rel)));
    h.update('\0');
  }
  h.update('scripts/build-pdf.mjs\0');
  h.update(readFileSync(path.join(PROJECT, 'scripts', 'build-pdf.mjs')));
  return h.digest('hex');
}

export function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

// _data/team.yml → [{ slot, name, consent }] (простой построчный разбор: файл
// поддерживается вручную и имеет фиксированную структуру).
export function candidates(teamYml = path.join(PROJECT, '_data', 'team.yml')) {
  const text = readFileSync(teamYml, 'utf8');
  const block = text.split(/^candidates:\s*$/m)[1]?.split(/^\S/m)[0] ?? '';
  return block.split(/^  - /m).slice(1).map((item) => {
    const get = (key) => item.match(new RegExp(`^\\s*${key}:\\s*"?(.*?)"?\\s*$`, 'm'))?.[1];
    return { slot: get('slot'), name: get('name'), consent: get('consent') === 'true' };
  });
}

// То же правило, что в _includes/consent.html: абзацы, которые не публикуются.
export function consentFilter(markdown, cands = candidates()) {
  const shown = cands.filter((c) => c.consent).length;
  return markdown.split('\n\n').filter((p) => {
    for (const c of cands) {
      if (c.consent) continue;
      if (p.startsWith(`${c.slot}: `)) return false;
      if (p.startsWith('**Источники:**') && p.includes(c.name)) return false;
    }
    if (p.startsWith('**Метка GRA:**') && shown === 0) return false;
    return true;
  }).join('\n\n');
}

export function readSource(rel) {
  const md = readFileSync(path.join(PROJECT, rel), 'utf8');
  return rel.endsWith('03-appendix.md') ? consentFilter(md) : md;
}

const inline = (s) => s
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/\*\*/g, '')
  .trim();

// Markdown → последовательность текстовых блоков в порядке файла:
// { kind: 'h1'|'h2'|'h3'|'p'|'li'|'td', text }.
export function mdBlocks(markdown) {
  const out = [];
  for (const block of markdown.replace(/\r/g, '').split(/\n\s*\n/)) {
    const lines = block.split('\n').filter((l) => l.trim() !== '');
    if (!lines.length) continue;
    const h = lines[0].match(/^(#{1,6}) (.*)$/);
    if (h && lines.length === 1) {
      out.push({ kind: `h${h[1].length}`, text: inline(h[2]) });
    } else if (lines[0].startsWith('|')) {
      for (const line of lines) {
        if (/^\|[\s:|-]+\|$/.test(line)) continue;
        for (const cell of line.replace(/^\|/, '').replace(/\|$/, '').split('|')) {
          const t = inline(cell);
          if (t) out.push({ kind: 'td', text: t });
        }
      }
    } else if (/^- /.test(lines[0])) {
      let item = null;
      for (const line of lines) {
        if (/^- /.test(line)) {
          if (item !== null) out.push({ kind: 'li', text: inline(item) });
          item = line.slice(2);
        } else {
          item += ' ' + line.trim();
        }
      }
      if (item !== null) out.push({ kind: 'li', text: inline(item) });
    } else {
      out.push({ kind: 'p', text: inline(lines.join(' ')) });
    }
  }
  return out;
}

// Сравнение без учёта пробелов и переносов строк: разметка PDF переносит строки иначе, чем .md.
export const squash = (s) => s.replace(/\s+/g, '');
