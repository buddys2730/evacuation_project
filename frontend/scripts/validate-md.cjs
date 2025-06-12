const fs = require("fs");
const path = require("path");

const DOCS_DIR = path.join(__dirname, "../frontend/docs");

function validateMarkdownFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      validateMarkdownFiles(fullPath);
    } else if (file.endsWith(".md")) {
      const content = fs.readFileSync(fullPath, "utf8");
      if (!content.includes("#")) {
        console.error(`[ERROR] No header in ${fullPath}`);
        process.exitCode = 1;
      }
    }
  }
}

validateMarkdownFiles(DOCS_DIR);
