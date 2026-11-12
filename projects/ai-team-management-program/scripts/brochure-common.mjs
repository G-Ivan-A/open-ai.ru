// Общие функции генерации и проверки brochure.pdf.
// SSOT — content/*.md; порядок PDF и правило согласия кандидатов (_data/team.yml) — здесь же,
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

// Разбор YAML-подмножества _data/team.yml: словари, списки словарей, строки в
// кавычках, true/false, комментарии «#» в начале строки. Внешних библиотек нет:
// файл поддерживается вручную и имеет фиксированную структуру. Тот же разбор —
// parse_yaml в tests/check_site.py.
export function parseYaml(text) {
  const lines = text.replace(/\r/g, '').split('\n')
    .filter((l) => l.trim() !== '' && !l.trim().startsWith('#'));
  const indent = (l) => l.length - l.trimStart().length;
  const scalar = (v) => {
    v = v.trim();
    if (v === 'true' || v === 'false') return v === 'true';
    const q = v.match(/^"(.*)"$/);
    return q ? q[1].replace(/\\"/g, '"') : v;
  };
  let i = 0;
  function node(ind) {
    if (lines[i].trimStart().startsWith('- ')) {
      const list = [];
      while (i < lines.length && indent(lines[i]) === ind && lines[i].trimStart().startsWith('- ')) {
        lines[i] = ' '.repeat(ind + 2) + lines[i].trimStart().slice(2);
        list.push(node(ind + 2));
      }
      return list;
    }
    const map = {};
    while (i < lines.length && indent(lines[i]) === ind && !lines[i].trimStart().startsWith('- ')) {
      const m = lines[i].trim().match(/^([\w-]+):(?:\s+(.*))?$/);
      if (!m) throw new Error(`team.yml: не разобрана строка «${lines[i]}»`);
      i += 1;
      if (m[2] !== undefined) map[m[1]] = scalar(m[2]);
      else map[m[1]] = i < lines.length && indent(lines[i]) >= ind ? node(indent(lines[i])) : null;
    }
    return map;
  }
  return lines.length ? node(indent(lines[0])) : {};
}

export function team(teamYml = path.join(PROJECT, '_data', 'team.yml')) {
  return parseYaml(readFileSync(teamYml, 'utf8'));
}

// Кандидаты из _data/team.yml: [{ role, slot, name, company, fact, gra, sources }].
export function candidates(teamYml) {
  return team(teamYml).candidates ?? [];
}

// Разделы H2, которые в PDF не выводятся (issue #63) — то же правило, что
// в brochure.html (_includes/drop-sections.html) и tests/check_site.py (BROCHURE_SKIP).
export const PDF_SKIP = {
  'content/01-project-summary.md': ['Почему так'],
};

// Markdown без разделов H2 с заголовками из skip; остальной текст — дословно.
export function dropSections(markdown, skip = []) {
  if (!skip.length) return markdown;
  const [head, ...parts] = markdown.split('\n## ');
  return [head, ...parts.filter((p) => !skip.includes(p.split('\n')[0].trim()))].join('\n## ');
}

// Разделы, исключённые из PDF: [{ rel, title, blocks }] — для проверки, что их нет.
export function skippedSections(rel) {
  const md = readFileSync(path.join(PROJECT, rel), 'utf8');
  return (PDF_SKIP[rel] || []).map((title) => {
    const part = md.split('\n## ').find((p) => p.split('\n')[0].trim() === title) ?? '';
    return { rel, title, blocks: mdBlocks(`## ${part}`) };
  });
}

export function readSource(rel) {
  // Раздел [4] «Кандидаты на роли» в PDF — полностью, дословно, со ссылками (issue #65).
  return dropSections(readFileSync(path.join(PROJECT, rel), 'utf8'), PDF_SKIP[rel]);
}

// «а.ч.» без «к»: в текстах используется только «ак.ч.» (issue #63).
export const OLD_HOURS = /(?<![А-Яа-яЁё])[аА]\.ч\./;

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
