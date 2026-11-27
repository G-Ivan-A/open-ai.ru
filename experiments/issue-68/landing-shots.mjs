// Скриншоты стартовой страницы (390/768/1440, светлая и тёмная тема) и быстрые проверки
// адресов вглубь витрины. node experiments/issue-68/landing-shots.mjs <_site> <out-dir>
import { chromium } from 'playwright-core';
import { serve } from '../../scripts/static-server.mjs';

const [site = '_site', outDir = '/tmp/issue68-shots'] = process.argv.slice(2);
const srv = await serve({ root: site, base: '/open-ai.ru/' });
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' });
try {
  for (const scheme of ['light', 'dark']) {
    for (const width of [390, 768, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: scheme });
      await page.goto(`${srv.url}/open-ai.ru/`);
      await page.screenshot({ path: `${outDir}/landing-${width}-${scheme}.png`, fullPage: true });
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      console.log(scheme, width, 'scrollWidth', sw);
      await page.close();
    }
  }
  const page = await browser.newPage();
  // Сторонние адреса (виджет, который грузит сама витрина) не запрашиваются.
  await page.route('**/*', (route) => (new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort()));
  for (const p of ['mango/ain-06', 'mango/%D1%88-3', 'mango/sh-v?track=system', 'mango/catalog', 'mango/nope', 'nope', '#passport']) {
    await page.goto(`${srv.url}/open-ai.ru/${p}`);
    await page.waitForTimeout(300);
    console.log(p, '→', page.url().replace(srv.url, ''));
  }
  await page.goto(`${srv.url}/open-ai.ru/nope`);
  await page.screenshot({ path: `${outDir}/404.png` });
  // Футер развёрнутой витрины: версия сборки, коммит спицы и «Все проекты» (НФТ-2, ФТ-3).
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(`${srv.url}/open-ai.ru/mango/`);
  await page.locator('footer').last().screenshot({ path: `${outDir}/mango-footer.png` });
  await page.goto(`${srv.url}/open-ai.ru/projects/mango-bcreq/`);
  await page.screenshot({ path: `${outDir}/mango-about.png`, fullPage: true });
} finally {
  await browser.close();
  await srv.close();
}
