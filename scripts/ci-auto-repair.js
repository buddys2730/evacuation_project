// scripts/ci-auto-repair.js

import { execSync } from 'child_process';
import fs from 'fs';

function runCommand(cmd, desc) {
  try {
    console.log(`\n🚀 ${desc}`);
    const output = execSync(cmd, { stdio: 'inherit' });
    return output;
  } catch (err) {
    console.error(`❌ ${desc} に失敗しました`);
    process.exit(1);
  }
}

function commitIfChanged(message) {
  try {
    const changed = execSync('git status --porcelain').toString().trim();
    if (changed) {
      runCommand('git add .', 'git add');
      runCommand(`git commit -m "${message}"`, 'git commit');
      runCommand('git push origin main', 'git push');
      console.log('✅ Git への自動コミット完了');
    } else {
      console.log('✅ Git に差分はありません');
    }
  } catch (err) {
    console.error('❌ Git 処理でエラー');
    process.exit(1);
  }
}

// 実行処理
runCommand('npx prettier --write .', 'Prettier フォーマット');
runCommand('npx eslint . --fix', 'ESLint 自動修正');
runCommand('npm run update-md-rules', 'Markdown ルール更新');
runCommand('npm run validate-md', 'Markdown ルール検証');

commitIfChanged('CI: Prettier/ESLint/Markdownルール自動修復');
