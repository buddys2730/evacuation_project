import psycopg2

conn = psycopg2.connect(
    dbname="evacuation_db",
    user="masashitakao",
    host="localhost",
    password="",  # 必要に応じて設定
    port="5432"
)
cur = conn.cursor()

# 東京都23区の分離と統一
cur.execute("""
UPDATE designated_shelters
SET ward = CASE
    WHEN pref = '東京都' AND ward IS NULL AND city LIKE '%区' THEN city
    ELSE ward
END,
city = CASE
    WHEN pref = '東京都' AND city LIKE '%区' THEN '東京23区'
    ELSE city
END;
""")

cur.execute("""
UPDATE emergency_shelters
SET ward = CASE
    WHEN pref = '東京都' AND ward IS NULL AND city LIKE '%区' THEN city
    ELSE ward
END,
city = CASE
    WHEN pref = '東京都' AND city LIKE '%区' THEN '東京23区'
    ELSE city
END;
""")

conn.commit()
cur.close()
conn.close()
print("✅ 市区町村階層の正規化が完了しました。")
