# Optional Features - Tùy chọn bật thêm

Package này được thiết kế với zero dependencies để tối ưu size và compatibility. Tuy nhiên, bạn có thể bật thêm các công cụ sau nếu cần.

---

## 🧪 Testing

### Option 1: Node.js built-in test runner (Node >= 20)

```bash
# Không cần cài gì thêm
```

Tạo `tests/example.test.js`:
```javascript
const { test } = require('node:test');
const assert = require('node:assert');
const { Config } = require('../src/index.js');

test('Config should load defaults', () => {
  const config = new Config();
  assert.ok(config.cwd);
  assert.strictEqual(config.isWindows, process.platform === 'win32');
});
```

Chạy:
```bash
node --test tests/**/*.test.js
```

Add vào `package.json`:
```json
{
  "scripts": {
    "test": "node --test tests/**/*.test.js"
  }
}
```

### Option 2: Vitest (recommended)

```bash
npm install --save-dev vitest
```

Tạo `vitest.config.js`:
```javascript
export default {
  test: {
    globals: true,
    environment: 'node',
  },
};
```

Tạo test file:
```javascript
import { describe, it, expect } from 'vitest';
import { Config } from '../src/index.js';

describe('Config', () => {
  it('should load defaults', () => {
    const config = new Config();
    expect(config.cwd).toBeDefined();
  });
});
```

Add vào `package.json`:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

---

## 🎨 Linting & Formatting

### ESLint

```bash
npm install --save-dev eslint
npx eslint --init
```

Tạo `.eslintrc.js`:
```javascript
module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
  },
};
```

Add vào `package.json`:
```json
{
  "scripts": {
    "lint": "eslint src/ bin/ scripts/",
    "lint:fix": "eslint src/ bin/ scripts/ --fix"
  }
}
```

### Prettier

```bash
npm install --save-dev prettier
```

Tạo `.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

Add vào `package.json`:
```json
{
  "scripts": {
    "format": "prettier --write 'src/**/*.js' 'bin/**/*.js' 'scripts/**/*.js'",
    "format:check": "prettier --check 'src/**/*.js'"
  }
}
```

### Combine ESLint + Prettier

```bash
npm install --save-dev eslint-config-prettier eslint-plugin-prettier
```

Update `.eslintrc.js`:
```javascript
module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
};
```

---

## 🔄 CI/CD

### GitHub Actions

Tạo `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [20.x, 22.x]

    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
      
      - name: Build validation
        run: npm run build

  publish:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20.x'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Publish to npm
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Azure Pipelines

Tạo `azure-pipelines.yml`:
```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'
    displayName: 'Install Node.js'

  - script: npm ci
    displayName: 'Install dependencies'

  - script: npm run lint
    displayName: 'Lint'

  - script: npm test
    displayName: 'Test'

  - script: npm run build
    displayName: 'Build'

  - script: npm publish
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    displayName: 'Publish to npm'
    env:
      NPM_TOKEN: $(NPM_TOKEN)
```

---

## 📦 Bundling (nếu muốn single-file distribution)

### Option 1: esbuild

```bash
npm install --save-dev esbuild
```

Tạo `scripts/bundle.js`:
```javascript
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/bundle.js',
  external: ['fs', 'path', 'os', 'child_process'],
}).catch(() => process.exit(1));
```

Add vào `package.json`:
```json
{
  "scripts": {
    "bundle": "node scripts/bundle.js"
  }
}
```

### Option 2: Webpack

```bash
npm install --save-dev webpack webpack-cli
```

Tạo `webpack.config.js`:
```javascript
const path = require('path');

module.exports = {
  entry: './src/index.js',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2',
  },
  externals: {
    // Don't bundle Node.js built-ins
    fs: 'commonjs fs',
    path: 'commonjs path',
    os: 'commonjs os',
    child_process: 'commonjs child_process',
  },
};
```

---

## 📚 Documentation Generation

### JSDoc

```bash
npm install --save-dev jsdoc
```

Add JSDoc comments:
```javascript
/**
 * Sync runner data between runners
 * @param {Object} options - Configuration options
 * @param {string} [options.cwd] - Working directory
 * @param {boolean} [options.verbose] - Verbose logging
 * @returns {Promise<Object>} Sync result
 */
async function sync(options = {}) {
  // ...
}
```

