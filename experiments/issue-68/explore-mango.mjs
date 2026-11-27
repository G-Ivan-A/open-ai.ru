import { chromium } from 'playwright-core';
import { serve } from '../../scripts/static-server.mjs';
const srv = await serve({ root: process.argv[2] ?? '_site', base: '/open-ai.ru/' });
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext(); await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:srv.url});
const p = await ctx.newPage();
await p.route(/^https?:\/\//, (r) => new URL(r.request().url()).origin === srv.url ? r.continue() : r.abort());
await p.goto(srv.url + '/open-ai.ru/mango/');
await p.waitForSelector('#prompt-grid [data-copy-id]');
console.log(await p.evaluate(() => ({
  cards: document.querySelectorAll('#prompt-grid > *').length,
  copy: document.querySelectorAll('#prompt-grid [data-copy-id]').length,
  count: document.querySelector('#result-count').innerText,
  filters: [...document.querySelectorAll('[data-filter-token]')].map(b => b.dataset.filterToken),
  nav: [...document.querySelectorAll('#topnav a[data-nav]')].map(a => a.getAttribute('href')),
  footer: document.querySelector('.site-footer').innerText,
  testkitCopies: document.querySelectorAll('.testkit-copy').length,
  sugg: !!document.querySelector('#search-suggestions'),
})));
await p.goto(srv.url + '/open-ai.ru/mango/#processes?step=AIN-06');
await p.waitForTimeout(500);
console.log(await p.evaluate(() => ({ focus: document.activeElement?.id, copies: [...document.querySelectorAll('#bcreq-testkit-AIN-06 .testkit-copy')].map(b => [b.textContent, b.hidden, b.dataset.testkitIndex, b.offsetParent!==null]), fmt: [...document.querySelectorAll('#step-format-switch [data-format], #step-format-switch button, #step-format-switch a')].map(x=>x.outerHTML.slice(0,150)) })));
await b.close(); await srv.close();
