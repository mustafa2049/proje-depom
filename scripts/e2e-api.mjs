// E2E için API'yi başlatır: test veritabanını migrate eder, seed verisini yükler ve sunucuyu çalıştırır.
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiDir = path.join(root, 'apps', 'api');
const isWindows = process.platform === 'win32';

const databaseUrl =
  process.env.E2E_DATABASE_URL ??
  process.env.TEST_DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/english_app_test?schema=public';

const env = {
  ...process.env,
  DATABASE_URL: databaseUrl,
  JWT_SECRET: process.env.JWT_SECRET ?? 'e2e-only-secret-value-that-is-long-enough-123',
  AI_PROVIDER: 'mock',
  RATE_LIMIT_ENABLED: 'false',
  CORS_ORIGINS: 'http://localhost:8090',
  PORT: process.env.E2E_API_PORT ?? '3000',
};

function run(command, args) {
  const result = spawnSync(command, args, { cwd: apiDir, env, stdio: 'inherit', shell: isWindows });
  if (result.status !== 0) {
    console.error(`"${command} ${args.join(' ')}" başarısız oldu`);
    process.exit(result.status ?? 1);
  }
}

run('npx', ['prisma', 'migrate', 'deploy']);
run('npx', ['prisma', 'db', 'seed']);

const server = spawn('npx', ['tsx', 'src/server.ts'], { cwd: apiDir, env, stdio: 'inherit', shell: isWindows });
const stop = (signal) => server.kill(signal);
process.on('SIGINT', () => stop('SIGINT'));
process.on('SIGTERM', () => stop('SIGTERM'));
server.on('exit', (code) => process.exit(code ?? 0));
