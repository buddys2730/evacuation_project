import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.join(__dirname, "../frontend/docs");

fs.readdirSync(docsDir).forEach((file) => {
  if (file.endsWith(".md")) {
    const content = fs.readFileSync(path.join(docsDir, file), "utf8");
    if (!content.includes("##")) {
      console.error(`❌ Missing section header in ${file}`);
      process.exit(1);
    }
  }
});

console.log("✅ Markdown validation passed.");
