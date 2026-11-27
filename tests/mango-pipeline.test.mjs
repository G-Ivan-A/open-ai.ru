// Сборка сайта и витрины BCREQ без браузера (issue #68): fail-closed, детерминизм, приватность.
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, test } from 'node:test';
import { build, fill, mangoSteps, normalizeBasePath, ROOT } from '../scripts/build-site.mjs';
import { checkSite, links, target } from '../scripts/check-site.mjs';
import { checkPrivacy } from '../projects/mango-bcreq/scripts/check-privacy.mjs';
import { readLock, validateLock } from '../projects/mango-bcreq/scripts/lock.mjs';
import {
  SourceError, patchApp, patchGate, patchIndex, prepare, verifySource, versionAssets,
} from '../projects/mango-bcreq/scripts/prepare-site.mjs';
import { treeHash } from '../projects/mango-bcreq/scripts/tree.mjs';

const FIXTURE = path.join(ROOT, 'projects/mango-bcreq/tests/fixture');
const SOURCE = path.join(FIXTURE, 'site');
const LOCK_FILE = path.join(FIXTURE, 'source.json');
const lock = readLock(LOCK_FILE);
const tmp = mkdtempSync(path.join(os.tmpdir(), 'open-ai-site-'));
after(() => rmSync(tmp, { recursive: true, force: true }));

const copySource = (name) => {
  const dir = path.join(tmp, name);
  cpSync(SOURCE, dir, { recursive: true });
  return dir;
};

describe('source.json', () => {
  test('реальный и тестовый source.json проходят проверку', () => {
    assert.equal(readLock().path, 'site');
    assert.equal(lock.repository, 'example-owner/fixture-spoke');
  });

  test('ветка вместо полного SHA, пустой отпечаток — ошибка', () => {
    assert.throws(() => validateLock({ ...lock, commit: 'main' }), /commit: ожидается полный SHA/);
    assert.throws(() => validateLock({ ...lock, tree: { sha256: 'x', files: 0 } }), /tree\.sha256.*tree\.files/);
    assert.throws(() => validateLock({ ...lock, version: 'latest' }), /version/);
  });

  test('отпечаток тестовой витрины совпадает с source.json', () => {
    assert.deepEqual(treeHash(SOURCE), lock.tree);
  });
});

describe('verifySource: fail-closed (ГК-2, НФТ-5)', () => {
  test('нет каталога — причина «забор не выполнен»', () => {
    assert.throws(() => verifySource(path.join(tmp, 'missing'), lock), /не найден.*Забор site\/ из example-owner\/fixture-spoke не выполнен/);
  });

  test('пустой каталог — публикация пустой витрины запрещена', () => {
    const dir = path.join(tmp, 'empty');
    mkdirSync(dir, { recursive: true });
    assert.throws(() => verifySource(dir, lock), /пуст.*Публикация пустой витрины запрещена/);
  });

  test('изменённый файл — расхождение с source.json', () => {
    const dir = copySource('changed');
    writeFileSync(path.join(dir, 'data/prompts.json'), '{"prompts":[]}');
    assert.throws(() => verifySource(dir, lock), (error) => error instanceof SourceError && /не совпадает с source\.json/.test(error.message));
  });

  test('версия в source.json не совпадает с index.html', () => {
    assert.throws(() => verifySource(SOURCE, { ...lock, version: '9.9.9' }), /не показывает версию v9\.9\.9/);
  });
});

describe('правки витрины проверяют число совпадений', () => {
  test('footer не найден — ошибка, а не молчаливый пропуск', () => {
    assert.throws(() => patchIndex('<script src="a.js"></script><footer>x</footer>', { lock, v: 'abc' }), /site-footer.*найден 0 раз/);
  });

  test('HOME_URL не найден или найден дважды', () => {
    assert.throws(() => patchGate('const x = 1;'), /HOME_URL: шаблон найден 0 раз/);
    const twice = 'const HOME_URL = "a";\nconst HOME_URL = "b";';
    assert.throws(() => patchGate(twice), /найден 2 раз/);
  });

  test('app.js без data/*.json и HTML без локальных ресурсов', () => {
    assert.throws(() => patchApp('fetch(url)', { v: 'abc' }), /data\/\*\.json/);
    assert.throws(() => versionAssets('<script src="https://cdn.example/x.js"></script>', 'abc', 'x.html'), /нет локальных/);
  });

  test('версии ресурсов: только локальные файлы получают ?v=', () => {
    const html = versionAssets('<script src="app.js"></script><link rel="stylesheet" href="https://cdn.example/s.css" /><link rel="icon" href="favicon.svg" />', 'c0ffee1', 'x');
    assert.match(html, /src="app\.js\?v=c0ffee1"/);
    assert.match(html, /href="favicon\.svg\?v=c0ffee1"/);
    assert.match(html, /href="https:\/\/cdn\.example\/s\.css"/);
    assert.equal(patchApp('fetch("data/a.json"); fetch(`data/b.json`)', { v: 'c0ffee1' }),
      'fetch("data/a.json?v=c0ffee1"); fetch(`data/b.json?v=c0ffee1`)');
  });
});

