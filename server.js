/**
 * Nova Wood - Root Server Entry Point for Hostinger
 * Starts the Next.js frontend using next start (no standalone mode).
 */
'use strict';

const { execSync } = require('child_process');
const path = require('path');

const frontendDir = path.join(__dirname, 'apps/frontend');

process.env.PORT = process.env.PORT || '3000';
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

console.log('[Nova Wood] Starting Next.js frontend...');
console.log('[Nova Wood] Port:', process.env.PORT);

// Use require to start next server directly
const nextPath = path.join(frontendDir, 'node_modules', 'next', 'dist', 'server', 'next.js');
const http = require('http');
const { parse } = require('url');

let nextApp;
try {
  const next = require(path.join(frontendDir, 'node_modules', 'next'));
  nextApp = next({ dev: false, dir: frontendDir, port: parseInt(process.env.PORT, 10) });
} catch (e) {
  console.error('[Nova Wood] Failed to load next:', e.message);
  process.exit(1);
}

const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  http.createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(parseInt(process.env.PORT, 10), process.env.HOSTNAME, (err) => {
    if (err) throw err;
    console.log(`[Nova Wood] Ready on http://${process.env.HOSTNAME}:${process.env.PORT}`);
  });
}).catch((err) => {
  console.error('[Nova Wood] Failed to start:', err);
  process.exit(1);
});
