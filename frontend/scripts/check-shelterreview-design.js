import fs from "fs";
const MD_PATH = "./docs/ShelterReview.md";
const JS_PATH = "./src/components/ShelterReview.js";

// mdファイルからprops抽出
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
const lines = js.split("\n");

// propTypes= の行を発見
let propBlockStart = -1;
for (let i = 0; i < lines.length; i++) {
  if (/ShelterReview\.propTypes\s*=\s*{?/.test(lines[i])) {
    propBlockStart = i;
    break;
  }
}
if (propBlockStart === -1) {
  console.error("❌ ShelterReview.propTypes定義が見つかりません。");
  process.exit(1);
}

// その行以降で { から } までをpropsブロックとして抽出
let props = [];
let depth = 0;
let started = false;
for (let i = propBlockStart; i < lines.length; i++) {
  let line = lines[i];

  // 開始行で { がある場合
  if (!started && line.includes("{")) {
    started = true;
    depth = 1;
    // 開始行の後半も（{ foo: ... のケース）propsとして抽出
    const afterBrace = line.slice(line.indexOf("{") + 1);
    const m = afterBrace.match(/([a-zA-Z0-9_]+)\s*:/);
    if (m) props.push(m[1]);
    continue;
  }
  if (!started) continue;

  // 1階層目のプロパティ名
  if (depth === 1) {
    const m = line.match(/^\s*([a-zA-Z0-9_]+)\s*:/);
    if (m) props.push(m[1]);
  }

  // } のネスト管理
  for (const c of line) {
    if (c === "{") depth++;
    if (c === "}") depth--;
  }

  // depth=0でpropsブロック終了
  if (started && depth === 0) break;
}

// props名の重複を排除（念のため）
props = [...new Set(props)];

console.log("DEBUG propTypesProps:", props);

const missingInJs = mdProps.filter((p) => !props.includes(p));
const missingInMd = props.filter((p) => !mdProps.includes(p));
if (missingInJs.length === 0 && missingInMd.length === 0) {
  console.log("✅ ShelterReview.mdとコードのpropsが完全一致しました。");
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
