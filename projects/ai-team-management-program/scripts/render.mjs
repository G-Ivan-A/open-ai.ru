// Шаблоны цифровой брошюры (index.html и brochure.html) — чистый HTML/JS без Jekyll
// (issue #68, НФТ-3). Тексты страниц — дословно из content/*.md (SSOT); шаблоны меняют
// только уровень и оформление заголовков, оборачивают таблицы и добавляют атрибуты
// внешним ссылкам. Правила те же, что были в _includes/*.html до перехода:
//   hero       — первый экран: H1 и строка под ним из 01-project-summary.md;
//   mdDoc      — один файл content/*.md на веб-странице («page» или «section»);
//   webAppendix — раздел [4] «Кандидаты на роли» на сайте заменён на «Смотри PDF»;
//   pdfAppendix — раздел [4] в PDF полностью, «|» в строках кандидатов экранирован;
//   dropSections (brochure-common.mjs) — разделы H2, которые не выводятся в PDF.
// Markdown → HTML делает markdown-it с правилами, совместимыми с прежним kramdown (GFM):
// автоматические id заголовков, без типографской замены и автоссылок.
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: true, linkify: false, typographer: false });

// id заголовка по правилу kramdown GFM (generate_gfm_header_id): нижний регистр,
// удаляются символы кроме букв, цифр, «_», «-» и пробелов, пробелы → «-»;
// повтор в пределах одного файла — суффикс «-1», «-2»…
function headingId(text, seen) {
  let id = text.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- \t]/gu, '').replace(/[ \t]/g, '-');
  const n = seen.get(id) ?? 0;
  seen.set(id, n + 1);
  if (n > 0) id += `-${n}`;
  return id;
}

md.core.ruler.push('kramdown_header_ids', (state) => {
  const seen = new Map();
  state.tokens.forEach((token, i) => {
    if (token.type !== 'heading_open') return;
    const text = state.tokens[i + 1].children
      .filter((t) => t.type === 'text' || t.type === 'code_inline')
      .map((t) => t.content).join('');
    token.attrSet('id', headingId(text, seen));
  });
});

// Выравнивание столбцов таблиц — как у kramdown: style="text-align: right".
md.renderer.rules.th_open = md.renderer.rules.td_open = (tokens, i, options, env, self) => {
  const style = tokens[i].attrGet('style');
  if (style) tokens[i].attrSet('style', style.replace(/:\s*/, ': '));
  return self.renderToken(tokens, i, options);
};

export const markdownify = (source) => (source.trim() ? md.render(source) : '');

// Экранирование как у фильтра Liquid escape.
export const escape = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Внешние ссылки открываются в новой вкладке.
export const extLinks = (html) => html
  .replaceAll('<a href="http', '<a target="_blank" rel="noopener noreferrer" href="http');

const wrapTables = (html) => html
  .replaceAll('<table>', '<div class="table-wrap"><table>')
  .replaceAll('</table>', '</table></div>');

const H2 = '\n## ';
const firstLine = (s) => s.split('\n')[0];
const removeFirst = (s, part) => {
  const i = s.indexOf(part);
  return i < 0 ? s : s.slice(0, i) + s.slice(i + part.length);
};

// Первый экран: H1 и строка под ним — дословно из 01-project-summary.md.
// Кнопка — относительная ссылка на brochure.pdf рядом со страницей.
export function hero(source) {
  const head = source.split(H2)[0];
  const title = removeFirst(firstLine(head), '# ').trim();
  const subtitle = removeFirst(head, firstLine(head)).trim();
  return `<section class="hero" id="top" aria-labelledby="hero-title">
  <div class="container hero__inner">
    <h1 class="hero__title" id="hero-title">${escape(title)}</h1>
    <div class="hero__subtitle">${extLinks(markdownify(subtitle))}</div>
    <p class="hero__actions">
      <a class="button button--pdf" href="brochure.pdf" download data-pdf-link>📥 Скачать PDF-брошюру программы</a>
    </p>
  </div>
</section>
`;
}

