#!/usr/bin/env node

/**
 * Build verification script
 * Verifies that only the selected tenant's code is included in the build
 */

const fs = require('fs');
const path = require('path');

let tenantId = process.env.TENANT_ID;
const repoRoot = path.join(__dirname, '..');

function resolveBuildDir(currentTenantId) {
  if (currentTenantId) {
    const tenantBuildDir = path.join(repoRoot, `.next-${currentTenantId}`);
    if (fs.existsSync(tenantBuildDir)) return tenantBuildDir;
  }
  return path.join(repoRoot, '.next');
}

// Auto-detect tenant from build artifacts if not set
if (!tenantId) {
  const candidateBuildDirs = [
    path.join(repoRoot, '.next-vukans-bike'),
    path.join(repoRoot, '.next-resort-example'),
    path.join(repoRoot, '.next'),
  ];
  const buildDir = candidateBuildDirs.find((dir) => fs.existsSync(dir)) || path.join(repoRoot, '.next');
  // Check middleware (contains tenant config id) or analyze files
  const middlewarePath = path.join(buildDir, 'server', 'src', 'middleware.js');
  const analyzeDir = path.join(repoRoot, 'analyze');
  const serverAnalyzeDir = path.join(buildDir, 'server', 'analyze');

  if (fs.existsSync(middlewarePath)) {
    const content = fs.readFileSync(middlewarePath, 'utf-8');
    // Minified middleware embeds tenant id as id:"vukans-bike" or similar
    if (content.includes('vukans-bike')) {
      tenantId = 'vukans-bike';
    } else if (content.includes('resort-example')) {
      tenantId = 'resort-example';
    }
  }
  if (!tenantId && fs.existsSync(serverAnalyzeDir)) {
    const files = fs.readdirSync(serverAnalyzeDir).filter(f => f.endsWith('.json'));
    if (files.some(f => f.includes('vukans-bike'))) tenantId = 'vukans-bike';
    else if (files.some(f => f.includes('resort-example'))) tenantId = 'resort-example';
  }
  if (!tenantId && fs.existsSync(analyzeDir)) {
    const files = fs.readdirSync(analyzeDir).filter(f => f.endsWith('.json'));
    if (files.some(f => f.includes('vukans-bike'))) tenantId = 'vukans-bike';
    else if (files.some(f => f.includes('resort-example'))) tenantId = 'resort-example';
  }
  if (!tenantId) {
    console.error('❌ Could not detect tenant. Set TENANT_ID or run a build first.');
    console.error('   Example: TENANT_ID=vukans-bike npm run verify:build');
    process.exit(1);
  }
  console.log(`   (Auto-detected tenant: ${tenantId})\n`);
}

console.log(`\n🔍 Verifying build for tenant: ${tenantId}\n`);
console.log('='.repeat(60));

const otherTenants = ['vukans-bike', 'resort-example'].filter(t => t !== tenantId);
const buildDir = resolveBuildDir(tenantId);

let issues = [];
let warnings = 0;

// Check if build exists
if (!fs.existsSync(buildDir)) {
  console.error(`\n❌ No build found at: ${buildDir}`);
  console.log('\n   Run a build first:');
  console.log(`   TENANT_ID=${tenantId} npm run build:${tenantId === 'vukans-bike' ? 'bike' : 'resort'}`);
  process.exit(1);
}

// 1. Check webpack stats if available
console.log('\n1️⃣  Checking webpack bundle stats...');
const analyzeDir = path.join(repoRoot, 'analyze');
const serverAnalyzeDir = path.join(buildDir, 'server', 'analyze');
const hasClientStats = fs.existsSync(analyzeDir) &&
  fs.readdirSync(analyzeDir).some(f => f.endsWith('.json') && f.includes(tenantId));
const hasServerStats = fs.existsSync(serverAnalyzeDir) &&
  fs.readdirSync(serverAnalyzeDir).some(f => f.endsWith('.json') && f.includes(tenantId));
if (hasClientStats || hasServerStats) {
  const files = [];
  if (hasClientStats) files.push(...fs.readdirSync(analyzeDir).filter(f => f.endsWith('.json') && f.includes(tenantId)));
  if (hasServerStats) files.push(...fs.readdirSync(serverAnalyzeDir).filter(f => f.endsWith('.json') && f.includes(tenantId)));
  console.log(`   ✅ Found stats files: ${[...new Set(files)].join(', ')}`);
  console.log('   📊 Open the HTML reports in analyze/ or .next/server/analyze/ to inspect bundles');
} else {
  console.log('   ℹ️  No stats files found for this tenant');
  console.log('   💡 Run with ANALYZE=true to generate detailed bundle reports');
  warnings++;
}

