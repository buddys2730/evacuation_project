#!/usr/bin/env node

import fs from 'fs';
import { glob } from 'glob';

const COMPONENTS_DIR = './src/components/';
const files = await glob(`${COMPONENTS_DIR}/**/*.js`);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // 既にpropTypesまたは型注釈があるファイルはスキップ
  if (content.includes('.propTypes') || content.includes('PropTypes')) return;

  const match = content.match(/const (\w+) ?= ?\(/);
  if (!match) return;

  const componentName = match[1];

  // import文がなければ追加
  if (!content.includes('import PropTypes')) {
    content = `import PropTypes from 'prop-types';\n` + content;
  }

  // propTypesの雛形追加
  content += `\n${componentName}.propTypes = {\n  // TODO: define props here\n};\n`;

  fs.writeFileSync(file, content, 'utf8');
  console.log(`✔️  Added propTypes to ${file}`);
});
