import csv
import psycopg2

# --- 設定 ---
db_user = "masashitakao"       # ここを修正
db_name = "evacuation_db"
sql_dir = "/Volumes/1/ハザードマップデータ他/sql_output"
count_file = "insert_counts.txt"

# --- DBから都道府県・カテゴリごとの件数取得 ---
conn = psycopg2.connect(f"dbname={db_name} user={db_user}")
cur = conn.cursor()
cur.execute("""
SELECT prefecture, category, COUNT(*)
FROM hazard_zones
GROUP BY prefecture, category
ORDER BY prefecture, category
""")
db_counts = {}
for pref, cat, count in cur.fetchall():
    db_counts[(pref, cat)] = count
cur.close()
conn.close()

# --- 元ファイル件数ロード ---
source_counts = {}
with open(f"{sql_dir}/{count_file}", encoding="utf-8") as f:
    for line in f:
        if ':' in line:
            path, count = line.strip().split(':')
            fn = path.split('/')[-1]
            # 例: 宮城県_洪水_01_計画規模.sql
            base = fn.replace('.sql', '')
            # 県名とカテゴリを分離
            if "_" in base:
                pref, cat = base.split('_', 1)
                source_counts.setdefault((pref, cat), 0)
                source_counts[(pref, cat)] += int(count)

# --- 比較・出力 ---
print("prefecture,category,source_count,db_count,diff")
for key in sorted(source_counts.keys()):
    s = source_counts.get(key, 0)
    d = db_counts.get(key, 0)
    print(f"{key[0]},{key[1]},{s},{d},{s-d}")
