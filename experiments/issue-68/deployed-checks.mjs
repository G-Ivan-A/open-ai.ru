// Только проверки входа/выхода/адресов вглубь из scripts/check-mango.mjs (быстрая отладка).
//   node experiments/issue-68/deployed-checks.mjs [_site] [/open-ai.ru/]
import path from 'node:path';
import { deployedChecks, launch } from '../../scripts/check-mango.mjs';
import { serve } from '../../scripts/static-server.mjs';
import { readLock } from '../../projects/mango-bcreq/scripts/lock.mjs';

const site = path.resolve(process.argv[2] ?? '_site');
const base = process.argv[3] ?? '/open-ai.ru/';
const server = await serve({ root: site, base });
const browser = await launch();
try {
  const problems = await deployedChecks(browser, server.url, base, readLock());
  console.log(problems.length ? problems.join('\n') : 'ok');
} finally {
  await browser.close();
  await server.close();
}