// Один файл content/*.md на веб-странице.
//   heading "page":    H1 и строка под ним — в первом экране (hero), здесь — разделы H2 как h2;
//   heading "section": H1 → h2 раздела, H2 → h3 в раскрывающемся блоке (details), H3 → h4.
//   skip — заголовки H2, которые на веб-странице не выводятся.
// Номер блока в id — позиция раздела H2 в файле (пропущенные разделы номер не сдвигают).
export function mdDoc(source, { id, heading = 'section', label = '', skip = [] }) {
  const parts = source.trim().split(H2);
  const head = parts[0];
  const docTitle = removeFirst(firstLine(head), '# ').trim();
  const docIntro = removeFirst(head, firstLine(head)).trim();
  const section = heading === 'section';
  const out = [];
  out.push(`<section class="doc doc--${heading}" id="${id}"${section
    ? ` aria-labelledby="${id}-title"` : ` aria-label="${escape(label)}"`}>`);
  out.push('  <div class="container doc__inner">');
  if (section) {
    out.push(`    <h2 class="doc__title" id="${id}-title">${escape(docTitle)}</h2>`);
    out.push(`    <div class="doc__intro">${extLinks(markdownify(docIntro))}</div>`);
  }
  parts.slice(1).forEach((part, i) => {
    const partTitle = firstLine(part).trim();
    if (skip.includes(partTitle)) return;
    const body = removeFirst(part, firstLine(part));
    if (section) {
      const html = wrapTables(markdownify(`\n${body}`.replaceAll('\n### ', '\n#### ')));
      out.push(`    <details class="doc__part" id="${id}-${i}"${i === 0 ? ' open' : ''}>`);
      out.push(`      <summary><h3 class="doc__part-title">${escape(partTitle)}</h3></summary>`);
      out.push(`      <div class="doc__body">${extLinks(html)}</div>`);
      out.push('    </details>');
    } else {
      const html = wrapTables(markdownify(body));
      out.push(`    <div class="doc__part doc__part--flat" id="${id}-${i}">`);
      out.push(`      <h2 class="doc__part-title">${escape(partTitle)}</h2>`);
      out.push(`      <div class="doc__body">${extLinks(html)}</div>`);
      out.push('    </div>');
    }
  });
  out.push('  </div>', '</section>', '');
  return out.join('\n');
}

// Раздел [4] «Кандидаты на роли» на веб-странице (issue #65): вместо текста раздела —
// заголовок и абзац «Смотри PDF.» со ссылкой на brochure.pdf. [4] — последний раздел файла.
// То же правило — web_appendix в tests/check_site.py.
const TEAM_MARKER = '\n## [4] Кандидаты на роли\n';
export function webAppendix(source) {
  return `${source.split(TEAM_MARKER)[0]}${TEAM_MARKER}\nСмотри [PDF](brochure.pdf).\n`;
}

// Раздел [4] в brochure.html / brochure.pdf — полностью, слово в слово. В строках кандидатов
// («… | Метка GRA: …») знак «|» экранируется: строка не должна читаться как таблица.
export function pdfAppendix(source) {
  return source.split('\n\n')
    .map((p) => (p.includes(' | Метка GRA: ') ? p.replaceAll(' | ', ' \\| ') : p))
    .join('\n\n');
}

// Общий каркас веб-страницы: шапка с навигацией по разделам, подвал со ссылкой
// на стартовую страницу сайта («Все проекты», относительный путь ../../).
export function layout(site, content) {
  return `<!DOCTYPE html>
<html lang="${escape(site.lang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${site.title}</title>
  <meta name="description" content="${escape(site.description)}">
  <meta property="og:title" content="${escape(site.title)}">
  <meta property="og:description" content="${escape(site.description)}">
  <meta property="og:type" content="website">
  <meta name="theme-color" content="#14233d">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/css/site.css">
</head>
<body>
  <header class="site-header">
    <div class="container site-header__inner">
      <a class="brand" href="#top">${site.title}</a>
      <nav class="site-nav" aria-label="${site.title}">
        <ul>
          <li><a href="#summary">Резюме проекта</a></li>
          <li><a href="#passport">Паспорт проекта</a></li>
          <li><a href="#appendix">Приложение</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main id="main">
${content}
  </main>

  <footer class="site-footer">
    <div class="container site-footer__inner">
      <p>${site.title}</p>
      <p><a class="site-footer__home" href="../../">Все проекты</a></p>
    </div>
  </footer>
</body>
</html>
`;
}

// Страница для печати — источник brochure.pdf. Четыре файла SSOT в строгом порядке,
// каждый со своим заголовком 1 уровня; без скриптов, robots noindex.
export function brochure(site, docs) {
  const articles = docs.map(({ id, rel, markdown }) => `  <article class="brochure-doc" id="${id}" data-source="${rel}">
${extLinks(markdownify(markdown))}
  </article>`).join('\n');
  return `<!DOCTYPE html>
<html lang="${escape(site.lang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>${site.title}</title>
  <link rel="stylesheet" href="assets/css/brochure.css">
</head>
<body>
${articles}
</body>
</html>
`;
}
