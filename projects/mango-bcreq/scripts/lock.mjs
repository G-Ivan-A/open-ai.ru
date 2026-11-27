#!/usr/bin/env node
// Фиксация источника витрины (issue #68, НФТ-5): projects/mango-bcreq/source.json.
//   repository / commit / path — откуда берётся site/ (коммит — полный SHA, не ветка);
//   version   — версия сборки витрины (должна совпасть с версией в site/index.html);
//   tree      — отпечаток site/ на этом коммите (scripts/tree.mjs): забранное содержимое
//               сверяется с ним до сборки, расхождение останавливает публикацию;
//   scenarios — Playwright-сценарии спицы и исходные срезы (before), на которых они пишутся.
//
//   node scripts/lock.mjs --github-output        — поля для шагов workflow ($GITHUB_OUTPUT);
//   node scripts/lock.mjs --update <site/> --commit <sha> --version <x.y.z>
//                                               — перейти на новую сборку спицы.
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { treeHash } from './tree.mjs';

export const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const LOCK = path.join(PROJECT, 'source.json');

const SHA = /^[0-9a-f]{40}$/;
const VERSION = /^\d+\.\d+\.\d+$/;

export function validateLock(lock) {
  const errors = [];
  if (!/^[\w.-]+\/[\w.-]+$/.test(lock.repository ?? '')) errors.push('repository: ожидается «владелец/репозиторий»');
  if (!SHA.test(lock.commit ?? '')) errors.push('commit: ожидается полный SHA (40 hex), не ветка и не тег');
  if (!/^[\w.-]+$/.test(lock.path ?? '')) errors.push('path: ожидается каталог в корне спицы');
  if (!VERSION.test(lock.version ?? '')) errors.push('version: ожидается x.y.z');
  if (!/^[0-9a-f]{64}$/.test(lock.tree?.sha256 ?? '')) errors.push('tree.sha256: ожидается sha256');
  if (!(lock.tree?.files > 0)) errors.push('tree.files: ожидается число файлов');
  for (const run of lock.scenarios?.runs ?? []) {
    if (!/^[\w.-]+\.js$/.test(run.file ?? '')) errors.push(`scenarios: файл ${run.file}`);
    if (!SHA.test(run.before ?? '')) errors.push(`scenarios: before ${run.file} — полный SHA`);
  }
  if (errors.length) throw new Error(`source.json: ${errors.join('; ')}`);
  return lock;
}

export function readLock(file = LOCK) {
  return validateLock(JSON.parse(readFileSync(file, 'utf8')));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const value = (name) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : undefined;
  };
  if (args.includes('--update')) {
    const lock = JSON.parse(readFileSync(LOCK, 'utf8'));
    lock.commit = value('--commit') ?? lock.commit;
    lock.version = value('--version') ?? lock.version;
    lock.tree = treeHash(path.resolve(value('--update')));
    validateLock(lock);
    writeFileSync(LOCK, `${JSON.stringify(lock, null, 2)}\n`);
    console.log(`source.json: ${lock.repository}@${lock.commit} v${lock.version}, ${lock.tree.files} файлов, ${lock.tree.sha256}`);
  } else {
    const lock = readLock();
    const fields = {
      repository: lock.repository,
      commit: lock.commit,
      path: lock.path,
      version: lock.version,
      'scenarios-path': lock.scenarios.path,
      ...Object.fromEntries(lock.scenarios.runs.map((run) => [`before-${run.file.replace(/\.js$/, '')}`, run.before])),
    };
    const text = Object.entries(fields).map(([k, v]) => `${k}=${v}`).join('\n');
    if (args.includes('--github-output')) appendFileSync(process.env.GITHUB_OUTPUT, `${text}\n`);
    console.log(text);
  }
}
