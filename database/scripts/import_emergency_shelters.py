import json
import psycopg2

conn = psycopg2.connect(
    dbname="evacuation_db",
    user="masashitakao",
    password="",
    host="localhost"
)
cur = conn.cursor()

file_path = "../../database/mergeFromCity_2.geojson"

def to_bool(v):
    return v == "1"

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
        INSERT INTO emergency_shelters (
            id, name, address, latitude, longitude, 
            hazard_flood, hazard_landslide, hazard_storm_surge,
            hazard_earthquake, hazard_tsunami, hazard_fire,
            hazard_inland_flood, hazard_volcano,
            pref, city,
            geom
        ) VALUES (%s, %s, %s, %s, %s,
                  %s, %s, %s, %s, %s, %s, %s, %s,
                  %s, %s,
                  ST_SetSRID(ST_MakePoint(%s, %s), 4326)
        )
        ON CONFLICT (id) DO NOTHING;
    """, (
        props.get("共通ID"),
        props.get("施設・場所名"),
        props.get("住所"),
        latitude,
        longitude,
        to_bool(props.get("洪水", "")),
        to_bool(props.get("崖崩れ、土石流及び地滑り", "")),
        to_bool(props.get("高潮", "")),
        to_bool(props.get("地震", "")),
        to_bool(props.get("津波", "")),
        to_bool(props.get("大規模な火事", "")),
        to_bool(props.get("内水氾濫", "")),
        to_bool(props.get("火山現象", "")),
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
