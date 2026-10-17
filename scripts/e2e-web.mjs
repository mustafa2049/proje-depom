// E2E için web uygulamasını derler (expo export) ve SPA olarak statik sunar.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mobileDir = path.join(root, 'apps', 'mobile-web');
const outDir = path.join(os.tmpdir(), 'proje-depom-web-e2e');
const port = Number(process.env.E2E_WEB_PORT ?? 8090);
const isWindows = process.platform === 'win32';

fs.rmSync(outDir, { recursive: true, force: true });
const build = spawnSync('npx', ['expo', 'export', '--platform', 'web', '--output-dir', outDir], {
  cwd: mobileDir,
  env: { ...process.env, EXPO_PUBLIC_API_URL: process.env.E2E_API_URL ?? 'http://localhost:3000' },
  stdio: 'inherit',
  shell: isWindows,
});
if (build.status !== 0) {
  console.error('Web export başarısız oldu');
  process.exit(build.status ?? 1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
};

const server = http.createServer((request, response) => {
  const urlPath = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  let filePath = path.join(outDir, urlPath);
  if (!filePath.startsWith(outDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(outDir, 'index.html'); // SPA geri dönüşü
  }
  response.writeHead(200, { 'content-type': MIME[path.extname(filePath)] ?? 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(response);
});

server.listen(port, () => console.log(`Web E2E sunucusu: http://localhost:${port}`));
const stop = () => server.close(() => process.exit(0));
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
