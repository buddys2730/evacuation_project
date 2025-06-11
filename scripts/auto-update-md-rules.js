#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob'; // Promise対応済

const rulesPath = path.resolve('./.md_rules.json');
const docsPath = path.resolve('./docs/components');

const existing = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));
const monitored = new Set(Object.keys(existing.rules || {}));

const main = async () => {
  const files = await glob(path.join(docsPath, '*.md'));
  let updated = false;

  files.forEach((file) => {
    const name = path.basename(file);
    if (!monitored.has(name)) {
      console.log(`🆕 新規 .md ファイル検出: ${name}`);
      existing.rules[name] = [
        '契約条件: 本ドキュメントは開発の一貫性・責任を担保するものであり、変更時は承認を必要とする',
        '設計遵守: すべてのマイクロシステムはこの指針に従うこと',
        '変更記録: 変更理由、日時、責任者が必ず明記されること',
      ];
      updated = true;
    }
  });

  if (updated) {
    fs.writeFileSync(rulesPath, JSON.stringify(existing, null, 2), 'utf-8');
    console.log('✅ .md_rules.json を更新しました。');
  } else {
    console.log('✅ 新しいファイルはありません。');
  }
};

main(); // ← ここだけが変更点
