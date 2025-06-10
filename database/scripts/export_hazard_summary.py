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

hazard_columns = [
    "hazard_flood",
    "hazard_landslide",
    "hazard_storm_surge",
    "hazard_earthquake",
    "hazard_tsunami",
    "hazard_fire",
    "hazard_inland_flood",
    "hazard_volcano"
]

def summarize_hazards():
    conn = connect_db()
    cur = conn.cursor()
    summary = {}

    for column in hazard_columns:
        cur.execute(f"SELECT COUNT(*) FROM emergency_shelters WHERE {column} = TRUE")
        count = cur.fetchone()[0]
        summary[column] = count

    cur.close()
    conn.close()

    with open("hazard_summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print("✅ JSONファイルを出力しました: hazard_summary.json")

if __name__ == "__main__":
    summarize_hazards()
