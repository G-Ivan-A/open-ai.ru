// Проверка доступа к приватной спице (issue #68, ГК-2): отказ — с явной причиной, токен не печатается.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { describe, test } from 'node:test';
import { ROOT } from '../scripts/build-site.mjs';
import { AccessError, checkAccess } from '../projects/mango-bcreq/scripts/check-access.mjs';
import { readLock } from '../projects/mango-bcreq/scripts/lock.mjs';

const lock = readLock(path.join(ROOT, 'projects/mango-bcreq/tests/fixture/source.json'));
const TOKEN = `github_pat_${'T'.repeat(40)}`;

// Поддельный fetch: ответы по фрагменту адреса; запоминает запросы.
function fakeFetch(routes) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    const [, route] = Object.entries(routes).find(([part]) => url.includes(part)) ?? [];
    if (route instanceof Error) throw route;
    const { status = 200, body = {} } = route ?? { status: 404 };
    return { ok: status >= 200 && status < 300, status, json: async () => body };
  };
  return { fetchImpl, calls };
}

const OK = {
  [`/commits/${lock.commit}`]: { body: { sha: lock.commit } },
  [`/contents/site?ref=${lock.commit}`]: { body: [{ name: 'app.js' }, { name: 'index.html' }] },
};

const rejects = (promise, pattern) => assert.rejects(promise, (error) => {
  assert.ok(error instanceof AccessError, error.stack);
  assert.match(error.message, pattern);
  assert.ok(!error.message.includes(TOKEN), 'токен в тексте ошибки');
  return true;
});

describe('checkAccess', () => {
  test('доступ есть: коммит и каталог site/ на нём', async () => {
    const { fetchImpl, calls } = fakeFetch(OK);
    const result = await checkAccess({ token: ` ${TOKEN}\n`, lock, fetchImpl });
    assert.deepEqual(result, { repository: lock.repository, commit: lock.commit, path: 'site', entries: 2 });
    assert.equal(calls.length, 2);
    assert.equal(calls[0].url, `https://api.github.com/repos/example-owner/fixture-spoke/commits/${lock.commit}`);
    assert.equal(calls[0].options.headers.Authorization, `Bearer ${TOKEN}`);
  });

  for (const token of [undefined, '', '  \n']) {
    test(`секрет не задан (${JSON.stringify(token)}) — запросов нет, причина и что сделать`, async () => {
      const { fetchImpl, calls } = fakeFetch(OK);
      await rejects(checkAccess({ token, lock, fetchImpl }), /Секрет MANGO_SITE_TOKEN не задан или пуст.*Contents — Read-only/);
      assert.equal(calls.length, 0);
    });
  }

  const cases = [
    [401, /недействителен: токен отозван, истёк/],
    [403, /не даёт доступа.*\(403\)/],
    [429, /исчерпан лимит/],
    [404, /не виден с токеном MANGO_SITE_TOKEN \(404/],
    [422, /Коммит 0123456789abcdef0123456789abcdef01234567 не найден/],
    [500, /GitHub API ответил 500/],
  ];
  for (const [status, pattern] of cases) {
    test(`ответ ${status} — отказ с причиной`, async () => {
      const { fetchImpl } = fakeFetch({ '/commits/': { status } });
      await rejects(checkAccess({ token: TOKEN, lock, fetchImpl }), pattern);
    });
  }

  test('сеть недоступна', async () => {
    const { fetchImpl } = fakeFetch({ '/commits/': new Error('getaddrinfo ENOTFOUND api.github.com') });
    await rejects(checkAccess({ token: TOKEN, lock, fetchImpl }), /GitHub API недоступен.*ENOTFOUND/);
  });

  test('нет каталога site/ на коммите или в нём нет index.html', async () => {
    await rejects(checkAccess({ token: TOKEN, lock, fetchImpl: fakeFetch({ '/contents/': { status: 404 }, ...OK }).fetchImpl }),
      /не виден.*каталога site\//);
    await rejects(checkAccess({ token: TOKEN, lock, fetchImpl: fakeFetch({ '/contents/': { body: [{ name: 'x' }] }, ...OK }).fetchImpl }),
      /нет index\.html/);
  });

  test('CLI: пустой секрет — код 1 и аннотация ::error с причиной', () => {
    let failure;
    try {
      execFileSync(process.execPath, ['projects/mango-bcreq/scripts/check-access.mjs'], {
        cwd: ROOT, env: { PATH: process.env.PATH, GITHUB_ACTIONS: 'true', MANGO_SITE_TOKEN: '' }, encoding: 'utf8', stdio: 'pipe',
      });
    } catch (error) {
      failure = error;
    }
    assert.ok(failure, 'ожидался ненулевой код выхода');
    assert.equal(failure.status, 1);
    assert.match(failure.stderr, /^::error title=Нет доступа к витрине BCREQ::Секрет MANGO_SITE_TOKEN не задан/);
  });
});
