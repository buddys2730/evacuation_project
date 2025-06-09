# MapComponent コンポーネント定義書

## 📌 コンポーネントの目的
Google Map 上に以下の情報を可視化する：
- 検索結果（避難所）ポイント
- 現在地
- 検索範囲円（半径）
- 避難経路
- ハザードポリゴン（カテゴリ別）
- 災害ポリゴン（リアルタイム災害情報）

## 📂 配置パス
`frontend/src/components/MapComponent.js`

## 📥 入力 Props

| プロパティ名          | 型        | 必須 | 説明                                                   |
|----------------------|-----------|------|--------------------------------------------------------|
| `points`             | Array     | ✅   | 検索結果の避難所情報                                   |
| `selectedId`         | String    | ❌   | 選択中の避難所ID                                        |
| `route`              | Object    | ❌   | ルート情報（出発地・目的地・安全判定）                  |
| `radiusKm`           | Number    | ✅   | 検索範囲の半径（km）                                    |
| `setRadiusKm`        | Function  | ✅   | 半径変更関数（スライダーなどと連動）                    |
| `setRoute`           | Function  | ✅   | 外部からルートを更新する関数                            |
| `onRouteClick`       | Function  | ✅   | 経路ボタンクリック時の処理                              |
| `hazardDisplayMode`  | String    | ✅   | 表示切替モード ("off" / "hazard" / "disaster")         |
| `searchParams`       | Object    | ✅   | 検索条件（中心位置など）                                |
| `selectedCategories` | Array     | ✅   | 表示対象のハザードカテゴリ（複数選択）                  |

## 📤 出力内容
- Google Maps にマーカー・ルート・ポリゴンを描画
- `RouteService.js`, `fetchHazardPolygons.js` を内部で呼び出し

## 🔗 依存関係

| ファイル名                     | 用途                       |
|------------------------------|----------------------------|
| `UserMarker.js`              | 現在地の描画               |
| `SearchResultMarkers.js`     | 検索結果マーカーの描画     |
| `RouteRenderer.js`           | 経路表示（ルートライン）   |
| `HazardPolygonRenderer.js`   | ハザードマップポリゴン     |
| `fetchHazardPolygons.js`     | ハザードポリゴン取得API    |

## 🔁 呼び出し元
- `App.js`

## ✅ 開発契約チェック項目

- [x] `points` には正しい緯度・経度情報が含まれているか？
- [x] `radiusKm` の変更が即時反映されるか？
- [x] `hazardDisplayMode` 切替時に再描画されるか？
- [x] `selectedCategories` に応じて正しくフィルタリングされているか？
- [x] ルートクリック後に `setRoute()` が正常動作するか？

## 🚨 違反禁止事項（契約）
- Google Map オブジェクトに props 以外の外部依存変数を渡してはならない
- ポリゴン描画において、カテゴリのフィルタリングを省略してはならない
- 地図初期化に失敗した際、例外を握り潰してはならない
