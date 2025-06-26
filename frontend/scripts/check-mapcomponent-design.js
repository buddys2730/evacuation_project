import fs from "fs";
const MD_PATH = "./docs/mapComponent.md";
const JS_PATH = "./src/components/MapComponent.js";

// 「## 📥 入力 Props」〜「##」またはファイル末尾 までpropsテーブル部分のみ抽出
const md = fs.readFileSync(MD_PATH, "utf-8");
const propsSection = md.split("## 📥 入力 Props")[1]?.split("##")[0] || "";
const mdPropRows = propsSection.split("\n").filter(line => /^\|\s*`[^`]+`\s*\|/.test(line));
const mdProps = mdPropRows.map(line => {
  const match = line.match(/^\|\s*`([^`]+)`/);
  return match ? match[1] : null;
}).filter(Boolean);

// JSのprops宣言・propTypes両対応
const js = fs.readFileSync(JS_PATH, "utf-8");
const propsArgsMatch = js.match(/MapComponent\s*=\s*\(\s*{([^}]*)}/s);
const jsProps =
  propsArgsMatch
    ? propsArgsMatch[1].split(",").map((s) => s.replace(/=.*$/, "").trim()).filter(Boolean)
    : [];
const propTypesMatch = js.match(/MapComponent\.propTypes\s*=\s*{([^}]*)}/s);
const propTypesProps = propTypesMatch
  ? propTypesMatch[1].split(",").map((s) => s.split(":")[0].replace(/\/.*$/, "").trim()).filter(Boolean)
  : [];
const allJsProps = Array.from(new Set([...jsProps, ...propTypesProps])).filter(Boolean);

// 差分判定
const missingInJs = mdProps.filter((p) => !allJsProps.includes(p));
const missingInMd = allJsProps.filter((p) => !mdProps.includes(p));

// 結果表示
if (missingInJs.length === 0 && missingInMd.length === 0) {
  console.log("✅ MapComponent設計.mdとコードのpropsが完全一致しました。");
  process.exit(0);
} else {
  if (missingInJs.length > 0) {
    console.error("❌ 設計.mdにあるがJSにないprops:", missingInJs.join(", "));
  }
  if (missingInMd.length > 0) {
    console.error("❌ JSにあるが設計.mdにないprops:", missingInMd.join(", "));
  }
  process.exit(1);
}