describe('prepare', () => {
  test('витрина: HOME_URL — каталог витрины, футер с версией и коммитом, deploy.json', () => {
    const out = path.join(tmp, 'prepared');
    const result = prepare({ source: SOURCE, out, lock });
    const gate = readFileSync(path.join(out, 'gate.js'), 'utf8');
    assert.match(gate, /const HOME_URL = baseUrl\.href;/);
    assert.doesNotMatch(gate, /github\.io/);
    const index = readFileSync(path.join(out, 'index.html'), 'utf8');
    assert.match(index, /data-deploy-source="0123456789abcdef0123456789abcdef01234567"/);
    assert.match(index, /сборка v1\.0\.0 · коммит спицы <code>0123456<\/code>/);
    assert.match(index, /<a class="deploy-home" href="\.\.\/" data-deploy-home>/);
    assert.match(index, /src="app\.js\?v=0123456"/);
    assert.match(readFileSync(path.join(out, 'app.js'), 'utf8'), /"data\/prompts\.json\?v=0123456"/);
    const deploy = JSON.parse(readFileSync(path.join(out, 'deploy.json'), 'utf8'));
    assert.deepEqual(deploy, { repository: lock.repository, commit: lock.commit, version: lock.version, source: lock.tree });
    assert.equal(result.output.files, lock.tree.files + 1);
  });
});

describe('check-privacy (НФТ-4)', () => {
  const scan = (files) => {
    const dir = mkdtempSync(path.join(tmp, 'privacy-'));
    for (const [rel, text] of Object.entries(files)) {
      mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
      writeFileSync(path.join(dir, rel), text);
    }
    return checkPrivacy(dir, lock);
  };

  test('токены в публичных файлах', () => {
    const { errors } = scan({
      'a.js': `const t = "ghp_${'a'.repeat(36)}";`,
      'b.json': `{"t": "github_pat_${'B'.repeat(40)}"}`,
      'c.html': 'https://x-access-token:secret@github.com/',
    });
    assert.equal(errors.length, 3, errors.join('\n'));
  });

  test('приватная спица как исполняемый источник и сайт Pages спицы', () => {
    const { errors } = scan({
      'a.html': '<script src="https://raw.githubusercontent.com/example-owner/fixture-spoke/main/site/app.js"></script>',
      'b.js': 'fetch("https://api.github.com/repos/example-owner/fixture-spoke/contents/site")',
      'c.js': 'const HOME_URL = "https://example-owner.github.io/fixture-spoke/";',
    });
    assert.ok(errors.some((e) => e.startsWith('a.html: приватная спица')), errors.join('\n'));
    assert.ok(errors.some((e) => e.startsWith('b.js: приватная спица')), errors.join('\n'));
    assert.ok(errors.some((e) => e.startsWith('c.js: ссылка на сайт Pages спицы')), errors.join('\n'));
  });

  test('ссылка <a href> на документ спицы — навигация, не ошибка', () => {
    const result = scan({ 'a.html': '<a href="https://github.com/example-owner/fixture-spoke/blob/main/CHANGELOG.md">v1</a>' });
    assert.deepEqual(result, { errors: [], anchors: 1 });
  });
});

describe('шаблоны и адреса', () => {
  test('fill: неизвестное имя — ошибка сборки; asset получает ?v=хэш', () => {
    assert.throws(() => fill('{{nope}}', {}), /нет значения для \{\{nope\}\}/);
    assert.match(fill('{{asset:assets/hub.css}}', {}, { assetPrefix: '/x/' }), /^\/x\/assets\/hub\.css\?v=[0-9a-f]{10}$/);
  });

  test('normalizeBasePath', () => {
    assert.equal(normalizeBasePath(''), '/');
    assert.equal(normalizeBasePath('open-ai.ru'), '/open-ai.ru/');
    assert.equal(normalizeBasePath('/open-ai.ru/'), '/open-ai.ru/');
    assert.throws(() => normalizeBasePath('/a b/'), /Некорректный/);
    assert.throws(() => normalizeBasePath('/"><script>/'), /Некорректный/);
  });

  test('mangoSteps: коды шагов из test-kit и a-in-kit; неожиданный код — ошибка', () => {
    assert.deepEqual(mangoSteps(SOURCE), ['Ш-0', 'Ш-3', 'Ш-В', 'AIN-01', 'AIN-06', 'AIN-24']);
    const dir = copySource('bad-steps');
    writeFileSync(path.join(dir, 'data/a-in-kit.json'), '{"steps":[{"id":"<img>"}]}');
    assert.throws(() => mangoSteps(dir), /Неожиданные коды шагов витрины: <img>/);
  });
});

