import fs from "fs";
const MD_PATH = "./docs/SearchResultMarkers.md";
const JS_PATH = "./src/components/map/SearchResultMarkers.js";
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
const propsArgsMatch = js.match(/SearchResultMarkers\s*=\s*\(\s*{([^}]*)}/s);
const jsProps = propsArgsMatch
  ? propsArgsMatch[1]
      .split(",")
      .map((s) => s.replace(/=.*$/, "").trim())
      .filter(Boolean)
  : [];
const propTypesMatch = js.match(
  /SearchResultMarkers\.propTypes\s*=\s*{([^}]*)}/s,
);
const propTypesProps = propTypesMatch
  ? propTypesMatch[1]
      .split(",")
      .map((s) => s.split(":")[0].replace(/\/.*$/, "").trim())
      .filter(Boolean)
  : [];
const allJsProps = Array.from(new Set([...jsProps, ...propTypesProps])).filter(
  Boolean,
);

const missingInJs = mdProps.filter((p) => !allJsProps.includes(p));
const missingInMd = allJsProps.filter((p) => !mdProps.includes(p));

if (missingInJs.length === 0 && missingInMd.length === 0) {
  console.log("✅ SearchResultMarkers.mdとコードのpropsが完全一致しました。");
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
