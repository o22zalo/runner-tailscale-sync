#!/usr/bin/env node
/**
 * scripts/publish.js
 * Publish package to npm
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("📦 Publishing runner-tailscale-sync...\n");

// 1. Read package.json
const pkg = require("../package.json");
console.log(`Package: ${pkg.name}@${pkg.version}`);

// 2. Run build first
console.log("\n🔨 Running build...");
try {
  execSync("node scripts/build.js", { stdio: "inherit" });
} catch (err) {
  console.error("❌ Build failed");
  process.exit(1);
}

// 3. Check if already published
console.log("\n🔍 Checking if version exists...");
try {
  const output = execSync(`npm view ${pkg.name}@${pkg.version} version`, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();

  if (output === pkg.version) {
    console.error(`❌ Version ${pkg.version} already published`);
    console.log("Run 'npm run version' to generate a new version");
    process.exit(1);
  }
} catch (err) {
  // Version doesn't exist - this is good
  console.log("✅ Version is new");
}

// 4. Publish
console.log("\n📤 Publishing to npm...");

const publishCmd = process.argv.includes("--dry-run")
  ? "npm publish --dry-run"
  : "npm publish";

try {
  execSync(publishCmd, { stdio: "inherit" });
  console.log("\n✅ Published successfully!");
  console.log(`\nInstall with: npm install ${pkg.name}`);
} catch (err) {
  console.error("\n❌ Publish failed");
  process.exit(1);
}
