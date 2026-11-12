// Снимки веб-страницы для ревью: node experiments/screenshots.mjs <url> <outdir>
// (страницу отдаёт любой статический сервер, напр. python3 -m http.server -d _site).
import { createRequire } from 'node:module';
const require = createRequire(new URL('../projects/ai-team-management-program/package.json', import.meta.url));
const puppeteer = require('puppeteer-core');
const [url, out] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const page = await browser.newPage();
const shot = async (name, w, h, fn) => {
  await page.setViewport({ width: w, height: h });
  await page.goto(url, { waitUntil: 'networkidle0' });
  if (fn) await page.evaluate(fn);
  await page.screenshot({ path: `${out}/${name}.png` });
  console.log(`${out}/${name}.png`);
};
await shot('desktop-hero', 1280, 800);
await shot('mobile-360-hero', 360, 780);
await shot('desktop-passport', 1280, 1000, () => document.getElementById('passport').scrollIntoView());
await shot('desktop-page-end', 1280, 800, () => window.scrollTo(0, document.body.scrollHeight));
const info = await page.evaluate(() => ({
  forms: document.querySelectorAll('form, input, select, button').length,
  external: [...document.querySelectorAll('a[href^="http"]')].map((a) => `${a.target}|${a.rel}`),
}));
console.log(JSON.stringify({ forms: info.forms, external: info.external.length, bad: info.external.filter((x) => x !== '_blank|noopener noreferrer') }));
await browser.close();
