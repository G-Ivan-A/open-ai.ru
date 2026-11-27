#!/usr/bin/env node
// Проверка доступа к приватной спице до сборки (issue #68, ГК-2: fail-closed с явной причиной).
//
//   MANGO_SITE_TOKEN=… node scripts/check-access.mjs [--lock source.json]
//
// Токен (fine-grained PAT, Contents: Read-only на репозиторий спицы) проверяется запросами
// GitHub API к закреплённому коммиту и каталогу site/ на нём. Любой отказ останавливает
// публикацию с причиной: секрет не задан, токен недействителен или отозван (401), нет прав
// или исчерпан лимит (403/429), репозиторий не виден токену (404), коммит не найден (422),
// сеть недоступна. Сам токен не печатается ни при каких исходах.
import path from 'node:path';
import { LOCK, readLock } from './lock.mjs';

export const SECRET = 'MANGO_SITE_TOKEN';

export class AccessError extends Error {}

const API = 'https://api.github.com';

function reason(status, what, lock) {
  const repo = lock.repository;
  switch (status) {
    case 401:
      return `${SECRET} недействителен: токен отозван, истёк или введён с ошибкой (401 при запросе ${what}). `
        + `Выпустите новый fine-grained PAT (Contents: Read-only на ${repo}) и обновите секрет.`;
    case 403:
    case 429:
      return `${SECRET} не даёт доступа к ${what} (${status}): у токена нет права Contents: Read на ${repo}, `
        + 'требуется SSO-авторизация организации или исчерпан лимит запросов API.';
    case 404:
      return `${repo} не виден с токеном ${SECRET} (404 при запросе ${what}): токен выпущен без доступа к `
        + 'этому репозиторию, репозиторий переименован или удалён, либо в нём нет каталога витрины.';
    case 422:
      return `Коммит ${lock.commit} не найден в ${repo} (422): обновите source.json (scripts/lock.mjs --update).`;
    default:
      return `GitHub API ответил ${status} при запросе ${what}.`;
  }
}

// Возвращает описание проверенного источника; при отказе — AccessError с причиной.
export async function checkAccess({ token, lock, fetchImpl = fetch }) {
  if (!token || !token.trim()) {
    throw new AccessError(`Секрет ${SECRET} не задан или пуст: витрина BCREQ не может быть забрана из ${lock.repository}. `
      + `Владелец репозитория: Settings → Secrets and variables → Actions → New repository secret «${SECRET}» `
      + `(fine-grained PAT, Repository access: ${lock.repository}, Permissions: Contents — Read-only).`);
  }
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token.trim()}`,
    'User-Agent': 'open-ai-ru-pages',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const get = async (url, what) => {
    let response;
    try {
      response = await fetchImpl(url, { headers });
    } catch (error) {
      throw new AccessError(`GitHub API недоступен при запросе ${what}: ${error.message}`);
    }
    if (!response.ok) throw new AccessError(reason(response.status, what, lock));
    return response.json();
  };
  const commit = await get(`${API}/repos/${lock.repository}/commits/${lock.commit}`, `коммита ${lock.commit.slice(0, 7)}`);
  if (commit?.sha !== lock.commit) throw new AccessError(`GitHub API вернул коммит ${commit?.sha} вместо ${lock.commit}.`);
  const listing = await get(`${API}/repos/${lock.repository}/contents/${lock.path}?ref=${lock.commit}`,
    `каталога ${lock.path}/ на коммите ${lock.commit.slice(0, 7)}`);
  if (!Array.isArray(listing) || !listing.some((entry) => entry.name === 'index.html')) {
    throw new AccessError(`В ${lock.repository}/${lock.path} на коммите ${lock.commit} нет index.html — это не каталог витрины.`);
  }
  return { repository: lock.repository, commit: lock.commit, path: lock.path, entries: listing.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const i = process.argv.indexOf('--lock');
  try {
    const lock = readLock(i > 0 ? path.resolve(process.argv[i + 1]) : LOCK);
    const result = await checkAccess({ token: process.env[SECRET], lock });
    console.log(`✔ Доступ к ${result.repository}@${result.commit.slice(0, 7)}/${result.path}: ${result.entries} записей.`);
  } catch (error) {
    const message = error instanceof AccessError ? error.message : `Ошибка проверки доступа: ${error.message}`;
    console.error(process.env.GITHUB_ACTIONS ? `::error title=Нет доступа к витрине BCREQ::${message}` : `✘ ${message}`);
    process.exit(1);
  }
}
