#!/bin/bash

# 必須設定
DB="evacuation_db"
USER="masashitakao"
SQL_DIR="/Volumes/1/ハザードマップデータ他/sql_output"
TEST_FILE="北海道_洪水_01_計画規模.sql"
LOG="import_test.log"

echo "==== 1ファイルのみ手動検証 ====" | tee $LOG
echo "ファイル: $SQL_DIR/$TEST_FILE" | tee -a $LOG

# 空き容量確認
df -h | tee -a $LOG

# hazard_zones件数（インポート前）
psql -d $DB -U $USER -c "SELECT COUNT(*) FROM hazard_zones;" | tee -a $LOG

# インポート実行
psql -d $DB -U $USER -f "$SQL_DIR/$TEST_FILE" | tee -a $LOG

# hazard_zones件数（インポート後）
psql -d $DB -U $USER -c "SELECT COUNT(*) FROM hazard_zones;" | tee -a $LOG

# 空き容量確認（再）
df -h | tee -a $LOG

echo "==== 完了 ====" | tee -a $LOG
