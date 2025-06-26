#!/bin/bash

# --- 設定 ---
DB="evacuation_db"
USER="masashitakao"
SQL_DIR="/Volumes/1/ハザードマップデータ他/sql_output"
SRC_COUNT="source_counts.csv"
LOG="import_progress.log"
PY_COMPARE="compare_counts.py"
MAX_RETRY=10

# --- ログ初期化&既存ログ削除 ---
echo "=== [0] ログ初期化 ==="
rm -f $LOG

# --- PostgreSQL巨大ログ対策（標準ログ肥大も削除！）---
PGLOG="/opt/homebrew/var/log/postgresql@14.log"
if [ -f "$PGLOG" ]; then
  echo "→ PostgreSQLログ削除: $PGLOG"
  pg_ctl -D /opt/homebrew/var/postgresql@14 stop
  rm -f "$PGLOG"
  pg_ctl -D /opt/homebrew/var/postgresql@14 start
  sleep 3
fi

# --- hazard_zonesテーブル再作成（カラム完全対応）---
echo "=== [1] hazard_zones テーブル再作成 ==="
psql -U $USER -d $DB <<EOSQL
DROP TABLE IF EXISTS hazard_zones CASCADE;
CREATE TABLE hazard_zones (
    id SERIAL PRIMARY KEY,
    geometry geometry,
    category VARCHAR(64),
    source VARCHAR(256),
    address VARCHAR(256),
    prefecture VARCHAR(16),
    city VARCHAR(64),
    created_at TIMESTAMP,
    geom_hash VARCHAR(64)
);
EOSQL

# --- 全ファイル一括インポート ---
echo "=== [2] SQLファイル全件インポート ===" | tee -a $LOG
for file in $SQL_DIR/*.sql; do
  echo "[$(date '+%T')] ▶ $file インポート..." | tee -a $LOG
  psql -d $DB -U $USER -f "$file" >> $LOG 2>&1
done

echo "[$(date '+%T')] === インポート完了 ===" | tee -a $LOG

# --- DB件数集計(csv) ---
echo "[$(date '+%T')] === DB件数集計(csv) ===" | tee -a $LOG
psql -d $DB -U $USER -c "\COPY (SELECT prefecture, category, COUNT(*) FROM hazard_zones GROUP BY prefecture, category ORDER BY prefecture, category) TO 'db_counts.csv' WITH CSV HEADER"

# --- 件数diff自動比較 ---
echo "[$(date '+%T')] === 件数diff自動比較 ===" | tee -a $LOG
python3 $PY_COMPARE $SRC_COUNT db_counts.csv > compare_result.csv

cat compare_result.csv | tee -a $LOG

# --- diff!=0の県・カテゴリごとに再実行 ---
diffs=$(awk -F, 'NR>1 && $5!=0 {print $1,$2}' compare_result.csv)
if [ -z "$diffs" ]; then
    echo "[$(date '+%T')] ★ 漏れゼロ！全て一致しました。" | tee -a $LOG
    exit 0
fi

echo "[$(date '+%T')] !! 件数不一致あり。該当ファイルを再インポート。" | tee -a $LOG

for i in $(seq 1 $MAX_RETRY); do
    while read -r pref cat; do
        files=(${SQL_DIR}/${pref}_${cat}*.sql)
        if [ -e "${files[0]}" ]; then
          for fname in "${files[@]}"; do
            echo "[$(date '+%T')] → 再インポート: $fname" | tee -a $LOG
            psql -d $DB -U $USER -f "$fname" >> $LOG 2>&1
          done
        else
          echo "[$(date '+%T')] × ファイル未発見: ${SQL_DIR}/${pref}_${cat}*.sql" | tee -a $LOG
        fi
    done <<< "$diffs"

    echo "[$(date '+%T')] === 照合ループ $i ===" | tee -a $LOG
    psql -d $DB -U $USER -c "\COPY (SELECT prefecture, category, COUNT(*) FROM hazard_zones GROUP BY prefecture, category ORDER BY prefecture, category) TO 'db_counts.csv' WITH CSV HEADER"
    python3 $PY_COMPARE $SRC_COUNT db_counts.csv > compare_result.csv
    cat compare_result.csv | tee -a $LOG
    diffs=$(awk -F, 'NR>1 && $5!=0 {print $1,$2}' compare_result.csv)
    if [ -z "$diffs" ]; then
        echo "[$(date '+%T')] ★ 漏れゼロ！全て一致しました。" | tee -a $LOG
        exit 0
    fi
done

echo "[$(date '+%T')] !! 最大リトライ到達。手動確認してください。" | tee -a $LOG
exit 1
