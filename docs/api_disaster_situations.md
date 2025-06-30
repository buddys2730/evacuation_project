# 災害状況管理API設計

## 概要

災害状況ダッシュボード画面で使用する主なAPI設計と利用例。

---

## API一覧

### 1. 災害状況取得

`GET /admin/disaster-situations`

- **クエリパラメータ**
  - `city` … 市区町村名（例："福山市"）
  - `disaster_type` … 災害種別（例："洪水"）
  - `danger_level` … 危険度（例："高"）
  - `from` … 開始日（例："2025-06-01"）
  - `to` … 終了日（例："2025-06-10"）

- **レスポンスサンプル**

```json
[
  {
    "id": 1,
    "disaster_type": "土砂災害",
    "danger_level": "高",
    "address_label": "松永町3丁目15番地辺り",
    "area_label": "松永町3丁目～神村町付近",
    "occurred_at": "2025-06-06T01:00:00",
    "cleared_at": null,
    "comment": "崩落の危険あり",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [133.29, 34.54],
          [133.3, 34.55],
          [133.29, 34.55],
          [133.29, 34.54]
        ]
      ]
    }
  }
]

2. 災害状況CSVエクスポート
GET /admin/disaster-situations/export

クエリパラメータ：上記と同じ
CSV例
id,disaster_type,danger_level,address_label,occurred_at,cleared_at,comment,geometry
1,洪水,高,松永町3丁目15番地辺り,2025-06-06T01:00:00,,道路冠水,"POLYGON((133.29 34.54,133.3 34.55,133.29 34.55,133.29 34.54))"
3. 市区町村リスト取得
GET /api/cities?pref=都道府県名

レスポンス例:
[
  { "code": "34207", "name": "福山市" }
]
4. 災害種別/危険度リスト
クライアント固定、または必要に応じてAPI化可能
備考
レスポンスのgeometryはGeoJSONで統一
認証・認可は管理者のみ
今後、予測/写真/IoT等拡張予定
作成日: 2025-06-24
使い方

それぞれ docs/disaster_situation_dashboard.md
docs/api_disaster_situations.md などのファイル名で保存してください。
必要に応じて運用マニュアルやFAQも追加可能です。