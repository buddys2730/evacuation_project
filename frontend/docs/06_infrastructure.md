# 06. インフラ構成・環境情報

## 1. 本番／ステージング環境構成

- **本番環境**  
  - Webサーバー：Azure App Service または Azure VM  
  - DB：Azure PostgreSQL  
  - CDN：Azure Front Door  
  - ロードバランサー：Azure Load Balancer  

- **ステージング環境**  
  - 本番のミラーリング  
  - 独立環境で安全に動作確認可能  

---

## 2. 外部連携API仕様と鍵管理

- APIキーやシークレットはAzure Key Vault等で安全管理  
- キーのローテーションを定期的に実施  
- 外部APIアクセスはTLS必須、IP制限を推奨

---

## 3. ロギング・モニタリング

- ログ収集：Azure Monitor、Application Insights  
- アラート設定：異常発生時にSlackやメール通知  
- パフォーマンス監視：CPU、メモリ、レスポンスタイム監視  

---

## 4. セキュリティ対策

- OS、ミドルウェアは常に最新のセキュリティパッチ適用  
- WAF（Web Application Firewall）導入  
- 定期的な脆弱性スキャンとペネトレーションテスト

---

## 5. CI/CD環境

- GitHub Actionsを利用したビルド・デプロイ自動化  
- ステージング環境へのプルリクエストマージ時自動デプロイ  
- 本番環境へのデプロイは承認フローを経由

