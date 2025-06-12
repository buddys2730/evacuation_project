const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../../docs');

function validateMarkdownFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      validateMarkdownFiles(fullPath);
    } else if (file.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('TODO')) {
        console.warn(`Warning: TODO found in ${fullPath}`);
      }
    }
  }
}

validateMarkdownFiles(directoryPath);
console.log('✅ Markdown validation completed.');
