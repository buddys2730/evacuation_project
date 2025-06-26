#!/bin/bash

# -- 設定 --
DB="evacuation_db"
USER="masashitakao"
SQL_DIR="/Volumes/1/ハザードマップデータ他/sql_output"
SRC_COUNT="source_counts.csv"
LOG="import_progress.log"
PY_COMPARE="compare_counts.py"
TABLE="hazard_zones"
# ----------

echo "=== テーブル初期化（全件削除） ===" | tee $LOG
psql -d $DB -U $USER -c "TRUNCATE TABLE $TABLE;"

echo "=== 全ファイル一括インポート開始 ===" | tee -a $LOG
for file in $SQL_DIR/*.sql; do
  echo "[$(date '+%T')] ▶ $file インポート..." | tee -a $LOG
  psql -d $DB -U $USER -f "$file" >> $LOG 2>&1
done

echo "[$(date '+%T')] === インポート完了 ===" | tee -a $LOG

# 件数集計・比較ループ（最大10回）
for i in {1..10}; do
    echo "[$(date '+%T')] === DB件数集計(csv) ===" | tee -a $LOG
    psql -d $DB -U $USER -c "\COPY (SELECT prefecture, category, COUNT(*) FROM $TABLE GROUP BY prefecture, category ORDER BY prefecture, category) TO 'db_counts.csv' WITH CSV HEADER"

    echo "[$(date '+%T')] === 件数diff自動比較 ===" | tee -a $LOG
    python3 $PY_COMPARE $SRC_COUNT db_counts.csv > compare_result.csv

    cat compare_result.csv | tee -a $LOG

    diffs=$(awk -F, 'NR>1 && $5!=0 {print $1,$2}' compare_result.csv)
    if [ -z "$diffs" ]; then
        echo "[$(date '+%T')] ★ 漏れゼロ！全て一致しました。" | tee -a $LOG
        exit 0
    fi

    echo "[$(date '+%T')] !! 件数不一致あり。該当ファイルを削除後再インポート。" | tee -a $LOG

    while read -r pref cat; do
        # 対象pref+catの既存データを削除
        echo "[$(date '+%T')] → DELETE FROM $TABLE WHERE prefecture='$pref' AND category='$cat';" | tee -a $LOG
        psql -d $DB -U $USER -c "DELETE FROM $TABLE WHERE prefecture='$pref' AND category='$cat';" >> $LOG 2>&1

        # ワイルドカードで該当ファイル全て処理
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
done

echo "[$(date '+%T')] !! 最大リトライ到達。手動確認してください。" | tee -a $LOG
exit 1
