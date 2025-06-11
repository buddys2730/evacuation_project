#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// 依存チェック
function ensureDependency(pkg) {
  try {
    require.resolve(pkg);
  } catch {
    console.log(`📦 ${pkg} をインストール中...`);
    execSync(`npm install --save-dev ${pkg}`, { stdio: 'inherit' });
  }
}

// 必要な依存モジュール
['glob', 'eslint', 'prettier'].forEach(ensureDependency);

// スクリプト群を順に実行
const steps = [
  {
    name: 'ESLint 修正',
    cmd: `npx eslint . --fix`,
  },
  {
    name: 'Prettier フォーマット',
    cmd: `npx prettier --write .`,
  },
  {
    name: 'Markdown ルール更新',
    cmd: `node scripts/auto-update-md-rules.js`,
  },
  {
    name: 'Markdown ルール検証',
    cmd: `node scripts/validate-md.js`,
  },
];

steps.forEach(({ name, cmd }) => {
  try {
    console.log(`\n🚀 ${name} 実行中: ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
    console.log(`✅ ${name} 完了`);
  } catch {
    console.warn(`⚠️ ${name} でエラーが発生しました`);
  }
});

// 差分ログ保存
try {
  const diff = execSync(`git diff`).toString();
  const logDir = path.resolve('./scripts/fixlogs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
  fs.writeFileSync(path.join(logDir, 'full-ci-repair.diff'), diff, 'utf-8');
  console.log('\n📄 差分ログを scripts/fixlogs/full-ci-repair.diff に保存しました。');
} catch {
  console.warn('⚠️ 差分記録に失敗しました');
}
