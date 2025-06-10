#!/bin/bash

# 使用するDB名とユーザー名
DB_NAME="evacuation_db"
USER="masashitakao"
SQL_DIR="/Users/masashitakao/Desktop/evacuation_project-backup/sql_output"

echo "🔐 データベース '$DB_NAME' に一括インポートを開始します..."

# SQLファイルを順に処理
for file in "$SQL_DIR"/*.sql; do
  echo "📥 Importing: $file"
  psql -U "$USER" -d "$DB_NAME" -f "$file"
  if [ $? -ne 0 ]; then
    echo "❌ エラーが発生しました: $file"
    exit 1
  fi
done

echo "✅ すべての hazard_zones データのインポートが完了しました。"
