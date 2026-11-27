// Что копирует Ш-0 на витрине и чего ждёт browser-smoke.js (диагностика, issue #68).
//   node experiments/issue-68/sh0-copy.mjs <site/ витрины>
import { chromium } from 'playwright-core';
import { serve } from '../../scripts/static-server.mjs';

const site = await serve({ root: process.argv[2] });
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext();
await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: site.url });
const page = await context.newPage();
await page.goto(`${site.url}/#processes?step=Ш-0&track=system`);
const card = page.locator('[id="bcreq-testkit-Ш-0"]');
await card.and(page.locator(':focus')).waitFor();
await card.locator('.testkit-copy').focus();
await page.keyboard.press('Enter');
const value = await page.evaluate(() => navigator.clipboard.readText());
const kit = await page.evaluate(() => fetch('data/test-kit.json').then((r) => r.json()));
const start = kit.steps.find(({ step }) => step.startsWith('Ш-0 '));
const prefix = `<!-- ${start.draft.id} · ${start.step} -->\n\n`;
const expected = `${start.draft.body.trimEnd()}\n\nФормат шагов: системный\n`;
const actual = value.slice(prefix.length);
console.log('prefix ok:', value.startsWith(prefix));
let i = 0;
while (i < actual.length && actual[i] === expected[i]) i += 1;
console.log('first difference at', i, 'of', expected.length, '/', actual.length);
console.log('expected tail:', JSON.stringify(expected.slice(i - 40, i + 80)));
console.log('actual tail:  ', JSON.stringify(actual.slice(i - 40, i + 120)));
await browser.close();
await site.close();
