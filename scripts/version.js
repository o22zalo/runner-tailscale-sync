#!/usr/bin/env node
/**
 * scripts/version.js
 * Generate version theo giờ Việt Nam: 1.yyMMdd.1HHmm
 */

const fs = require("fs");
const path = require("path");

// Import time utils
const VN_OFFSET = 7 * 60; // UTC+7

function getVietnamTime() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (VN_OFFSET * 60000));
}

function formatVietnamTime(date, format) {
  const yy = String(date.getFullYear()).slice(-2);
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const HH = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');

  return format
    .replace('yy', yy)
    .replace('MM', MM)
    .replace('dd', dd)
    .replace('HH', HH)
    .replace('mm', mm);
}

function generateVersion() {
  const vnTime = getVietnamTime();
  const yyMMdd = formatVietnamTime(vnTime, 'yyMMdd');
  const HHmm = formatVietnamTime(vnTime, 'HHmm');
  return `1.${yyMMdd}.1${HHmm}`;
}

// Main
const newVersion = generateVersion();

console.log(`Generated version: ${newVersion}`);
console.log(`Format: 1.yyMMdd.1HHmm (Vietnam timezone)`);

// Update package.json
const pkgPath = path.join(__dirname, "..", "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

const oldVersion = pkg.version;
pkg.version = newVersion;

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");

console.log(`Updated package.json: ${oldVersion} → ${newVersion}`);
console.log(`\nTo publish: npm run publish`);
