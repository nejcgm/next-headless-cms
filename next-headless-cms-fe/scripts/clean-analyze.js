#!/usr/bin/env node
/**
 * Removes old analyze output from previous builds.
 * Run before build so each build starts with a clean analyze folder.
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const dirsToClean = [
  path.join(rootDir, 'analyze'),
  path.join(rootDir, '.next', 'analyze'),
  path.join(rootDir, '.next', 'server', 'analyze'),
];

for (const dir of dirsToClean) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true });
    console.log(`Cleaned: ${path.relative(rootDir, dir)}`);
  }
}
