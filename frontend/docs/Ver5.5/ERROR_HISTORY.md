# ERROR_HISTORY.md

## 🧯 システムエラー履歴・原因と対処まとめ

このドキュメントは、過去に発生したすべてのシステムエラーの原因・影響範囲・修正内容・再発防止策を記録するものである。

---

### 📅 ErrorLog#001：APIルート未発火

- **発生日**：2025/03/21
- **対象機能**：避難所検索フォーム → Flask API
- **原因**：Reactフロントエンドで使用されていた `API_BASE_URL` のURL形式が `https://` で統一されておらず、HTTPS通信中にCORSエラーが発生
- **対処**：
  - `config.js` の `API_BASE_URL` を常にHTTPSのCloudflare Tunnelに同期
  - `update_config.sh` による自動更新スクリプトを追加
- **再発防止**：
  - `API_ENDPOINTS.md` をHTTPS前提で統一
  - 通信前テストモジュールを自動実行に追加

---

### 📅 ErrorLog#002：地図表示遅延とマーカー未生成

- **発生日**：2025/05/21
- **対象機能**：MapComponent.js（Google Maps表示）
- **原因**：
  - ポリゴン読み込み時のタイミングが `mapInstance.current` 初期化前に発火していた
  - ポリゴンが1000以上ある県に対して描画スレッドが同期されず遅延が発生
- **対処**：
  - `mapInstance.current` が初期化完了後にのみ描画を行う `useEffect` を実装
  - ポリゴン描画時の処理を `requestIdleCallback` に変更
- **再発防止**：
  - `MapComponent.js` 内のタイミング管理を構造化
  - ポリゴン読み込みの逐次処理テストを導入

---

### 📅 ErrorLog#003：AR表示がルートと連携しない

- **発生日**：2025/05/24
- **対象機能**：ARView.js / evacuation_ar.html
- **原因**：
  - 選択された避難所情報が `navigate("/ar", { state: item })` で正しく渡っていなかった
  - ARページ内でルートAPIとの連携処理が未実装
- **対処**：
  - `ARView.js` で `useLocation().state` から避難所情報を正しく取得するよう修正
  - `evacuation_ar.html` からバックエンドルートAPIへクエリを送信するよう追加
- **再発防止**：
  - React Router v6 での状態遷移方法をマニュアルに記録
  - ARとの連携部分のユニットテストを設計

---

### 📅 ErrorLog#004：APIがHTMLを返却しJSONにならない

- **発生日**：2025/03/22
- **対象機能**：Flask APIエンドポイント `/api/search`
- **原因**：
  - `@app.route("/")` が未設定のまま通信されたため、ngrokがルートに対して404 HTMLレスポンスを返却
- **対処**：
  - 明示的に `@app.route("/") → return JSON(status="ok")` を追加
- **再発防止**：
  - 未定義エンドポイントアクセス時の挙動を明文化
  - ルート定義ミスをCIでチェック

---

### 📅 ErrorLog#005：ドキュメント構造とファイル名の重複

- **発生日**：2025/05/28
- **対象機能**：ドキュメント管理（Markdown）
- **原因**：
  - `API_ENDPOINTS_*.md` 系ファイルで命名重複が複数回発生し、構成設計が不明瞭に
- **対処**：
  - ファイル命名を以下のルールで統一：
    - `Microsystem_*.md`：マイクロシステム設計
    - `API_ENDPOINTS_*.md`：API定義
    - `TABLE_SCHEMA_*.md`：DB構造
  - すべてのドキュメントに `V5` 構成印を明記
- **再発防止**：
  - ドキュメント登録時に `auto_indexer.sh` で一意性チェックを行う運用を開始

---

## ✅ 再発防止策まとめ

- ファイル命名とパス構造のルール化（V5で統一）
- CI/CDによるAPI未定義チェック（エンドポイント監視）
- mapInstanceやstate遷移など非同期変数の初期化確認チェック
- Cloudflare Tunnelやngrok使用時はHTTPS統一前提でテスト実施
- すべての機能においてドキュメント先行と実装後の相互整合確認プロセスを導入

---

# ERROR_HISTORY.md

## 🚨 エラー履歴と対策（V5開発フェーズまで）

本ファイルでは、開発中に発生した重大なトラブル・設計ミス・処理不備・命名揺れ等について記録し、それに対する修正方針・対応履歴・教訓を整理する。

---

### 🟥 1. 機能設計漏れ

| 発生日     | 概要                                                   | 対応                                                              | 教訓                                                  |
| ---------- | ------------------------------------------------------ | ----------------------------------------------------------------- | ----------------------------------------------------- |
| 2025/05/26 | 混雑度・物資登録APIが設計に反映されていなかった        | CrowdAndSupplyStatusService を新設しAPIとDB設計を統合             | 初期段階でマイクロ機能単位の一覧抽出が必要            |
| 2025/05/27 | 災害イベントと通知システムの混同により、APIが重複/不足 | 命名変更と役割の分離（DisasterAlertService, DisasterZoneService） | 命名と責務を分離した構成設計が必要                    |
| 2025/05/28 | 地図上の洪水領域登録機能が設計から漏れていた           | GeoJSON管理機能（DisasterZoneService）をAPIとして追加             | 管理者向けUI/UXの設計を並行して設計に含める必要がある |

