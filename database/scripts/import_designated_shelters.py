import json
import psycopg2

# DB接続
conn = psycopg2.connect(
    dbname="evacuation_db",
    user="masashitakao",
    password="",
    host="localhost"
)
cur = conn.cursor()

# ファイルパス
file_path = "../../database/mergeFromCity_1.geojson"

with open(file_path, encoding="utf-8") as f:
    data = json.load(f)

insert_count = 0
for feature in data["features"]:
    props = feature["properties"]
    coords = feature["geometry"]["coordinates"]
    latitude = coords[1]
    longitude = coords[0]
    pref_city = props.get("都道府県名及び市町村名", "")
    pref = pref_city[:3]
    city = pref_city[3:]

    cur.execute("""
        INSERT INTO designated_shelters (
            id, name, address, latitude, longitude, pref, city, geom
        ) VALUES (%s, %s, %s, %s, %s, %s, %s,
        ST_SetSRID(ST_MakePoint(%s, %s), 4326)
        )
        ON CONFLICT (id) DO NOTHING;
    """, (
        props.get("共通ID"),
        props.get("施設・場所名"),
        props.get("住所"),
        latitude,
        longitude,
        pref,
        city,
        longitude,
        latitude
    ))
    insert_count += 1

conn.commit()
print(f"✅ 登録完了: {insert_count} 件")
cur.close()
conn.close()
