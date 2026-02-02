#!/usr/bin/env node
/**
 * scripts/build.js
 * Build validation và preparation
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔨 Building runner-tailscale-sync...\n");

// 1. Validate package.json
console.log("✅ Validating package.json...");
const pkg = require("../package.json");

if (!pkg.name || !pkg.version) {
  console.error("❌ Invalid package.json");
  process.exit(1);
}

console.log(`   Name: ${pkg.name}`);
console.log(`   Version: ${pkg.version}`);

// 2. Ensure bin is executable
console.log("\n✅ Setting bin permissions...");
const binPath = path.join(__dirname, "..", "bin", "runner-sync.js");

if (fs.existsSync(binPath)) {
  try {
    fs.chmodSync(binPath, 0o755);
    console.log(`   ${binPath} is now executable`);
  } catch (err) {
    console.error(`   ⚠️  Could not set executable: ${err.message}`);
  }
} else {
  console.error(`   ❌ Bin file not found: ${binPath}`);
  process.exit(1);
}

// 3. Validate src structure
console.log("\n✅ Validating source structure...");
const requiredDirs = [
  "src/core",
  "src/adapters",
  "src/cli/commands",
  "src/utils",
];

for (const dir of requiredDirs) {
  const dirPath = path.join(__dirname, "..", dir);
  if (!fs.existsSync(dirPath)) {
    console.error(`   ❌ Missing directory: ${dir}`);
    process.exit(1);
  }
}

console.log("   All required directories exist");

// 4. Validate entry points
console.log("\n✅ Validating entry points...");
const entryPoints = [
  "src/index.js",
  "bin/runner-sync.js",
];

for (const entry of entryPoints) {
  const entryPath = path.join(__dirname, "..", entry);
  if (!fs.existsSync(entryPath)) {
    console.error(`   ❌ Missing entry point: ${entry}`);
    process.exit(1);
  }
}

console.log("   All entry points exist");

// 5. Test require
console.log("\n✅ Testing require...");
try {
  require("../src/index.js");
  console.log("   Library can be required");
} catch (err) {
  console.error(`   ❌ Failed to require library: ${err.message}`);
  process.exit(1);
}

console.log("\n✅ Build validation complete!");
console.log("\n📦 Package is ready for distribution");
console.log("\nNext steps:");
console.log("  - Test locally: node bin/runner-sync.js --help");
console.log("  - Publish: npm run publish");
