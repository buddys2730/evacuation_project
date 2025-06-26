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
