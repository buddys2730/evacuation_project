# HazardPolygonRenderer

## 🧭 概要

- Google Maps 上に災害ポリゴン（危険区域）を表示するコンポーネント。

## 🔧 使用ファイル

- `src/components/map/HazardPolygonRenderer.js`

## 💡 props

| Prop名     | 型    | 説明                                                   |
| ---------- | ----- | ------------------------------------------------------ |
| `polygons` | Array | 各ポリゴンの座標配列（[ { lat, lng }, ... ] の配列群） |

## 🎨 表示仕様

- 赤色（#FF0000）の透明なポリゴン
- `fillOpacity: 0.3`, `strokeWeight: 2`, `clickable: false`

## 📌 制約事項

- `polygons` が未定義・非配列の場合は何も描画しない
- 座標形式は Google Maps API 準拠

## 🧪 テスト対象

- `props.polygons` に基づく描画確認
- APIから取得したポリゴンの正しい描画

---

## ✅ 契約条件

- 本ドキュメントは開発の一貫性・責任を担保するものであり、変更時は承認を必要とする。

## ✅ 設計遵守

- すべてのマイクロシステムはこの指針に従うこと。

## ✅ 変更記録

- 2025-06-11 作成：CI検証対応用の契約条件を追記（責任者: assistant）
