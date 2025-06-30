import fs from "fs";
const MD_PATH = "./docs/ResultCardList.md";
const JS_PATH = "./src/components/ResultCardList.js";

// mdからprops抽出
const md = fs.readFileSync(MD_PATH, "utf-8");
const mdProps = md
  .split("\n")
  .filter((line) => /^\|\s*`[^`]+`\s*\|/.test(line))
  .map((line) => {
    const m = line.match(/^\|\s*`([^`]+)`/);
    return m ? m[1] : null;
  })
  .filter(Boolean);

// jsからpropTypes抽出
const js = fs.readFileSync(JS_PATH, "utf-8");
const propTypesMatch = js.match(/ResultCardList\.propTypes\s*=\s*{([^}]*)}/s);
const propProps = propTypesMatch
  ? propTypesMatch[1]
      .split(",")
      .map((s) => s.split(":")[0].trim())
      .filter(Boolean)
  : [];
console.log("DEBUG propTypesProps:", propProps);

const missingInJs = mdProps.filter((p) => !propProps.includes(p));
const missingInMd = propProps.filter((p) => !mdProps.includes(p));
if (missingInJs.length === 0 && missingInMd.length === 0) {
  console.log("✅ ResultCardList.mdとコードのpropsが完全一致しました。");
  process.exit(0);
} else {
  if (missingInJs.length > 0)
    console.error("❌ mdにあるがJSにないprops:", missingInJs.join(", "));
  if (missingInMd.length > 0)
    console.error("❌ JSにあるがmdにないprops:", missingInMd.join(", "));
  process.exit(1);
}