describe('сборка всего сайта', () => {
  test('без --mango-source сайт не собирается', () => {
    assert.throws(() => build({ out: path.join(tmp, 'no-source') }), /Не указан --mango-source/);
  });

  test('ошибка источника останавливает сборку до публикации остальных файлов', () => {
    const out = path.join(tmp, 'broken');
    const dir = copySource('broken-source');
    writeFileSync(path.join(dir, 'app.js'), 'changed');
    assert.throws(() => build({ out, mangoSource: dir, mangoLock: LOCK_FILE }), SourceError);
    assert.throws(() => readFileSync(path.join(out, 'index.html')), /ENOENT/);
  });

  test('повторная сборка побайтово та же (НФТ-5), проверка сайта проходит', () => {
    const a = build({ out: path.join(tmp, 'site-a'), basePath: '/open-ai.ru/', mangoSource: SOURCE, mangoLock: LOCK_FILE });
    const b = build({ out: path.join(tmp, 'site-b'), basePath: '/open-ai.ru/', mangoSource: SOURCE, mangoLock: LOCK_FILE });
    assert.deepEqual(treeHash(a.out), treeHash(b.out));
    const result = checkSite({ site: a.out, base: '/open-ai.ru/', lock });
    assert.deepEqual(result.errors, []);
    assert.ok(result.links > 20, `проверено ссылок: ${result.links}`);
    const index = readFileSync(path.join(a.out, 'index.html'), 'utf8');
    assert.match(index, /Версия v1\.0\.0 · коммит источника <code>0123456<\/code>/);
    const notFound = readFileSync(path.join(a.out, '404.html'), 'utf8');
    assert.match(notFound, /var BASE = "\/open-ai\.ru\/";/);
    assert.match(notFound, /"Ш-В","AIN-01","AIN-06","AIN-24"/);
  });

  test('check-site ловит битую ссылку, выход витрины из /mango/ и ссылку брошюры в витрину', () => {
    const out = path.join(tmp, 'site-c');
    build({ out, mangoSource: SOURCE, mangoLock: LOCK_FILE });
    const append = (rel, html) => writeFileSync(path.join(out, rel), readFileSync(path.join(out, rel), 'utf8').replace('</body>', `${html}</body>`));
    append('mango/index.html', '<a href="../projects/ai-team-management-program/">x</a>');
    append('projects/ai-team-management-program/index.html', '<a href="../../mango/#catalog">x</a><img src="assets/none.png" alt="">');
    rmSync(path.join(out, 'projects/ai-team-management-program/brochure.pdf'));
    const { errors } = checkSite({ site: out, lock });
    assert.deepEqual(errors.sort(), [
      'index.html: битая ссылка projects/ai-team-management-program/brochure.pdf',
      'mango/index.html: витрина ссылается за пределы /mango/: ../projects/ai-team-management-program/',
      'projects/ai-team-management-program/index.html: битая ссылка assets/none.png',
      'projects/ai-team-management-program/index.html: битая ссылка brochure.pdf',
      'projects/ai-team-management-program/index.html: брошюра ссылается внутрь витрины: ../../mango/#catalog',
      'нет projects/ai-team-management-program/brochure.pdf',
    ]);
  });

  test('links/target: относительные и абсолютные адреса, выход за пределы сайта', () => {
    assert.deepEqual(links('<a class="x" href="a/">A</a><script>var s = "<a href=\\"no\\">";</script><img src="b.png" alt="">').map((l) => l.url), ['a/', 'b.png']);
    assert.deepEqual(target('mango/index.html', '../', '/'), { path: '' });
    assert.deepEqual(target('404.html', '/open-ai.ru/mango/?x#y', '/open-ai.ru/'), { path: 'mango/' });
    assert.deepEqual(target('index.html', '/other/', '/open-ai.ru/'), { outside: true, path: '/other/' });
    assert.deepEqual(target('index.html', '../x', '/'), { outside: true, path: '../x' });
  });
});
