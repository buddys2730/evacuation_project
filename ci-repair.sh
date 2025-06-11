#!/bin/bash
set -e

echo "🔧 CI修復処理を開始..."

# CommonJSに対応するため eslint.config.js を .cjs にリネーム
echo "🔁 eslint.config.js → .cjs へ変換"
[ -f eslint.config.js ] && mv eslint.config.js eslint.config.cjs || echo "⚠️ eslint.config.js が存在しません"

# ESLintによる自動修正
echo "🛠 ESLint による自動修正を実行中..."
npx eslint . --fix || true

# Prettierでの整形
echo "🎨 Prettier によるコード整形を実行中..."
npx prettier --write . || true

# Gitに全ての変更をコミット＆プッシュ
echo "📤 Gitに変更をコミット中..."
git add .
git commit -m "Fix: ESLint config to CommonJS, auto-fix + Prettier format"
git push origin main

echo "✅ 修復完了！CIが再実行されます。"
