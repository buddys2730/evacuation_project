import json
import psycopg2

DB_NAME = "evacuation_db"
USER = "masashitakao"
PASSWORD = "admin123"  # パスワードがある場合は記入
HOST = "localhost"
PORT = "5432"

TABLES = [
    ("emergency_shelters", "../../frontend/public/emergency_shelters.geojson"),
    ("designated_shelters", "../../frontend/public/designated_shelters.geojson")
]

def export_geojson(table_name, output_file):
    conn = psycopg2.connect(dbname=DB_NAME, user=USER, password=PASSWORD, host=HOST, port=PORT)
    cur = conn.cursor()

    cur.execute(f"SELECT * FROM {table_name};")
    rows = cur.fetchall()

    features = []
    for row in rows:
        if table_name == "emergency_shelters":
            # 列順に対応（latitude=row[3], longitude=row[4], elevation=row[5]）
            geometry = {
                "type": "Point",
                "coordinates": [row[4], row[3]]  # lng, lat
            }
            properties = {
                "id": row[0],
                "name": row[1],
                "address": row[2],
                "elevation": row[5],
                "prefecture": row[15],
                "city": row[14],
                "ward": row[16],
                "town": row[17],
                "chome_block": row[18],
                "type": table_name
            }

        elif table_name == "designated_shelters":
            # latitude=row[3], longitude=row[4], elevation=row[5]
            geometry = {
                "type": "Point",
                "coordinates": [row[4], row[3]]
            }
            properties = {
                "id": row[0],
                "name": row[1],
                "address": row[2],
                "elevation": row[5],
                "target": row[6],
                "prefecture": row[8],
                "city": row[7],
                "ward": row[10],
                "town": row[11],
                "chome_block": row[12],
                "normalized_target": row[9],
                "target_category": row[13],
                "type": table_name
            }

        features.append({
            "type": "Feature",
            "geometry": geometry,
            "properties": properties
        })

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False, indent=2)

    print(f"✅ {table_name} を {output_file} に保存しました。")

    cur.close()
    conn.close()

if __name__ == "__main__":
    for table_name, output_file in TABLES:
        export_geojson(table_name, output_file)
