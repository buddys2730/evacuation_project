# 02. API仕様の詳細ドキュメント（拡張版）

## 1. 概要

本ドキュメントはAPIの全仕様を詳細にまとめたものです。  
CRUD操作全般の仕様、認証・認可、エラーコード、レスポンス例を含みます。

---

## 2. 認証・認可

- 管理者APIはBearerトークン認証を採用。  
- リクエストヘッダー例：  


---

## 3. API一覧

| メソッド | エンドポイント          | 説明                 | 認証要否 |
| -------- | ---------------------- | -------------------- | -------- |
| GET      | /api/events            | イベント一覧取得     | 不要     |
| GET      | /api/events/{id}       | イベント詳細取得     | 不要     |
| POST     | /api/events            | イベント登録         | 必須     |
| PUT      | /api/events/{id}       | イベント更新         | 必須     |
| DELETE   | /api/events/{id}       | イベント削除         | 必須     |
| POST     | /api/auth/login        | ログイン             | 不要     |

---

## 4. リクエスト・レスポンス詳細

### 4-1. GET /api/events

- **説明**: イベント一覧取得  
- **パラメータ**:  

| 名前       | 種類   | 必須 | 説明                         | 形式・制約          |
| ---------- | ------ | ---- | ---------------------------- | ------------------- |
| category   | query  | 任意 | イベントカテゴリでフィルタ   | Enum: music, sale 等 |
| start_date | query  | 任意 | 開始日時(検索範囲の開始)     | ISO8601例: 2025-06-01T00:00:00Z |
| end_date   | query  | 任意 | 終了日時(検索範囲の終了)     | ISO8601例: 2025-06-30T23:59:59Z |

- **レスポンス例**:

```json
[
{
  "id": "123",
  "title": "音楽フェス2025",
  "category": "music",
  "start_date": "2025-06-15T10:00:00Z",
  "end_date": "2025-06-15T20:00:00Z",
  "location": {
    "address": "東京都渋谷区...",
    "latitude": 35.658034,
    "longitude": 139.701636
  }
}
]

### 4-2. POST /api/events

- **説明**: イベント登録  
- **認証**: 必須（Bearerトークン）  
- **リクエストボディ**:

```json
{
  "title": "新規イベント",
  "category": "sale",
  "start_date": "2025-07-01T09:00:00Z",
  "end_date": "2025-07-01T18:00:00Z",
  "location": {
    "address": "大阪府大阪市...",
    "latitude": 34.693738,
    "longitude": 135.502165
  },
  "description": "イベント詳細説明"
}

## 5. エラーコード一覧

| ステータスコード | 意味                  | 説明                         |
| ---------------- | --------------------- | ---------------------------- |
| 200              | OK                    | 正常処理完了                 |
| 201              | Created               | リソース作成成功             |
| 400              | Bad Request           | パラメータ不正など           |
| 401              | Unauthorized          | 認証エラー                   |
| 403              | Forbidden             | 権限不足                     |
| 404              | Not Found             | 該当リソースなし             |
| 500              | Internal Server Error  | サーバー側エラー             |

- **エラー応答例（400）**:

```json
{
  "error": "InvalidParameter",
  "message": "start_date must be earlier than end_date"
}

## 6. 認証トークン発行API

### POST /api/auth/login

- **説明**: ログインしてアクセストークンを取得  
- **リクエストボディ**:

```json
{
  "username": "admin",
  "password": "password123"
}

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# 付録

- 日付フォーマットはISO8601（UTC推奨）  
- Enum値はAPIドキュメント別途最新版を参照ください  
