# 03. テスト仕様と自動テストコード

## 1. テスト概要

- 単体テスト（ユニットテスト）  
- 結合テスト  
- E2Eテスト（必要に応じて）  
- カバレッジ目標：最低70%以上

---

## 2. 単体テスト

- バックエンド：pytestを利用  
- フロントエンド：Jest + React Testing Libraryを利用  
- テスト対象：主要な関数、APIレスポンス処理、UIコンポーネント

---

## 3. 結合テスト

- バックエンドAPIの動作検証（Flaskのテストクライアント使用）  
- フロントエンドからAPIへの通信確認

---

## 4. 自動テスト実行方法

- ローカル実行方法（コマンド例）  
- CI環境（GitHub Actions）連携設定

---

## 5. テスト失敗時の対応フロー

- ローカルでの再現  
- 原因調査（ログ、スタックトレース確認）  
- 修正およびリグレッションチェック  
- PRレビューでのテストパス確認

---

## 6. テストコード例

### バックエンド（pytest）

```python
def test_example():
    response = client.get("/api/events")
    assert response.status_code == 200

### フロントエンド（Jest）

```javascript
test('renders search button', () => {
  render(<SearchForm />);
  expect(screen.getByText(/検索/i)).toBeInTheDocument();
});

