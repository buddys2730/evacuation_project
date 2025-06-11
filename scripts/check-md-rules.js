const fs = require('fs');
const path = require('path');
const glob = require('glob');

const rulesPath = path.resolve(__dirname, '../.md_rules.json');
const rulesData = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));

let hasError = false;

rulesData.monitor.forEach((pattern) => {
  const files = glob.sync(pattern);

  files.forEach((file) => {
    if (rulesData.ignore && rulesData.ignore.includes(path.basename(file))) return;

    const content = fs.readFileSync(file, 'utf8');
    const fileName = path.basename(file);

    const expectedRules = rulesData.rules[fileName];
    if (!expectedRules) return;

    expectedRules.forEach((requiredLine) => {
      if (!content.includes(requiredLine)) {
        console.error(
          `❌ ${file} がルール違反しています。以下が不足しています:\n- ${requiredLine}\n`
        );
        hasError = true;
      }
    });
  });
});

if (hasError) {
  process.exit(1);
} else {
  console.log('✅ Markdown設計・契約ルールに準拠しています。');
}
