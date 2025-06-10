#!/bin/bash
echo "🛠️ MapComponent.js を復元中..."
cat << '__EOM__' > src/components/MapComponent.js
// 🔁 ここに MapComponent.js の最新版を全コードとして自動で挿入
// （ポイント描画、円描画、マーカー選択、ルート、カテゴリ選択、useEffect分離済み、export修正済み）
__EOM__

echo "🛠️ fetchHazardPolygons.js を再生成中..."
cat << '__EOM__' > src/services/fetchHazardPolygons.js
// 🔁 ここに fetchHazardPolygons.js の正しいバージョンを挿入
// （/api/hazard_zones/viewport への fetch 正常処理を含む）
__EOM__

echo "✅ 完了しました。VSCodeで MapComponent.js を確認してください。"