// 2. Check server bundles for tenant references
console.log('\n2️⃣  Checking server bundles for tenant isolation...');
const serverDir = path.join(buildDir, 'server');
if (fs.existsSync(serverDir)) {
  const serverFiles = [];
  function findJsFiles(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        findJsFiles(fullPath);
      } else if (item.name.endsWith('.js')) {
        serverFiles.push(fullPath);
      }
    }
  }
  findJsFiles(serverDir);

  console.log(`   📁 Found ${serverFiles.length} server JS files`);

  // Sample check first 5 files
  const sampleFiles = serverFiles.slice(0, 5);
  let foundOtherTenant = false;

  for (const file of sampleFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    for (const otherTenant of otherTenants) {
      // Check for references to other tenant paths
      const patterns = [
        `tenants/${otherTenant}`,
        `mock-data.ts/${otherTenant}`,
        `"${otherTenant}"`,
        `'${otherTenant}'`,
      ];
      for (const pattern of patterns) {
        if (content.includes(pattern)) {
          issues.push(`Found reference to "${otherTenant}" in: ${path.relative(buildDir, file)}`);
          foundOtherTenant = true;
        }
      }
    }
  }

  if (!foundOtherTenant) {
    console.log('   ✅ No other tenant references found in sampled server files');
  }
} else {
  console.log('   ⚠️  Server directory not found');
  warnings++;
}

// 3. Check static chunks
console.log('\n3️⃣  Checking static chunks...');
const chunksDir = path.join(buildDir, 'static', 'chunks');
if (fs.existsSync(chunksDir)) {
  const chunks = fs.readdirSync(chunksDir).filter(f => f.endsWith('.js'));
  console.log(`   📦 Found ${chunks.length} JS chunks`);

  let foundOtherTenant = false;
  for (const chunk of chunks.slice(0, 10)) { // Check first 10
    const content = fs.readFileSync(path.join(chunksDir, chunk), 'utf-8');
    for (const otherTenant of otherTenants) {
      if (content.includes(`tenants/${otherTenant}`) ||
          content.includes(`mock-data.ts/${otherTenant}`)) {
        issues.push(`Found reference to "${otherTenant}" in chunk: ${chunk}`);
        foundOtherTenant = true;
      }
    }
  }

  if (!foundOtherTenant) {
    console.log('   ✅ No other tenant references found in sampled chunks');
  }
} else {
  console.log('   ⚠️  Chunks directory not found');
  warnings++;
}

// 4. Check build cache/assets
console.log('\n4️⃣  Checking build summary...');
const buildSize = getDirSize(buildDir);
console.log(`   📊 Total build size: ${(buildSize / 1024 / 1024).toFixed(2)} MB`);

// Summary
console.log('\n' + '='.repeat(60));
console.log('VERIFICATION SUMMARY');
console.log('='.repeat(60));

if (issues.length > 0) {
  console.log(`\n❌ FAILED - Found ${issues.length} issue(s):\n`);
  issues.forEach((issue, i) => {
    console.log(`   ${i + 1}. ${issue}`);
  });
  console.log('\n⚠️  Other tenant code may be included in the build!');
  process.exit(1);
} else {
  console.log(`\n✅ PASSED - Build appears to be isolated for "${tenantId}"`);
  if (warnings > 0) {
    console.log(`   ℹ️  ${warnings} warning(s) - some checks were skipped`);
  }
  console.log('\n📝 Notes:');
  console.log('   • This is a sampling-based check, not exhaustive');
  console.log('   • For detailed analysis, run with ANALYZE=true');
  console.log('   • Example: ANALYZE=true npm run build:bike');
  process.exit(0);
}

// Helper function
function getDirSize(dir) {
  let size = 0;
  const items = fs.readdirSync(dir, { withFileTypes: true, recursive: true });
  for (const item of items) {
    if (item.isFile()) {
      const stats = fs.statSync(path.join(item.parentPath || item.path, item.name));
      size += stats.size;
    }
  }
  return size;
}
