import os
import re
import psycopg2

# === 設定 ===
SQL_FOLDER = "/Volumes/1/evacuation_project0531/sql_output/"
OUTPUT_FILE = "missing_data_report.txt"

DB_NAME = "evacuation_db"
DB_USER = "masashitakao"
DB_HOST = "localhost"
DB_PORT = "5432"  # 必要なら変更
DB_PASSWORD = ""  # 必要なら設定（セキュアでないため環境変数推奨）

# === DB接続 ===
conn = psycopg2.connect(
    dbname=DB_NAME,
    user=DB_USER,
    host=DB_HOST,
    port=DB_PORT,
    password=DB_PASSWORD
)
cur = conn.cursor()

# === ファイル一覧から都道府県・カテゴリを抽出 ===
sql_files = [f for f in os.listdir(SQL_FOLDER) if f.endswith(".sql")]

expected_entries = set()
pattern = r"^(.*?)_(.*?)\.sql$"

for filename in sql_files:
    match = re.match(pattern, filename)
    if match:
        prefecture, category = match.groups()
        expected_entries.add((prefecture.strip(), category.strip()))
    else:
        print(f"⚠️ ファイル名の形式に一致しません: {filename}")

# === hazard_zones から実際の都道府県・カテゴリを取得 ===
cur.execute("""
    SELECT DISTINCT prefecture, category
    FROM hazard_zones
    WHERE prefecture IS NOT NULL AND category IS NOT NULL
""")
db_entries = set((row[0].strip(), row[1].strip()) for row in cur.fetchall())

# === 差分を計算 ===
missing_entries = expected_entries - db_entries

# === レポート出力 ===
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    if not missing_entries:
        f.write("✅ すべてのSQLファイルは hazard_zones テーブルに登録されています。\n")
    else:
        f.write("❌ 以下のファイルに対応するデータが hazard_zones に登録されていません:\n\n")
        for pref, cat in sorted(missing_entries):
            f.write(f"- {pref}_{cat}.sql\n")

print(f"\n✅ 判定完了: {OUTPUT_FILE} に出力しました。")

# === 終了処理 ===
cur.close()
conn.close()
