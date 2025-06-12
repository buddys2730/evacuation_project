const fs = require("fs");
const criticalFiles = [
  "frontend/src/components/MapComponent.js",
  "frontend/src/pages/ARView.js",
  "backend/services/search_service.py",
  "frontend/docs/DATA_FLOW_MAP_V5.md"
];

let allExist = true;
for (const file of criticalFiles) {
  if (!fs.existsSync(file)) {
    console.error(`ERROR: Missing critical file: ${file}`);
    allExist = false;
  }
}
if (!allExist) {
  process.exit(1);
}
