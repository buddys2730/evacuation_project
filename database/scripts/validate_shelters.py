import psycopg2
import json

def connect_db():
    return psycopg2.connect(
        dbname="evacuation_db",
        user="masashitakao",
        password="",
        host="localhost",
        port="5432"
    )

def check_duplicates_and_errors(table):
    print(f"\n🔍 検査中: {table}")
    conn = connect_db()
    cur = conn.cursor()

    # 重複チェック（名前 + 住所の重複）
    cur.execute(f"""
        SELECT name, address, COUNT(*) 
        FROM {table} 
        GROUP BY name, address 
        HAVING COUNT(*) > 1
    """)
    duplicates = cur.fetchall()
    print(f"❗ 重複レコード数: {len(duplicates)}")

    # 緯度経度チェック（範囲外やNULL）
    cur.execute(f"""
        SELECT id, name, latitude, longitude
        FROM {table}
        WHERE 
            latitude IS NULL OR 
            longitude IS NULL OR
            latitude < -90 OR latitude > 90 OR
            longitude < -180 OR longitude > 180
    """)
    coord_errors = cur.fetchall()
    print(f"⚠️ 異常な緯度経度レコード数: {len(coord_errors)}")

    cur.close()
    conn.close()

if __name__ == "__main__":
    check_duplicates_and_errors("designated_shelters")
    check_duplicates_and_errors("emergency_shelters")
    print("\n✅ データ検査完了")
