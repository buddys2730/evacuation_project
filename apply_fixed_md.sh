#!/bin/bash

set -e

echo "📂 Step 1: docs フォルダにファイルを配置"

mv fixed_HazardPolygonRenderer.md ../frontend/docs/HazardPolygonRenderer.md
mv fixed_MapComponent.md ../frontend/docs/MapComponent.md
mv fixed_MD_COMPONENT_TEMPLATE.md ../frontend/docs/MD_COMPONENT_TEMPLATE.md
mv fixed_README.md ../frontend/docs/README.md
mv fixed_SearchForm.md ../frontend/docs/SearchForm.md
mv fixed_開発実行責任.md ../frontend/docs/開発実行責任.md

echo "📦 Step 2: Gitへコミット・プッシュ"
cd ../
git add frontend/docs/*.md
git commit -m "Fix: Markdown構文エラーの自動修正と検証通過対応"
git push origin main

echo "✅ 完了: Markdown自動修正ファイルを適用し、Gitへ反映しました"
