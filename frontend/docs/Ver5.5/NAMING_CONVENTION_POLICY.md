📘 NAMING_POLICY_V5.md（命名規則・揺れの統一）

🎯 目的
本プロジェクトにおけるAPI名・ファイル名・テーブル名・ドキュメント名の命名規則の揺れを防止し、システム間の連携とドキュメント整合性を確保するためのポリシー文書です。

📌 命名原則
項目 命名ルール 例
API名 /api/サービス名/機能名 /api/evacuation/search
テーブル名 複数形・アンダースコア区切り evacuation*centers
ドキュメント名 API_ENDPOINTS*サービス名.md or Microsystem*サービス名.md API_ENDPOINTS_RouteGuidanceService.md
マイクロサービス名 キャメルケース、末尾は Service EvacuationSearchService
Reactコンポーネント パスカルケース、.js 拡張子 MapComponent.js
変数名 キャメルケース selectedCenter
定数名 全大文字＋アンダースコア API_BASE_URL
🔄 命名揺れの例と修正
誤記 正式名称 対応
DisasterEventService DisasterAlertService 「イベント」ではなく「通知」概念に統一
CenterMgmtService EvacuationCenterManagementService 略称を廃止しフル命名に統一
SupplyStatusController CrowdAndSupplyStatusService サービス層に統合した設計に修正
MapManager.js MapComponent.js Reactコンポーネント命名規則に準拠
🔧 実施済み対応
全ファイル名のチェック：frontend/docs/, backend/services/
API定義の再検証：API_ENDPOINTS*\*.md 全件
コンポーネントとサービス名の正規化
V5のアーキテクチャ設計書との照合済み
