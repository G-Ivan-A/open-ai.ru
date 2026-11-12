// Снимки раздела [4] «Кандидаты на роли» на веб-странице (issue #65):
//   node experiments/team-screenshots.mjs <url> <out.png> [width]
// Раскрывает <details id="appendix-3"> и снимает элемент целиком.
import { createRequire } from 'node:module';
const require = createRequire(new URL('../projects/ai-team-management-program/package.json', import.meta.url));
const puppeteer = require('puppeteer-core');
const [url, out, width = '1280'] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: Number(width), height: 900 });
await page.goto(url, { waitUntil: 'networkidle0' });
const el = await page.$('#appendix-3');
await page.evaluate((d) => { d.open = true; d.scrollIntoView(); }, el);
await el.screenshot({ path: out });
console.log(out, await page.evaluate((d) => d.innerText.split('\n').filter(Boolean).slice(0, 8).join('\n'), el));
await browser.close();
