#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const targetPath = path.resolve('./scripts/ci-auto-inspect.js');

// Step 1: Run ESLint --fix
try {
  execSync(`npx eslint "${targetPath}" --fix`, { stdio: 'inherit' });
  console.log('✅ ESLint fix completed.');
} catch {
  console.warn('⚠️ ESLint fix failed.');
}

// Step 2: Run Prettier --write
try {
  execSync(`npx prettier --write "${targetPath}"`, { stdio: 'inherit' });
  console.log('✅ Prettier formatting completed.');
} catch {
  console.warn('⚠️ Prettier formatting failed.');
}

// Step 3: Git diff (to record what was changed)
try {
  const diff = execSync(`git diff "${targetPath}"`).toString();
  const logDir = path.resolve('./scripts/fixlogs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
  fs.writeFileSync(path.join(logDir, 'ci-auto-inspect.diff'), diff, 'utf-8');
  console.log('📄 修正差分を scripts/fixlogs/ci-auto-inspect.diff に保存しました。');
} catch {
  console.warn('⚠️ 差分記録に失敗しました。');
}