Tạo `jsdoc.json`:
```json
{
  "source": {
    "include": ["src"],
    "includePattern": ".js$"
  },
  "opts": {
    "destination": "docs",
    "recurse": true
  }
}
```

Add vào `package.json`:
```json
{
  "scripts": {
    "docs": "jsdoc -c jsdoc.json"
  }
}
```

### TypeScript Definitions (cho users dùng TypeScript)

Tạo `index.d.ts`:
```typescript
export interface SyncOptions {
  cwd?: string;
  verbose?: boolean;
  quiet?: boolean;
}

export interface SyncResult {
  success: boolean;
  results?: any;
}

export function sync(options?: SyncOptions): Promise<SyncResult>;
export function init(options?: SyncOptions): Promise<SyncResult>;
export function push(options?: SyncOptions): Promise<SyncResult>;
export function status(options?: SyncOptions): Promise<SyncResult>;

export class Config {
  constructor(options?: SyncOptions);
  cwd: string;
  runnerDataDir: string;
  // ...
}

export class Logger {
  constructor(options: {
    packageName: string;
    version: string;
    command?: string;
    verbose?: boolean;
    quiet?: boolean;
  });
  info(msg: string): void;
  success(msg: string): void;
  warn(msg: string): void;
  error(msg: string): void;
  debug(msg: string): void;
}
```

Add vào `package.json`:
```json
{
  "types": "index.d.ts"
}
```

---

## 🔍 Code Coverage

### c8 (for node:test)

```bash
npm install --save-dev c8
```

Add vào `package.json`:
```json
{
  "scripts": {
    "test": "node --test tests/**/*.test.js",
    "test:coverage": "c8 npm test"
  }
}
```

### Vitest built-in coverage

```bash
npm install --save-dev @vitest/coverage-v8
```

Update `vitest.config.js`:
```javascript
export default {
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
    },
  },
};
```

Add vào `package.json`:
```json
{
  "scripts": {
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## 🐳 Docker Support

Tạo `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install Tailscale (optional)
RUN apk add --no-cache curl bash && \
    curl -fsSL https://tailscale.com/install.sh | sh

# Copy package
COPY package*.json ./
COPY src/ ./src/
COPY bin/ ./bin/

RUN npm install --production

# Make CLI executable
RUN chmod +x bin/runner-sync.js

ENTRYPOINT ["node", "bin/runner-sync.js"]
```

Tạo `docker-compose.yml`:
```yaml
version: '3.8'

services:
  runner-sync:
    build: .
    environment:
      - TAILSCALE_CLIENT_ID=${TAILSCALE_CLIENT_ID}
      - TAILSCALE_CLIENT_SECRET=${TAILSCALE_CLIENT_SECRET}
      - TAILSCALE_ENABLE=1
    volumes:
      - ./data:/app/.runner-data
    command: ["sync"]
```

---

## 📊 Performance Monitoring

### Clinic.js

```bash
npm install --save-dev clinic
```

Add vào `package.json`:
```json
{
  "scripts": {
    "perf:doctor": "clinic doctor -- node bin/runner-sync.js",
    "perf:flame": "clinic flame -- node bin/runner-sync.js",
    "perf:bubbleprof": "clinic bubbleprof -- node bin/runner-sync.js"
  }
}
```

---

## 🔒 Security Scanning

### npm audit

```bash
# Built-in - không cần cài gì
npm audit
npm audit fix
```

### Snyk

```bash
npm install -g snyk
snyk test
```

---

## 📝 Changelog Generation

### conventional-changelog

```bash
npm install --save-dev conventional-changelog-cli
```

Add vào `package.json`:
```json
{
  "scripts": {
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s"
  }
}
```

---

## 🎯 Pre-commit Hooks

### Husky + lint-staged

```bash
npm install --save-dev husky lint-staged
npx husky install
```

Tạo `.husky/pre-commit`:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

Add vào `package.json`:
```json
{
  "lint-staged": {
    "*.js": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

---

## 📌 Tóm tắt

Tất cả các tùy chọn trên đều **KHÔNG BẮT BUỘC**. Package hoạt động hoàn toàn tốt mà không cần bất kỳ dependency nào.

Chỉ bật các tính năng này khi:
- Team có quy trình CI/CD chặt chẽ
- Cần đảm bảo code quality cao
- Project scale lớn với nhiều contributors
- Cần performance monitoring chi tiết

Đối với use case đơn giản, package mặc định (zero dependencies) là đủ!
