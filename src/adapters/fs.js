/**
 * adapters/fs.js
 * File system operations với atomic write, ensure dir
 */

const fs = require("fs");
const path = require("path");

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Ensure multiple directories exist
 */
function ensureDirs(dirPaths) {
  dirPaths.forEach(ensureDir);
}

/**
 * Read JSON file
 */
function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (err) {
    throw new Error(`Failed to read JSON from ${filePath}: ${err.message}`);
  }
}

/**
 * Write JSON file (atomic)
 */
function writeJson(filePath, data) {
  const content = JSON.stringify(data, null, 2);
  const tmpPath = `${filePath}.tmp`;

  try {
    // Write to temp file first
    fs.writeFileSync(tmpPath, content, "utf8");

    // Rename to actual file (atomic on most filesystems)
    fs.renameSync(tmpPath, filePath);
  } catch (err) {
    // Clean up temp file if exists
    if (fs.existsSync(tmpPath)) {
      fs.unlinkSync(tmpPath);
    }
    throw new Error(`Failed to write JSON to ${filePath}: ${err.message}`);
  }
}

/**
 * Write text file (atomic)
 */
function writeFile(filePath, content) {
  const tmpPath = `${filePath}.tmp`;

  try {
    fs.writeFileSync(tmpPath, content, "utf8");
    fs.renameSync(tmpPath, filePath);
  } catch (err) {
    if (fs.existsSync(tmpPath)) {
      fs.unlinkSync(tmpPath);
    }
    throw new Error(`Failed to write file ${filePath}: ${err.message}`);
  }
}

/**
 * Read text file
 */
function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (err) {
    throw new Error(`Failed to read file ${filePath}: ${err.message}`);
  }
}

/**
 * Check if path exists
 */
function exists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Delete file or directory recursively
 */
function remove(targetPath) {
  if (!fs.existsSync(targetPath)) return;

  if (fs.statSync(targetPath).isDirectory()) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  } else {
    fs.unlinkSync(targetPath);
  }
}

/**
 * Get directory size (recursive)
 */
function getDirSize(dirPath) {
  let size = 0;

  if (!fs.existsSync(dirPath)) return 0;

  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      size += getDirSize(filePath);
    } else {
      size += stats.size;
    }
  }

  return size;
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

module.exports = {
  ensureDir,
  ensureDirs,
  readJson,
  writeJson,
  writeFile,
  readFile,
  exists,
  remove,
  getDirSize,
  formatBytes,
};
