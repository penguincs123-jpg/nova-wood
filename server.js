/**
 * Nova Wood - Root Server Entry Point
 * This file is the entry point for Hostinger Node.js hosting.
 * It loads the Next.js standalone server built during deployment.
 */
'use strict';

const path = require('path');
const fs = require('fs');

const standaloneServer = path.join(__dirname, 'apps/frontend/.next/standalone/apps/frontend/server.js');

if (!fs.existsSync(standaloneServer)) {
  console.error('[Nova Wood] ERROR: Standalone server not found at:', standaloneServer);
  console.error('[Nova Wood] Make sure the build completed successfully.');
  process.exit(1);
}

// Set environment defaults if not already set
process.env.PORT = process.env.PORT || '3000';
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

console.log('[Nova Wood] Starting Next.js frontend from:', standaloneServer);
require(standaloneServer);
