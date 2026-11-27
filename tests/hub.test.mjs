// Стартовая страница, 404 и страница «О витрине» в браузере (issue #68: ФТ-1, ФТ-3, ФТ-5, ФТ-6, НФТ-6, ГК-1).
// Сайт собирается из тестовой витрины (projects/mango-bcreq/tests/fixture) под base path /open-ai.ru/,
// как на GitHub Pages; нужен Chrome (CHROME_PATH или установленный канал chrome).
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { build, ROOT } from '../scripts/build-site.mjs';
import { launch } from '../scripts/check-mango.mjs';
import { serve } from '../scripts/static-server.mjs';

const FIXTURE = path.join(ROOT, 'projects/mango-bcreq/tests/fixture');
const BASE = '/open-ai.ru/';
let tmp;
let server;
let browser;
let origin;

before(async () => {
  tmp = mkdtempSync(path.join(os.tmpdir(), 'open-ai-hub-'));
  build({ out: tmp, basePath: BASE, mangoSource: path.join(FIXTURE, 'site'), mangoLock: path.join(FIXTURE, 'source.json') });
  server = await serve({ root: tmp, base: BASE });
  origin = server.url;
  browser = await launch();
});

after(async () => {
  await browser?.close();
  await server?.close();
  rmSync(tmp, { recursive: true, force: true });
});

