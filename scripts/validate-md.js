import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const RULES_PATH = path.resolve('.md_rules.json');
const rulesData = JSON.parse(fs.readFileSync(RULES_PATH, 'utf-8'));
const ruleMap = rulesData.rules || {};
const monitorPatterns = rulesData.monitor || [];

function validateMdContent(filePath, content) {
  const fileName = path.basename(filePath);
  const requiredKeywords = ruleMap[fileName];
  if (!requiredKeywords) return true; // ルールがなければスキップ

  return requiredKeywords.every((keyword) => content.includes(keyword));
}

async function checkMarkdownFiles() {
  let hasError = false;

  for (const pattern of monitorPatterns) {
    const files = await glob(pattern, { ignore: rulesData.ignore || [] });

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const isValid = validateMdContent(file, content);

      if (!isValid) {
        console.error(
          `❌ ${file} がルール違反しています。以下が不足しています:`
        );
        const expected = ruleMap[path.basename(file)];
        for (const keyword of expected) {
          if (!content.includes(keyword)) {
            console.error(`- ${keyword}`);
          }
        }
        hasError = true;
      }
    }
  }

  if (hasError) {
    process.exit(1);
  } else {
    console.log('✅ Markdown契約・設計チェックをすべて通過しました。');
  }
}

checkMarkdownFiles();
