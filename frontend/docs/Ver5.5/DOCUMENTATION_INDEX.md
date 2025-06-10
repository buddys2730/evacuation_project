# 📚 Documentation Index: 避難所案内システム マイクロサービス設計ドキュメント一覧

本ドキュメントは、避難所案内システムにおける **全マイクロサービスの設計資料** を統括するインデックスです。  
各ファイルは個別に構成されており、アジャイル開発・拡張性・連携性を重視した構成となっています。

---

## 🧭 サービス分類一覧

### 🔑 ユーザー・管理者認証系

| サービス名         | 概要                                       | ドキュメント                        |
| ------------------ | ------------------------------------------ | ----------------------------------- |
| UserProfileService | 一般ユーザーの設定（言語・位置・通知）管理 | `Microsystem_UserProfileService.md` |
| AdminAuthService   | 管理者ログイン認証・JWTトークン発行        | `Microsystem_AdminAuthService.md`   |

---

### 📊 管理者操作系

| サービス名             | 概要                             | ドキュメント                            |
| ---------------------- | -------------------------------- | --------------------------------------- |
| AdminDashboardService  | 混雑・物資・災害情報の一括操作UI | `Microsystem_AdminDashboardService.md`  |
| CongestionService      | 混雑度情報の登録・表示・履歴管理 | `Microsystem_CongestionService.md`      |
| ResourceRequestService | 避難所の物資要求の登録・表示     | `Microsystem_ResourceRequestService.md` |

---

### 🛰 情報配信・通知系

| サービス名          | 概要                                         | ドキュメント                         |
| ------------------- | -------------------------------------------- | ------------------------------------ |
| NotificationService | 管理者登録情報の通知配信（多言語・範囲対応） | `Microsystem_NotificationService.md` |

---

### 🗺 情報表示・AR連携系

| サービス名        | 概要                                           | ドキュメント                       |
| ----------------- | ---------------------------------------------- | ---------------------------------- |
| MapDisplayService | 地図・マップUIに避難所・災害情報・AR誘導を表示 | `Microsystem_MapDisplayService.md` |
| HazardZoneService | 洪水・土砂・津波などの危険区域（GeoJSON）描画  | `Microsystem_HazardZoneService.md` |

---

## 🔗 API仕様定義一覧

| ドキュメント名                           | 対応サービス          | 説明                             |
| ---------------------------------------- | --------------------- | -------------------------------- |
| `API_ENDPOINTS_UserProfileService.md`    | UserProfileService    | 管理者向けエンドポイントのみ定義 |
| `API_ENDPOINTS_AdminDashboardService.md` | AdminDashboardService | 混雑・物資・災害管理のAPI一覧    |

---

## 🧱 マイクロサービス設計思想（共通）

- **スケーラブルな構成**：各機能をマイクロサービスとして分離、独立開発と横断的連携が可能
- **JWT認証によるセキュリティ確保**：管理者操作には必ずトークン認証を導入
- **言語・地域・ユーザー区分を考慮した表示**：マルチ言語／自治体単位での管理が可能
- **AR連携を前提とした構成**：避難所マーカーや危険エリアにAR誘導を実装しやすい構造

---

## 📌 ファイル一覧（パス構成）

/frontend/docs/
├── DOCUMENTATION_INDEX.md
├── Microsystem_UserProfileService.md
├── Microsystem_AdminAuthService.md
├── Microsystem_AdminDashboardService.md
├── Microsystem_NotificationService.md
├── Microsystem_MapDisplayService.md
├── Microsystem_CongestionService.md
├── Microsystem_ResourceRequestService.md
├── Microsystem_HazardZoneService.md
├── API_ENDPOINTS_UserProfileService.md
└── API_ENDPOINTS_AdminDashboardService.md

---

## 🔜 今後の拡張予定（別ドキュメント化候補）

| 予定サービス名    | 説明                                                        |
| ----------------- | ----------------------------------------------------------- |
| RoutingService    | 危険エリアを避ける避難経路の提示（Polyline + hazard check） |
| ARRenderService   | WebAR用に避難所の方向・吹き出し・矢印などを描画             |
| EvaluationService | 避難所評価（清潔さ・混雑・安全性など）の収集と可視化        |
| AnalyticsService  | 管理者向けの分析用ダッシュボード（混雑推移・通知効果など）  |

---
