# ISSUE_TRACKING_EvacuationSearchService.md

## ✅【1】完了済み（このスレッドで対応完了）

| 番号 | 項目                         | ステータス                                    | 確認方法                                                         |
| ---- | ---------------------------- | --------------------------------------------- | ---------------------------------------------------------------- |
| ①    | `routes.py` の肥大化         | ✅ 分離完了                                   | `services/` 配下にファイルが分割されていることを確認             |
| ②    | Blueprint構成が未統一        | ✅ 修正済み                                   | `app.register_blueprint(...)` がすべてのサービスに適用されている |
| ③    | `.env` 明示読み込み          | ✅ 完了                                       | `load_dotenv(dotenv_path=...)` により明示指定済み                |
| ④    | 災害種別カラム分岐が曖昧     | ✅ 明示マップにより修正済                     | `disaster_column_map` による明示指定                             |
| ⑤    | Directions APIの交差判定     | ✅ 分岐ステップ単位で危険判定導入済           | 各stepに対し`ST_Intersects`による交差チェック済                  |
| ⑥    | hazardゾーン交差ロジック不在 | ✅ route_check / hazard_zone サービスで実装済 | `ST_DWithin`, `ST_Intersects` 実装済み                           |
| ⑦    | CORS設定の明示化             | ✅ FRONTEND_ORIGINで制御                      | `.env`, `CORS(app, origins=[...])` を使用中                      |

---

## ⚠️【2】未解決または要確認項目

| 番号 | 項目                                                 | 状況                                  | 確認方法                                                           |
| ---- | ---------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------ |
| ⑧    | 地震の場合に`designated_shelters`へ切替              | ⚠️ 要実装                             | `search_service.py`に分岐ロジックがあるか確認（未実装）            |
| ⑨    | DBテーブル名・カラム名が一致しているか               | ⚠️ 要確認                             | `\d`コマンドでDB実体とクエリの一致を確認                           |
| ⑩    | hazard_zones.categoryの整合性                        | ⚠️ データ未確認                       | `SELECT DISTINCT category FROM hazard_zones;` を実行し選択肢と照合 |
| ⑪    | route_safety_service.py のPostGIS関数名              | ⚠️ ST_GeogFromText vs ST_GeomFromText | 使用関数がエラー出していないかテスト                               |
| ⑫    | elevationカラムがDBに存在するか                      | ⚠️ 要確認                             | `\d emergency_shelters` で確認、無い場合は削除かNULL処理導入       |
| ⑬    | hazard列がNULLの避難所対応                           | ⚠️ 未処理                             | NULLの扱いを決定、UI側で「不明」と表示する等の処理                 |
| ⑭    | `/api/hazard_zones`と`/api/disaster_zones`の役割重複 | ⚠️ 要整理                             | 両方を叩き、レスポンスと用途を比較・設計に整理が必要               |
| ⑮    | Google Maps APIキーの有効性                          | ⚠️ 要検証                             | `.env`のキーが `REQUEST_DENIED` などを返していないか curl で確認   |

---

## 📌 次スレッドでの優先作業アクション一覧

| 優先度 | アクション                       | 対象                   | 説明                                                            |
| ------ | -------------------------------- | ---------------------- | --------------------------------------------------------------- |
| 🔴 高  | 地震時のテーブル切替ロジック実装 | search_service.py      | `disaster_type == "地震"` のときに `designated_shelters` を使用 |
| 🔴 高  | DBとの整合性再確認               | 全クエリ定義箇所       | スキーマとの差異を無くす                                        |
| 🟡 中  | hazard_zones category 整理       | hazard_zone_service    | DBとフロントのカテゴリ統一                                      |
| 🟡 中  | elevationのカラム処理            | search_service.py      | 欠損時の表示方法など検討                                        |
| 🟢 低  | Google API キーの環境チェック    | route_check_service.py | `.env` のキーが有効であることを curl 等で確認                   |

---

## ✅ 次スレッド引き継ぎ用プロンプト（コピペ可）
