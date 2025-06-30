import fs from "fs";
const MD_PATH = "./docs/UserMarker.md";
const JS_PATH = "./src/components/map/UserMarker.js";

const md = fs.readFileSync(MD_PATH, "utf-8");
const mdPropRows = md
  .split("\n")
  .filter((line) => /^\|\s*`[^`]+`\s*\|/.test(line));
const mdProps = mdPropRows
  .map((line) => {
    const match = line.match(/^\|\s*`([^`]+)`/);
    return match ? match[1] : null;
  })
  .filter(Boolean);

const js = fs.readFileSync(JS_PATH, "utf-8");

// トップレベルpropsだけを厳密抽出するロジック（shapeの中は一切除外！）
function extractTopLevelPropTypesProps(js) {
  // propTypes全体を抜き出し
  const match = js.match(/UserMarker\.propTypes\s*=\s*{([\s\S]*?)}/);
  if (!match) return [];
  const block = match[1];
  // {}のネストをカウントして最上位のキーだけ抜き出す
  const lines = block.split("\n").map((s) => s.trim());
  const keys = [];
  let nest = 0;
  for (const line of lines) {
    // ネスト検出
    for (const c of line) {
      if (c === "{") nest++;
      if (c === "}") nest--;
    }
    if (nest === 0) {
      const m = line.match(/^([a-zA-Z0-9_]+)\s*:/);
      if (m) keys.push(m[1]);
    }
  }
  return keys;
}

// props引数抽出
const propsArgsMatch = js.match(/UserMarker\s*=\s*\(\s*{([^}]*)}/s);
const jsProps = propsArgsMatch
  ? propsArgsMatch[1]
      .split(",")
      .map((s) => s.replace(/=.*$/, "").trim())
      .filter(Boolean)
  : [];
const propTypesProps = extractTopLevelPropTypesProps(js);
const allJsProps = Array.from(new Set([...jsProps, ...propTypesProps])).filter(
  Boolean,
);

const missingInJs = mdProps.filter((p) => !allJsProps.includes(p));
const missingInMd = allJsProps.filter((p) => !mdProps.includes(p));

if (missingInJs.length === 0 && missingInMd.length === 0) {
  console.log("✅ UserMarker.mdとコードのpropsが完全一致しました。");
  process.exit(0);
} else {
  if (missingInJs.length > 0) {
    console.error("❌ mdにあるがJSにないprops:", missingInJs.join(", "));
  }
  if (missingInMd.length > 0) {
    console.error("❌ JSにあるがmdにないprops:", missingInMd.join(", "));
  }
  process.exit(1);
}
