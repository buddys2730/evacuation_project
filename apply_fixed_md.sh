#!/bin/bash

echo "📂 Step 1: docs フォルダにファイルを配置"

# fixed_ ファイルを元のファイル名に戻す
mv docs/fixed_HazardPolygonRenderer.md docs/HazardPolygonRenderer.md
mv docs/fixed_MD_COMPONENT_TEMPLATE.md docs/MD_COMPONENT_TEMPLATE.md
mv docs/fixed_MapComponent.md docs/MapComponent.md
mv docs/fixed_README.md docs/README.md
mv docs/fixed_SearchForm.md docs/SearchForm.md
mv docs/fixed_開発実行責任.md docs/開発実行責任.md

echo "📦 Step 2: Git に追加して commit & push"
git add docs/*.md
git commit -m "Fix: .md構文自動修正の反映"
git push origin main

echo "✅ 完了: .md 構文の修正を docs に反映しました"
