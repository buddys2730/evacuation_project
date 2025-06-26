# 避難所管理システム DB設計（2025-06-22棚卸し版）

---

## 主要テーブル一覧

### 1. designated_shelters（指定避難所）
| カラム名             | 型                   | 備考            |
|---------------------|----------------------|-----------------|
| id                  | character varying    | PK              |
| name                | character varying    |                 |
| address             | character varying    |                 |
| latitude            | double precision     |                 |
| longitude           | double precision     |                 |
| elevation           | double precision     |                 |
| target              | character varying    |                 |
| city                | character varying    |                 |
| pref                | character varying    |                 |
| normalized_target   | character varying    |                 |
| ward                | character varying    |                 |
| town                | character varying    |                 |
| chome_block         | character varying    |                 |
| target_category     | character varying    |                 |
| romanized_name      | character varying    |                 |

---

### 2. crowd_statuses（避難所混雑度）
| カラム名      | 型                   | 備考              |
|---------------|----------------------|-------------------|
| id            | integer              | PK                |
| shelter_id    | character varying    | designated_shelters.id への参照  |
| crowd_level   | character varying    | 「不明」「混雑」「満員」など |
| updated_at    | timestamp            |                   |

---

### 3. shelter_supplies（指定避難所物資：ID整数）
| カラム名      | 型                   | 備考          |
|---------------|----------------------|---------------|
| id            | integer              | PK            |
| shelter_id    | integer              | designated_shelters.idとJOIN時はCASTが必要 |
| item_name     | character varying    |               |
| quantity      | integer              |               |
| updated_at    | timestamp            |               |

---

### 4. supply_items（物資マスタ）
| カラム名      | 型                   | 備考      |
|---------------|----------------------|-----------|
| id            | integer              | PK        |
| item_name     | character varying    |           |
| description   | text                 |           |

---

### 5. emergency_shelters（緊急避難所）
| カラム名      | 型                   | 備考    |
|---------------|----------------------|---------|
| id            | character varying    | PK      |
| name          | character varying    |         |
| address       | character varying    |         |
| latitude      | double precision     |         |
| longitude     | double precision     |         |
| elevation     | double precision     |         |
| hazard_flood        | boolean         |         |
| hazard_landslide    | boolean         |         |
| hazard_storm_surge  | boolean         |         |
| hazard_earthquake   | boolean         |         |
| hazard_tsunami      | boolean         |         |
| hazard_fire         | boolean         |         |
| hazard_inland_flood | boolean         |         |
| hazard_volcano      | boolean         |         |
| city                | character varying |
| pref                | character varying |
| ward                | character varying |
| town                | character varying |
| chome_block         | character varying |
| romanized_name      | character varying |

---

### 6. supplies（緊急避難所物資：ID文字列）
| カラム名      | 型                   | 備考      |
|---------------|----------------------|-----------|
| id            | integer              | PK        |
| shelter_id    | character varying    | emergency_shelters.id への参照 |
| item_name     | character varying    |           |
| quantity      | integer              |           |
| updated_at    | timestamp            |           |

---

# disaster_situations テーブル設計（2025-06-22追加）

---

## 用途
動的な災害状況（浸水、通行止め、土砂災害等）の発生範囲・属性を管理し、ルート案内等リアルタイム連携を実現する。

---

## カラム定義

| カラム名        | 型                   | 備考                                           |
|-----------------|----------------------|------------------------------------------------|
| id              | SERIAL               | PK                                             |
| disaster_type   | character varying    | 災害種別（浸水／通行止め／土砂／崖崩れ等）    |
| danger_level    | character varying    | 危険度（例：低／中／高／数値可）               |
| depth_m         | double precision     | 浸水深さ（単位：m、浸水時のみ。NULL可）        |
| is_closed       | boolean              | 通行止め判定（道路災害時：true/false、NULL可） |
| geometry        | geometry             | 範囲情報（Point／LineString／Polygon対応）     |
| occurred_at     | timestamp            | 発生日                                         |
| cleared_at      | timestamp            | 解除日                                         |
| comment         | text                 | 管理者コメント                                 |
| image_url       | text                 | 現場写真URL                                    |
| created_at      | timestamp            | レコード登録日時                               |
| updated_at      | timestamp            | レコード更新日時                               |

---

## リレーション・設計方針

- geometry型はPostGIS拡張を利用（既存スキーマに準拠）
- 静的ハザード（hazard_zones）と明確に区別し、**現在進行形の災害情報のみ格納**
- ルート案内では**geometryに該当する道路・避難経路を「危険」「通行止め」として判定**  
  浸水depth_mも「深さ閾値」に応じて危険判定パラメータとする
- 対象災害種別、danger_level等は必要に応じ拡張可

---

## 追加・運用時の注意

- 設計書（.md）、マイグレーション、モデル・APIを**必ず同期**
- 設計追加時はこの.mdを改定履歴として利用
- 型の不一致、運用ルール逸脱はNG

---

（追加日：2025-06-22　設計責任：ChatGPTアシスタント）


---

## その他テーブル
- crowd_statuses, center_congestion など、混雑度や物資の「種類」によって別管理あり。
- 各テーブルのカラム・型は `information_schema.columns` の内容と完全一致。

---

## 【注意・ルール】
- カラム追加・除去は必ずDBスキーマに合わせて設計書・モデル修正を行う。
- JOINの際は型の違いに注意！（特に `shelter_id` 型差異）
- 画面やAPI設計も**この設計書**を第一根拠とする。

---

