const fs = require('fs');
const path = require('path');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (
        file === 'node_modules' ||
        file === '.venv' ||
        file === 'venv' ||
        file === '__pycache__' ||
        file.startsWith('.')
      ) {
        return;
      }
      getAllFiles(fullPath, fileList);
    } else {
      if (
        (file.endsWith('.js') ||
          file.endsWith('.jsx') ||
          file.endsWith('.ts') ||
          file.endsWith('.tsx')) &&
        !fullPath.includes('node_modules')
      ) {
        fileList.push(fullPath);
      }
    }
  });
  return fileList;
}

const files = getAllFiles('./frontend/src');

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.includes('require(') || line.includes('module.exports')) {
      console.log(`${file}#L${index + 1}`);
      console.warn(`  Use of CommonJS detected: '${line.trim()}'`);
    }
  });
}
