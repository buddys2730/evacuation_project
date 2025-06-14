import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname 相当
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.join(__dirname, "../frontend/docs");

function validateMarkdown(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  // ここでMarkdownのルール判定
  if (content.includes("<<<<<<<") || content.includes("=======") || content.includes(">>>>>>>")) {
    console.log(`[FAIL] Merge conflict marker in ${path.basename(filePath)}`);
    return false;
  }
  // 他のルールも追加可
  return true;
}

function validateAllMarkdownFiles() {
  const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith(".md"));
  let allValid = true;
  files.forEach(file => {
    const fullPath = path.join(DOCS_DIR, file);
    if (!validateMarkdown(fullPath)) {
      allValid = false;
    }
  });
  if (allValid) {
    console.log("All markdown files passed validation ✅");
    process.exit(0);
  } else {
    console.error("Some markdown files failed validation ❌");
    process.exit(1);
  }
}

validateAllMarkdownFiles();
