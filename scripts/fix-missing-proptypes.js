#!/usr/bin/env node
import fs from 'fs';
import glob from 'glob';
const files = glob.sync('frontend/src/components/**/*.js');
files.forEach(file => {
  let src = fs.readFileSync(file, 'utf8');
  if (!/\.propTypes/.test(src)) {
    const m = src.match(/const (\w+)\s*=\s*\(/);
    if (m) {
      const name = m[1];
      if (!/import PropTypes/.test(src)) {
        src = `import PropTypes from 'prop-types';\n` + src;
      }
      src += `\n${name}.propTypes = {\n  // auto propTypes\n};\n`;
      fs.writeFileSync(file, src, 'utf8');
    }
  }
});