---

### 🟨 2. ドキュメント重複/不整合

| 発生日     | 概要                                  | 対応                                             | 教訓                                   |
| ---------- | ------------------------------------- | ------------------------------------------------ | -------------------------------------- |
| 2025/05/27 | API_ENDPOINTS\_\*.md が複数重複生成   | ファイルの命名規則と重複チェックポリシー策定     | 命名規則と生成履歴の集中管理が必要     |
| 2025/05/28 | SYSTEM_ARCHITECTURE.md が複数世代存在 | V5として明示し、古いバージョンを別フォルダに分離 | バージョン明示と世代管理ポリシーが必要 |

---

### 🟦 3. 技術的障害・エラー

| 発生日     | 概要                                      | 対応                                           | 教訓                                           |
| ---------- | ----------------------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| 2025/05/25 | GeoJSON描画が一部ポリゴン種別で遅延・欠落 | 非同期描画方式＋ポリゴン種別別の読み込み順制御 | 大容量データの非同期処理設計が初期から必要     |
| 2025/05/23 | Reactマップでマーカークリック時にnull参照 | state初期値確認とnullガード追加                | UIバグ回避のためのクリックテスト項目追加が必要 |

---

### 🟩 4. 組織的/開発体制的な問題

| 発生日     | 概要                                                   | 対応                                                 | 教訓                                           |
| ---------- | ------------------------------------------------------ | ---------------------------------------------------- | ---------------------------------------------- |
| 2025/05/26 | 設計とコード出力の順序が逆転し、構成の整合性に問題発生 | アーキテクチャ→マイクロシステム→API→実装の順に厳密化 | 出力順序とドキュメント整合性のガイドライン策定 |
| 2025/05/27 | 開発スレッド内での重複出力・混乱発生                   | 全出力ドキュメントを定期的に一覧・照合・記録         | スレッド管理・出力履歴台帳の自動生成が必要     |

| No  | 発生日     | 内容                                          | 原因                                   | 影響範囲                | 対策                                                                 |
| --- | ---------- | --------------------------------------------- | -------------------------------------- | ----------------------- | -------------------------------------------------------------------- |
| 1   | 2025-05-23 | ポリゴン表示不具合（表示遅延・重複）          | GeoJSON処理の非同期処理ミス            | MapComponent / 地図描画 | 表示ロジックをasync/awaitで統一。読み込み時にIDで重複排除            |
| 2   | 2025-05-21 | マーカークリック時にルート描画されない        | directionsServiceの未初期化            | ルート案内              | useEffectのタイミング調整、`mapInstance.current`の初期化順序を明示化 |
| 3   | 2025-05-22 | AR画面に選択情報が反映されない                | `navigate("/ar", { state })`の渡し忘れ | ARView\.js              | `state`のnullチェック追加、ルート設定強化                            |
| 4   | 2025-05-25 | `/api/search`にリクエストしても空白レスポンス | FlaskのCORSミス／Content-Type不一致    | 全通信                  | CORSヘッダ設定、`application/json`統一、トンネル設定見直し           |
| 5   | 2025-05-26 | 同名ドキュメント重複出力                      | 命名ポリシー不統一                     | 設計ドキュメント        | `NAMING_POLICY_V5.md`制定、作成前にスレッドとファイル照合義務化      |

📌 再発防止ポリシー
ファイル作成前のスレッドスキャン義務化
設計→実装→シミュレーションの順序厳守
重要API/マイクロシステムには"使用ユースケース"記述を必須
各コンポーネントの責務をマイクロ単位で分離
AI/ARなど非同期機能の依存順序を事前にドキュメント化
✅ 対応完了済み事項
マーカーとルート案内の連携確認（RouteGuidanceService修正）
ARView.jsとMapComponent.jsの状態管理同期
APIエンドポイントの設計揺れ排除 (API*ENDPOINTS*\*.md)
Reactルーターの二重定義の除去（index.js）

| 内容                     | 状況                       | 担当            |
| ------------------------ | -------------------------- | --------------- |
| 混雑度・物資情報の登録UI | 管理画面との役割分担検討中 | フロント        |
| AR誘導での3Dルート表示   | WebAR.js連携進行中         | フロント／Unity |

---

## ✅ 今後の改善方針

- ドキュメント出力台帳の自動生成
- 全マイクロサービスとAPIの照合マトリクス作成
- 命名規則チェックの自動化スクリプト導入
- システム動作シミュレーションの標準フロー化

---

（完）