async function open(url, { width = 1440, colorScheme = 'light' } = {}) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${origin}${url}`);
  return { page, errors, close: () => context.close() };
}

// Контраст текста к фактическому фону (WCAG 2.1): цвет текста смешивается с фоном по альфе,
// фон — первый непрозрачный background-color вверх по дереву.
function contrastReport() {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r, g, b, a };
  };
  const lum = ({ r, g, b }) => {
    const ch = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
  };
  const background = (el) => {
    for (let node = el; node; node = node.parentElement) {
      const bg = parse(getComputedStyle(node).backgroundColor);
      if (bg && bg.a > 0) return bg;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };
  const results = [];
  for (const el of document.querySelectorAll('body *')) {
    const own = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(' ');
    if (!own || !el.getClientRects().length || getComputedStyle(el).visibility === 'hidden') continue;
    const rect = el.getBoundingClientRect();
    if (rect.bottom < 0) continue; // ссылка «Перейти к проектам» до фокуса
    const fg = parse(getComputedStyle(el).color);
    const bg = background(el);
    const mixed = { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) };
    const [l1, l2] = [lum(mixed), lum(bg)].sort((a, b) => b - a);
    results.push({ text: own.slice(0, 40), tag: el.tagName, ratio: Math.round(((l1 + 0.05) / (l2 + 0.05)) * 100) / 100 });
  }
  return results;
}

describe('стартовая страница', () => {
  for (const colorScheme of ['light', 'dark']) {
    for (const url of [BASE, `${BASE}projects/mango-bcreq/`, `${BASE}no-such-page`]) {
      test(`контраст текста ≥ 4.5:1 — ${url}, тема ${colorScheme}`, async () => {
        const { page, close } = await open(url, { colorScheme });
        try {
          const report = await page.evaluate(contrastReport);
          assert.ok(report.length > 5, 'нет текста для проверки');
          const low = report.filter((r) => r.ratio < 4.5);
          assert.deepEqual(low, [], JSON.stringify(low));
        } finally {
          await close();
        }
      });
    }
  }

  test('тёмная тема по prefers-color-scheme', async () => {
    const backgrounds = [];
    for (const colorScheme of ['light', 'dark']) {
      const { page, close } = await open(BASE, { colorScheme });
      backgrounds.push(await page.evaluate(() => getComputedStyle(document.body).backgroundColor));
      await close();
    }
    assert.notEqual(backgrounds[0], backgrounds[1]);
  });

  test('структура: h1 → h2 → h3, две карточки с иконкой, названием, описанием и «Открыть»', async () => {
    const { page, errors, close } = await open(BASE);
    try {
      const headings = await page.locator('h1, h2, h3').evaluateAll((list) => list.map((h) => Number(h.tagName[1])));
      assert.equal(headings[0], 1);
      assert.equal(headings.filter((h) => h === 1).length, 1);
      headings.forEach((level, i) => assert.ok(i === 0 || level <= headings[i - 1] + 1, `пропуск уровня: ${headings}`));
      const cards = await page.locator('.card').evaluateAll((list) => list.map((card) => ({
        icon: card.querySelector('img')?.getAttribute('alt'),
        title: card.querySelector('h3')?.textContent.trim(),
        text: card.querySelector('.card__text, p:not(.card__tag)')?.textContent.trim().length,
        open: card.querySelector('a.button')?.textContent.trim(),
        href: card.querySelector('a.button')?.getAttribute('href'),
      })));
      assert.equal(cards.length, 2);
      for (const card of cards) {
        assert.ok(card.icon !== undefined && card.icon !== null, `у иконки нет alt: ${JSON.stringify(card)}`);
        assert.ok(card.title && card.text > 20, JSON.stringify(card));
        assert.equal(card.open, 'Открыть');
      }
      assert.deepEqual(cards.map((c) => c.href), ['projects/ai-team-management-program/', 'mango/']);
      assert.match(cards[1].title, /BCREQ \(mango\)/);
      assert.deepEqual(errors, []);
    } finally {
      await close();
    }
  });

  test('доступность: alt у изображений, имена у ссылок, aria-label у «Открыть», lang', async () => {
    const { page, close } = await open(BASE);
    try {
      assert.equal(await page.getAttribute('html', 'lang'), 'ru');
      assert.equal(await page.locator('img:not([alt])').count(), 0);
      const names = await page.locator('a').evaluateAll((list) => list.map((a) => (a.getAttribute('aria-label') || a.textContent).trim()));
      assert.ok(names.every(Boolean), JSON.stringify(names));
      assert.equal(await page.getByRole('link', { name: 'Открыть проект «ИИ в работе с командой»' }).count(), 1);
      assert.equal(await page.getByRole('link', { name: 'Открыть витрину BCREQ (mango)' }).count(), 1);
    } finally {
      await close();
    }
  });

  test('клавиатура: пропуск к проектам, Tab доходит до «Открыть», фокус виден', async () => {
    const { page, close } = await open(BASE);
    try {
      await page.keyboard.press('Tab');
      const skip = await page.evaluate(() => ({ text: document.activeElement.textContent.trim(), top: document.activeElement.getBoundingClientRect().top }));
      assert.match(skip.text, /проект/i);
      assert.ok(skip.top >= 0, 'ссылка пропуска не видна в фокусе');
      const seen = [];
      for (let i = 0; i < 8; i += 1) {
        await page.keyboard.press('Tab');
        seen.push(await page.evaluate(() => {
          const el = document.activeElement;
          const style = getComputedStyle(el);
          return { name: el.getAttribute('aria-label') || el.textContent.trim(), outline: style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 2 };
        }));
      }
      for (const name of ['Открыть проект «ИИ в работе с командой»', 'Открыть витрину BCREQ (mango)']) {
        const item = seen.find((s) => s.name === name);
        assert.ok(item, `${name} не достижим с клавиатуры: ${JSON.stringify(seen)}`);
        assert.ok(item.outline, `${name}: нет видимого фокуса`);
      }
    } finally {
      await close();
    }
  });

  test('адаптивность: без горизонтальной прокрутки от 320 до 1920px', async () => {
    for (const width of [320, 390, 768, 1024, 1440, 1920]) {
      for (const url of [BASE, `${BASE}projects/mango-bcreq/`, `${BASE}no-such-page`]) {
        const { page, close } = await open(url, { width });
        const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
        await close();
        assert.ok(scroll <= width, `${url} при ${width}px: scrollWidth ${scroll}`);
      }
    }
  });

  test('карточки: одна колонка на телефоне, две с 768px; кнопка не меньше 48px', async () => {
    for (const [width, columns] of [[390, 1], [768, 2], [1440, 2]]) {
      const { page, close } = await open(BASE, { width });
      const tops = await page.locator('.card').evaluateAll((list) => list.map((c) => Math.round(c.getBoundingClientRect().top)));
      const height = await page.locator('.card a.button').first().evaluate((a) => a.getBoundingClientRect().height);
      await close();
      assert.equal(new Set(tops).size, columns === 1 ? 2 : 1, `${width}px: ${tops}`);
      assert.ok(height >= 48, `${width}px: высота кнопки ${height}`);
    }
  });

  test('НФТ-6: переходы ≤ 300 мс, скругления ≤ 8px, тень ≤ 0 4px 12px rgba(0,0,0,.1), отступы кратны 8px', async () => {
    const { page, close } = await open(BASE);
    try {
      const styles = await page.evaluate(() => [...document.querySelectorAll('*')].map((el) => {
        const s = getComputedStyle(el);
        return {
          durations: [...s.transitionDuration.split(','), ...s.animationDuration.split(',')].map((d) => parseFloat(d) * (d.trim().endsWith('ms') ? 1 : 1000)),
          radius: parseFloat(s.borderTopLeftRadius),
        };
      }));
      assert.ok(Math.max(...styles.flatMap((s) => s.durations)) <= 300);
      assert.ok(Math.max(...styles.map((s) => s.radius)) <= 8);
      await page.locator('.card').first().hover();
      await page.waitForTimeout(350);
      const shadow = await page.locator('.card').first().evaluate((el) => getComputedStyle(el).boxShadow);
      const [x, y, blur] = shadow.match(/(-?\d+(?:\.\d+)?)px/g).map(parseFloat);
      const alpha = Number(shadow.match(/rgba\([^)]*,\s*([\d.]+)\)/)?.[1] ?? 1);
      assert.ok(Math.abs(x) <= 0 && y <= 4 && blur <= 12 && alpha <= 0.1, shadow);
    } finally {
      await close();
    }
    const css = readFileSync(path.join(ROOT, 'hub/assets/hub.css'), 'utf8');
    for (const [, prop, value] of css.matchAll(/\b(margin|padding|gap)(?:-[a-z]+)?:\s*([^;]+);/g)) {
      for (const px of value.matchAll(/(\d+)px/g)) assert.equal(Number(px[1]) % 8, 0, `${prop}: ${value}`);
    }
    const families = new Set([...css.matchAll(/--(?:font|mono):\s*([^;]+);/g)].map((m) => m[1]));
    assert.ok(families.size <= 2, [...families].join(' | '));
    assert.doesNotMatch(css, /@import|@font-face|fonts\.googleapis/);
  });

  test('старые закладки корня (#passport) ведут на брошюру, якоря страницы — нет', async () => {
    const { page, close } = await open(`${BASE}#passport`);
    try {
      await page.waitForURL(`${origin}${BASE}projects/ai-team-management-program/#passport`);
      await page.goto(`${origin}${BASE}#projects`);
      await page.waitForTimeout(200);
      assert.equal(page.url(), `${origin}${BASE}#projects`);
    } finally {
      await close();
    }
  });
});

