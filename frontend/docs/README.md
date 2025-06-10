# 🛟 避難所検索・災害可視化システム

## 📌 概要

本システムは、災害発生時に避難所の場所や混雑状況、災害危険区域（洪水・土砂災害等）を可視化し、地図・AR・通知を通じて迅速な避難を支援するWebアプリです。

- Google Maps + AR で視覚的に避難所情報を表示
- 管理者が地図上に災害区域を登録し、リアルタイムでユーザーに通知
- API連携により、外部システムやモバイルアプリにも展開可能

---

## 🚀 機能一覧（マイクロシステム単位）

| サービス名                          | 説明                                               |
| ----------------------------------- | -------------------------------------------------- |
| `EvacuationCenterManagementService` | 避難所の情報登録・更新・削除・混雑度・物資情報管理 |
| `RouteGuidanceService`              | 避難ルート表示、災害区域を避けたルート補正         |
| `DisasterZoneService`               | 管理者による危険区域の登録・GeoJSON処理            |
| `DisasterAlertService`              | 気象庁APIなどと連携し、災害通知・発火処理          |
| `EvacuationSearchService`           | ユーザー検索（市区町村・災害種別・距離）機能       |
| `AdminDashboardService`             | 管理者向けダッシュボード（登録・分析など）         |
| `CrowdAndSupplyStatusService`       | 混雑度・物資不足の可視化・共有機能                 |
| `ARVisualizationService`            | GPS + WebAR による避難所AR表示と誘導               |

---

## 🏗️ 技術スタック

| 分類           | 使用技術                                 |
| -------------- | ---------------------------------------- |
| フロントエンド | React (Vite) + Google Maps API + A-Frame |
| バックエンド   | Flask + Python3.11 + SQLite / PostgreSQL |
| AR技術         | AR.js + WebAR + GeoLocation              |
| インフラ       | Cloudflare Tunnel / Azure App Service    |
| データ         | GeoJSON / 国土地理院オープンデータ       |
| 外部API        | 気象庁API、Google Maps Directions API 等 |

---

## 🌐 起動方法

### フロントエンド

```bash
cd frontend
npm install
npm run dev
# ブラウザで http://localhost:3000 にアクセス

### バックエンド

cd backend
source ../venv/bin/activate
flask run --port=5001
# Swagger UI: http://localhost:5001/apidocs/

📂 ディレクトリ構成

evacuation_project/
├── frontend/              # Reactフロントエンド
│   ├── src/
│   ├── public/
│   ├── docs/              # すべての設計ドキュメント(.md)
│   └── index.html
├── backend/               # Flaskバックエンド
│   ├── routes.py
│   ├── models/
│   ├── services/
│   └── database.db
├── hazard_data/           # GeoJSON, XML変換済み災害データ
├── venv/                  # 仮想環境
├── .env                   # APIキー等の環境変数
└── README.md              # 本ファイル

🧪 テスト

フロントエンド：ブラウザ + モバイル(iOS Safari)で動作確認
バックエンド：Swagger UI / Postman / curl による検証
地図・AR表示・ルート誘導・災害通知 → 端末テスト済


📝 その他資料一覧

| ドキュメント名                     | 内容               |
| --------------------------- | ---------------- |
| `SYSTEM_ARCHITECTURE_V5.md` | システム全体の構成図と説明    |
| `SIMULATION_FLOW_V5.md`     | フローシミュレーションの手順と例 |
| `DEPLOYMENT_POLICY.md`      | デプロイ手順・CI/CD設計   |
| `ERROR_HISTORY.md`          | 過去のエラー記録と再発防止策   |
| `NAMING_POLICY_V5.md`       | 命名ルールの統一ポリシー     |
| `Microsystem_*.md`          | 各マイクロサービスの設計     |

📮 問い合わせ・開発参加

GitHub Issues をご利用ください。
https://github.com/ユーザー名/リポジトリ名/issues

このプロジェクトはオープンかつ災害対応支援を目的としています。


✅ ライセンス

MIT License

---

✅ `README.md` 完成しました。

次に進める候補は以下の通りです：

1. `USE_CASES.md`（代表ユースケースの一覧と流れ）
2. `SYSTEM_MONITORING_POLICY.md`（ログ、障害監視のポリシー）
3. `QA_CHECKLIST.md`（納品・運用時の品質確認リスト）

進めるものをご指定ください。すべて必要な場合は順番に進行します。

```
