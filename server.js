/**
 * Nova Wood - Hostinger Entry Point
 * Starts the Next.js frontend app via child_process to avoid module resolution issues.
 */
'use strict';

const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || '3000';
const HOST = process.env.HOSTNAME || '0.0.0.0';
const frontendDir = path.join(__dirname, 'apps', 'frontend');

console.log('[Nova Wood] Starting Next.js on port', PORT);
console.log('[Nova Wood] Frontend dir:', frontendDir);

// Try to find next binary
const nextBin = [
  path.join(__dirname, 'node_modules', '.bin', 'next'),
  path.join(frontendDir, 'node_modules', '.bin', 'next'),
  'next', // fallback to PATH
].find(bin => {
  try {
    const fs = require('fs');
    return bin === 'next' || fs.existsSync(bin);
  } catch { return false; }
}) || 'next';

console.log('[Nova Wood] Using next binary:', nextBin);

const child = spawn(nextBin, ['start', '-p', PORT, '-H', HOST], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT, HOSTNAME: HOST },
});

child.on('error', (err) => {
  console.error('[Nova Wood] Failed to start server:', err.message);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log('[Nova Wood] Server exited with code:', code);
  process.exit(code || 0);
});

// Forward signals
['SIGTERM', 'SIGINT'].forEach(sig => {
  process.on(sig, () => {
    console.log('[Nova Wood] Received', sig, '- shutting down...');
    child.kill(sig);
  });
});