describe('адреса вглубь витрины и 404 (ГК-1)', () => {
  const cases = [
    ['mango/ain-06', `${BASE}mango/#processes?step=AIN-06`],
    ['mango/AIN-24/', `${BASE}mango/#processes?step=AIN-24`],
    ['mango/%D1%88-3', `${BASE}mango/#processes?step=%D0%A8-3`],
    ['mango/sh-0', `${BASE}mango/#processes?step=%D0%A8-0`],
    ['mango/sh-v?track=system', `${BASE}mango/#processes?step=%D0%A8-%D0%92&track=system`],
    ['mango/catalog', `${BASE}mango/#catalog`],
    ['mango/glossary', `${BASE}mango/#glossary`],
  ];
  for (const [deep, expected] of cases) {
    test(`${BASE}${deep} → ${decodeURIComponent(expected)}`, async () => {
      const { page, close } = await open(`${BASE}${deep}`);
      try {
        await page.waitForURL((u) => u.pathname === `${BASE}mango/`);
        assert.equal(page.url().slice(origin.length), expected);
        const step = new URLSearchParams(new URL(page.url()).hash.split('?')[1] ?? '').get('step');
        if (step) {
          await page.locator(`[id="bcreq-testkit-${step}"]:focus`).waitFor({ timeout: 5000 });
          await page.reload();
          await page.locator(`[id="bcreq-testkit-${step}"]:focus`).waitFor({ timeout: 5000 });
        }
      } finally {
        await close();
      }
    });
  }

  for (const missing of ['no-such-page', 'mango/no-such-step', 'mango/ain-06/extra', 'projects/nothing/']) {
    test(`${BASE}${missing} — страница 404 со ссылками на проекты`, async () => {
      const { page, close } = await open(`${BASE}${missing}`);
      try {
        await page.waitForTimeout(200);
        assert.equal(new URL(page.url()).pathname, `${BASE}${missing}`);
        assert.match(await page.locator('h1').innerText(), /не найдена/);
        const hrefs = await page.locator('main a').evaluateAll((list) => list.map((a) => a.getAttribute('href')));
        assert.deepEqual(hrefs, [BASE, `${BASE}projects/ai-team-management-program/`, `${BASE}mango/`]);
        const css = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
        assert.match(css, /system-ui/, 'стили 404 не загрузились с абсолютного адреса');
      } finally {
        await close();
      }
    });
  }
});

describe('вход и выход (ФТ-3)', () => {
  test('брошюра → «Все проекты» → стартовая; «О витрине» → «Открыть» → витрина → «Все проекты»', async () => {
    const { page, close } = await open(`${BASE}projects/ai-team-management-program/`);
    try {
      await page.getByRole('link', { name: /Все проекты/ }).first().click();
      await page.waitForURL(`${origin}${BASE}`);
      await page.getByRole('link', { name: 'О витрине' }).click();
      await page.waitForURL(`${origin}${BASE}projects/mango-bcreq/`);
      assert.match(await page.locator('h1').innerText(), /BCREQ/);
      const text = await page.locator('main').innerText();
      assert.match(text, /v1\.0\.0/);
      assert.match(text, /0123456789abcdef0123456789abcdef01234567/);
      const source = await page.locator('a[href^="https://github.com/example-owner/fixture-spoke"]').evaluateAll((list) => list.map((a) => a.rel));
      assert.ok(source.length >= 1 && source.every((rel) => /nofollow/.test(rel) && /noopener/.test(rel)), JSON.stringify(source));
      await page.locator('main').getByRole('link', { name: /Открыть/ }).first().click();
      await page.waitForURL((u) => u.pathname === `${BASE}mango/`);
      await page.locator('#prompt-grid [data-copy-id]').first().waitFor();
      await page.locator('[data-deploy-home]').click();
      await page.waitForURL(`${origin}${BASE}`);
    } finally {
      await close();
    }
  });
});
