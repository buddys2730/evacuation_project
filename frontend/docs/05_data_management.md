# 05. データ管理・運用設計

## 1. 大容量データ管理

- データはGit管理外とし、専用ストレージを使用  
  - 例: Azure Blob Storage、AWS S3など  
- バックアップは定期的に自動取得  
- アクセス権限は最小限に設定しセキュリティ確保

---

## 2. バックアップ・リストア

- バックアップスケジュールを週次・日次で設定  
- バックアップデータは複数拠点に保存  
- リストア手順をドキュメント化し定期的に訓練

---

## 3. データ更新とバージョニング

- データ更新はトランザクション管理下で実施  
- バージョニングシステムを導入し履歴管理  
- 重要データは変更ログを必ず記録・保存

---

## 4. データ品質管理

- 定期的なデータ検証と不整合チェック  
- データ入力時のバリデーション強化  
- 不整合検知時は即時通知と修正対応

---

## 5. アクセス管理

- ロールベースのアクセス制御（RBAC）を採用  
- データアクセスはログ取得・監査可能に  
- APIキー・トークン管理を厳格に実施

### PostgreSQLの場合のセットアップ例

#### 1. データベース作成

```sql
CREATE DATABASE evacuation_db;

#### 2. 環境変数設定（.env）

```env
DATABASE_URL=postgresql://{ユーザー名}:{パスワード}@localhost:5432/evacuation_db

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/evacuation_db

#### 3. Flaskアプリでの接続例（SQLAlchemy利用時）

```python
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
db = SQLAlchemy(app)

#### 4. マイグレーションの実行例

```bash
flask db upgrade

