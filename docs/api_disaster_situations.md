# 災害状況管理API仕様書

本ドキュメントは災害状況ダッシュボード用APIの仕様をまとめたものです。

---

## 1. 災害状況一覧取得API

- **エンドポイント**: `GET /admin/disaster-situations`
- **パラメータ**:

  - `city`: 市区町村名 (例: 福山市)
  - `disaster_type`: 災害種別 (例: 洪水)
  - `danger_level`: 危険度 (例: 高)
  - `from`: 開始日 (例: 2025-06-01)
  - `to`: 終了日 (例: 2025-06-10)

- **レスポンス例**:
  ```json
  [
    {
      "id": 1,
      "disaster_type": "洪水",
      "danger_level": "高",
      "address_label": "松永町3丁目15番地辺り",
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
  ```

---

## 2. CSVエクスポートAPI

- **エンドポイント**: `GET /admin/disaster-situations/export`
- **パラメータ**: 上記と同じ
- **CSV例**:

  ```csv
  id,disaster_type,danger_level,address_label,occurred_at,cleared_at,comment,geometry
  1,洪水,高,松永町3丁目15番地辺り,2025-06-06T01:00:00,,道路冠水,"POLYGON((133.29 34.54,133.3 34.55,133.29 34.55,133.29 34.54))"
  ```

---

## 3. 市区町村リスト取得API

- **エンドポイント**: `GET /api/cities?pref=都道府県名`
- **レスポンス例**:
  ```json
  [{ "code": "34207", "name": "福山市" }]
  ```

---

## 4. 災害種別／危険度リスト

- クライアント側固定値、または別APIで取得

---

## 備考

- geometryはGeoJSON形式
- 認証・認可は管理者のみ
- 今後は予測・写真・IoT等拡張予定

---

_作成日: 2025-06-24_
