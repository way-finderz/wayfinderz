#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/* global console, process, require */

const { execSync } = require('child_process');

// Only set up git hooks in development environments
if (process.env.CI || process.env.NODE_ENV === 'production') {
  console.log('Skipping git hooks setup in CI/production');
  process.exit(0);
}

try {
  execSync('git config core.hooksPath .githooks', { stdio: 'inherit' });
  console.log('✓ Git hooks configured');
} catch {
  console.log('Git not available, skipping hooks setup');
}