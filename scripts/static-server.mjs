// Локальный статический сервер, повторяющий поведение GitHub Pages (issue #68):
//   • «/каталог/» → index.html; «/каталог» без слэша → 301 на «/каталог/»;
//   • отсутствующий путь → 404.html из корня сайта со статусом 404 (как Pages);
//   • mounts — дополнительные префиксы, отданные из других каталогов. Их использует
//     прогон сценариев спицы: /before/site/ — исходный срез, /after/site/ — /mango/.
//
//   node scripts/static-server.mjs --root _site [--port 8137] [--mount /after/site/=_site/mango]
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.ico': 'image/x-icon',
};

// Каталог и путь внутри него для URL: самый длинный подходящий префикс mounts, иначе root.
function resolve(urlPath, root, mounts) {
  const mount = mounts
    .filter(([prefix]) => urlPath.startsWith(prefix))
    .sort((a, b) => b[0].length - a[0].length)[0];
  const [prefix, dir] = mount ?? ['/', root];
  const rel = urlPath.slice(prefix.length);
  const file = path.resolve(dir, `.${path.posix.sep}${rel}`);
  // Выход за пределы каталога (../) — как отсутствующий файл.
  return file === dir || file.startsWith(dir + path.sep) ? file : null;
}

export function serve({ root, port = 0, host = '127.0.0.1', mounts = [] }) {
  root = path.resolve(root);
  mounts = mounts.map(([prefix, dir]) => [prefix, path.resolve(dir)]);
  const requests = [];
  const server = createServer((req, res) => {
    let urlPath;
    try {
      urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    } catch {
      res.writeHead(400).end();
      return;
    }
    let file = resolve(urlPath, root, mounts);
    if (file && existsSync(file) && statSync(file).isDirectory()) {
      if (!urlPath.endsWith('/')) {
        const url = new URL(req.url, 'http://x');
        res.writeHead(301, { Location: `${url.pathname}/${url.search}` }).end();
        requests.push([req.url, 301]);
        return;
      }
      file = path.join(file, 'index.html');
    }
    let status = 200;
    if (!file || !existsSync(file) || !statSync(file).isFile()) {
      status = 404;
      file = path.join(root, '404.html');
    }
    requests.push([req.url, status]);
    const type = TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
    const body = existsSync(file) ? readFileSync(file) : Buffer.from('Not Found');
    res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'max-age=0' });
    res.end(req.method === 'HEAD' ? undefined : body);
  });
  return new Promise((done) => server.listen(port, host, () => {
    const { port: actual } = server.address();
    done({
      server,
      requests,
      url: `http://${host}:${actual}`,
      close: () => new Promise((ok) => server.close(ok)),
    });
  }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const value = (name, fallback) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : fallback;
  };
  const mounts = args.flatMap((a, i) => (a === '--mount' ? [args[i + 1].split('=')] : []));
  const { url } = await serve({ root: value('--root', '_site'), port: Number(value('--port', 8137)), mounts });
  console.log(`Сайт: ${url}/`);
}
