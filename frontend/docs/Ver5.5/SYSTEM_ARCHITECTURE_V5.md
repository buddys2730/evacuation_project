# SYSTEM_ARCHITECTURE_V5.md

## 🌐 全体構成概要

本システムは、災害発生・避難誘導に関するWebアプリケーションであり、以下の主要構成からなる：

- フロントエンド（React + Google Maps + WebAR）
- バックエンド（Flask + PostgreSQL）
- AI解析（災害予測 / 危険ルート検知）
- 外部連携API（気象庁、地図、災害情報）
- マイクロサービスによる分離開発

---

## 🧩 マイクロシステム一覧

| サービス名                          | 機能概要                             |
| ----------------------------------- | ------------------------------------ |
| `DisasterZoneService`               | GeoJSONで災害区域を管理・判定        |
| `DisasterAlertService`              | 緊急発令/通知・AIによる災害予測      |
| `EvacuationSearchService`           | 多条件検索（災害種別・地域・多言語） |
| `RouteGuidanceService`              | 現在地から避難所までの安全ルート案内 |
| `CrowdAndSupplyStatusService`       | 避難所の混雑度・物資情報の登録・表示 |
| `EvacuationCenterManagementService` | 避難所の新規登録・更新・削除         |
| `AdminDashboardService`             | 管理UIからの各種オペレーション管理   |

---

## 🗂 ディレクトリ構成（主要パス）

evacuation_project/
├── backend/
│ ├── routes/ ← 各マイクロサービスAPI
│ ├── database.py
│ └── models/
├── frontend/
│ ├── src/components/ ← 各React UIコンポーネント
│ ├── docs/ ← 設計ドキュメント（\*.md）
│ └── ARView.js / MapComponent.js など
├── sql_output/ ← 各種変換済みSQLデータ
├── hazard_data/ ← GeoJSON・災害区域元データ
└── README.md

---

## 🔗 各層の連携構成

```txt
[気象庁API] ┐
[地図API] ─┼──> [DisasterAlertService]──┐
             ↓                         ↓
        [DisasterZoneService]      [EvacuationSearchService]
                ↓                          ↓
      [RouteGuidanceService] <──> [EvacuationCenterManagementService]
                ↑                          ↓
        [CrowdAndSupplyStatusService]──→ UI (React, Map, AR)
                                          ↑
                        [AdminDashboardService] (操作/監視)
🧠 AI・自動処理の連携ポイント

モデル名	使用箇所	内容
RainfallAnalyzer	DisasterAlertService	降雨予測モデル（24-72h）
DangerRouteAnalyzer	RouteGuidanceService	危険地帯回避ルート判定
LanguageFilter	EvacuationSearchService	多言語・カテゴリ処理
📡 外部サービスとの接続

接続先	使用目的
気象庁API	災害警報・緊急速報の取得
Google Maps API	地図表示・ルートナビ・ポリゴン描画
OpenStreetMap	地形・洪水・高低差データ補完
Cloudflare Tunnel	MVP向け公開用トンネル構築
🧪 テスト・品質保証

各マイクロシステムに対してユニットテストおよび統合テスト
JSON構造・レスポンス仕様の自動検証
重要エンドポイントに対して毎日Ping監視とレスポンスタイム計測
📝 備考

V5構成にて、命名・ディレクトリ・データ構造・APIが完全統一済み
本ファイルは常に最新版のみを信頼ドキュメントとする
ERROR_HISTORY.md に過去トラブルと原因・対応記録を保持
```
