import os
import psycopg2

# === 設定 ===
SQL_DATA_DIR = (
    "/Users/masashitakao/Desktop/evacuation_project/database/seed_data/sql_output"
)

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "evacuation_db",
    "user": "masashitakao",
    "password": "",  # 必要に応じて入力
}


# === 元データから都道府県×カテゴリを取得 ===
def get_expected_categories():
    expected = {}
    for root, dirs, files in os.walk(SQL_DATA_DIR):
        parts = os.path.relpath(root, SQL_DATA_DIR).split(os.sep)
        if len(parts) >= 2:
            prefecture, category = parts[:2]
            expected.setdefault(prefecture, set()).add(category)
    return expected


# === DBから都道府県×カテゴリを取得 ===
def get_registered_categories():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute(
        "SELECT DISTINCT prefecture, category FROM hazard_zones WHERE prefecture IS NOT NULL AND category IS NOT NULL"
    )
    rows = cur.fetchall()
    conn.close()

    registered = {}
    for prefecture, category in rows:
        registered.setdefault(prefecture, set()).add(category)
    return registered


# === 差分チェック ===
def compare(expected, registered):
    all_prefectures = set(expected.keys()) | set(registered.keys())
    for pref in sorted(all_prefectures):
        exp = expected.get(pref, set())
        reg = registered.get(pref, set())

        missing = exp - reg
        extra = reg - exp

        if missing or extra:
            print(f"\n--- {pref} ---")
            if missing:
                print(f"❌ DBに存在しないカテゴリ: {sorted(missing)}")
            if extra:
                print(f"✅ 元データに存在しないカテゴリ（登録済）: {sorted(extra)}")


# === 実行 ===
if __name__ == "__main__":
    expected = get_expected_categories()
    registered = get_registered_categories()
    compare(expected, registered)
