🎯 目的

市区町村名と災害種別をもとに、対応する緊急避難所（emergency_shelters）を検索し、
その結果をフロントエンドで地図（Google Maps）表示・AR表示するための最小システム。

🧱 DB定義（emergency_shelters）

emergency_shelters

🔸 カラム構造：
| カラム名 | 型 | 説明 |
| --------------------- | ------------------ | ------ |
| `id` | `VARCHAR` | 避難所ID |
| `name` | `VARCHAR` | 避難所名 |
| `address` | `VARCHAR` | 所在地 |
| `latitude` | `DOUBLE PRECISION` | 緯度 |
| `longitude` | `DOUBLE PRECISION` | 経度 |
| `elevation` | `DOUBLE PRECISION` | 標高 |
| `hazard_flood` | `BOOLEAN` | 洪水対応 |
| `hazard_landslide` | `BOOLEAN` | 土砂災害対応 |
| `hazard_storm_surge` | `BOOLEAN` | 高潮対応 |
| `hazard_earthquake` | `BOOLEAN` | 地震対応 |
| `hazard_tsunami` | `BOOLEAN` | 津波対応 |
| `hazard_fire` | `BOOLEAN` | 火災対応 |
| `hazard_inland_flood` | `BOOLEAN` | 内水氾濫対応 |
| `hazard_volcano` | `BOOLEAN` | 火山対応 |
| `city` | `VARCHAR` | 市区町村名 |
| `pref` | `VARCHAR` | 都道府県名 |

🌐 API設計

🔸 エンドポイント：

GET /api/search?city=那覇市&disaster_type=flood

🔸 パラメータ仕様：

| パラメータ名    | 説明                                               | 必須 |
| --------------- | -------------------------------------------------- | ---- |
| `city`          | 市区町村名（部分一致可）                           | ✅   |
| `disaster_type` | 対応災害種別。例: `flood`, `tsunami`, `earthquake` | ✅   |

※ disaster*type は hazard* プレフィックスを内部で付加して検索。

🔸 実行SQL（Flask側）：

SELECT id, name, address, latitude, longitude, elevation
FROM emergency*shelters
WHERE city ILIKE %s
AND hazard*%s = TRUE

🔸 返却JSON形式：

{
"results": [
{
"id": "E4720100101201",
"name": "小禄中学校（運動場）",
"address": "沖縄県那覇市宇栄原2-23-1",
"latitude": 26.189014,
"longitude": 127.667465,
"elevation": 35.88
}
]
}

🗺 UI（MapComponent.js）連携仕様

🔸 表示項目
避難所名
住所
ピン位置：緯度・経度
高さ（標高）→ InfoWindowに任意表示
🔸 必要処理
検索フォームからAPIリクエスト（GET）
結果に応じてGoogle Mapsにマーカー配置
結果ゼロの場合は「該当する避難所が見つかりません」と表示
📥 データ投入（PostgreSQL）

🔸 インポートコマンド例：

psql -U masashitakao -d evacuation_db -f evacuation_project/emergency_shelters_before_restore.sql

データ構造と災害種別はすでに含まれており、災害フィルタに完全対応。

🧪 テスト仕様

✅ curl例：

curl -G http://127.0.0.1:5001/api/search \
 --data-urlencode "city=那覇市" \
 --data-urlencode "disaster_type=flood"

✅ テスト項目

| テスト内容        | 期待結果            |
| ----------------- | ------------------- |
| 該当あり          | `results` に1件以上 |
| 該当なし          | `results: []`       |
| disaster_type不正 | 400エラー           |
| city未指定        | 400エラー           |

🔄 拡張への接続（将来）

| 機能             | 接続先                                 |
| ---------------- | -------------------------------------- |
| 安全なルート案内 | `RouteGuidanceSystem.md`（次フェーズ） |
| AR表示画面       | `ARView.js` + `evacuation_ar.html`     |
| 混雑度連携       | `CrowdAndSupplyStatusService.md`       |

✅ この.mdが保持するもの

データ構造
実装対象
テスト仕様
拡張点
元データの保存場所
これがすべてであり、以後この.mdのみを信頼して設計・実装・レビューを行います。
