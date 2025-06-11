// File: scripts/ci-auto-repair.js

import { execSync } from 'child_process';
import fs from 'fs';

function run(command, silent = false) {
  try {
    const output = execSync(command, { stdio: silent ? 'pipe' : 'inherit' });
    if (silent) return output.toString().trim();
  } catch (err) {
    if (!silent) console.error(`
❌ Error running: ${command}\n${err}`);
  }
}

function logStep(message) {
  console.log(`\n🚀 ${message}`);
}

function commitAndPushIfChanged() {
  const status = run('git status --porcelain', true);
  if (status) {
    logStep('変更をコミット＆プッシュ中...');
    run('git add .');
    run('git commit -m "Fix: Auto CI repair (ESLint/Markdown/Props)"');
    run('git push origin main');
  } else {
    console.log('✅ 修正すべき変更はありませんでした。');
  }
}

function main() {
  logStep('Prettier を自動フォーマット');
  run('npx prettier --write .');

  logStep('ESLint 自動修正');
  run('npx eslint . --fix');

  logStep('Markdown ルール自動更新');
  run('npm run update-md-rules');

  logStep('Markdown ルール自動検証');
  run('npm run validate-md');

  commitAndPushIfChanged();
  console.log('\n✅ 全自動CI修復完了！GitHub Actionsが再実行されます。');
}

main();
