#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

const getGitOutput = (cmd) => {
  try {
    return execSync(cmd).toString().trim().split('\n').filter(Boolean);
  } catch {
    return []; // ← 修正済み
  }
};

const modifiedFiles = getGitOutput('git diff --name-only');
const untrackedFiles = getGitOutput('git ls-files --others --exclude-standard');

const allFiles = [...new Set([...modifiedFiles, ...untrackedFiles])];

const categorized = {
  js: [],
  md: [],
  yml: [],
  json: [],
  others: [],
};

allFiles.forEach((file) => {
  if (file.endsWith('.js')) categorized.js.push(file);
  else if (file.endsWith('.md')) categorized.md.push(file);
  else if (file.endsWith('.yml') || file.endsWith('.yaml')) categorized.yml.push(file);
  else if (file.endsWith('.json')) categorized.json.push(file);
  else categorized.others.push(file);
});

fs.writeFileSync('./scripts/ci_files.json', JSON.stringify(categorized, null, 2), 'utf-8');

console.log('✅ 差分ファイルを分類して scripts/ci_files.json に出力しました。');
