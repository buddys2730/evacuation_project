import { glob } from 'glob';
import fs from 'fs';

const checkMarkdownFiles = async () => {
  const files = await glob('**/*.md', {
    ignore: ['node_modules/**', 'frontend/node_modules/**', 'scripts/**']
  });

  let hasErrors = false;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('!!ERROR!!')) {
      console.error(`❌ ERROR in ${file}`);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    process.exit(1);
  } else {
    console.log('✅ Markdown validation passed.');
  }
};

checkMarkdownFiles();
