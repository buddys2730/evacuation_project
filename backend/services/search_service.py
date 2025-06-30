# services/search_service.py

import psycopg2
import os
from flask import jsonify, request, Blueprint
from dotenv import load_dotenv

search_service = Blueprint("search_service", __name__)

# 環境変数読み込み
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"))

# DB接続
def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv("PG_DBNAME"),
        user=os.getenv("PG_USER"),
        password=os.getenv("PG_PASSWORD"),
        host=os.getenv("PG_HOST"),
        port=os.getenv("PG_PORT"),
    )

DISASTER_COLUMN_MAP = {
    "洪水": "hazard_flood",
    "土砂": "hazard_landslide",
    "高潮": "hazard_storm_surge",
    "地震": "hazard_earthquake",
    "津波": "hazard_tsunami",
    "火事": "hazard_fire",
    "内水": "hazard_inland_flood",
    "火山": "hazard_volcano",
}

@search_service.route("/api/search", methods=["GET"])
def search():
    try:
        # パラメータ取得
        pref = request.args.get("pref")
        city = request.args.get("city")
        disaster_type = request.args.get("disaster_type")
        category = request.args.get("category")
        shelter_type = request.args.get("shelter_type")
        lat_param = request.args.get("latitude")
        lng_param = request.args.get("longitude")
        radius_param = request.args.get("radius_km")

        if not lat_param or not lng_param or not radius_param:
            return jsonify({"error": "latitude, longitude, radius_km は必須です"}), 400

        try:
            latitude = float(lat_param)
            longitude = float(lng_param)
            radius_km = float(radius_param)
        except ValueError:
            return jsonify({"error": "latitude, longitude, radius_km は数値である必要があります"}), 400

        # テーブル・カラム決定
        if shelter_type == "指定避難所":
            table_name = "designated_shelters"
            disaster_column = None
        elif shelter_type == "緊急避難所":
            table_name = "emergency_shelters"
            if disaster_type in DISASTER_COLUMN_MAP:
                disaster_column = DISASTER_COLUMN_MAP[disaster_type]
            else:
                return jsonify({"error": "指定された災害種別は無効です"}), 400
        else:
            return jsonify({"error": "避難所の種別（緊急避難所 / 指定避難所）を指定してください"}), 400

        # 避難所検索
        if table_name == "designated_shelters":
            query = f"""
                SELECT id, name, address, latitude, longitude, elevation,
                       NULL AS hazard,
                       ST_Distance(
                           geography(ST_SetSRID(ST_Point(longitude, latitude), 4326)),
                           geography(ST_SetSRID(ST_Point(%s, %s), 4326))
                       ) AS distance_m
                FROM {table_name}
                WHERE ST_DWithin(
                    geography(ST_SetSRID(ST_Point(longitude, latitude), 4326)),
                    geography(ST_SetSRID(ST_Point(%s, %s), 4326)),
                    %s
                )
                ORDER BY distance_m ASC
                LIMIT 100;
            """
        else:
            query = f"""
                SELECT id, name, address, latitude, longitude, elevation,
                       {disaster_column} AS hazard,
                       ST_Distance(
                           geography(ST_SetSRID(ST_Point(longitude, latitude), 4326)),
                           geography(ST_SetSRID(ST_Point(%s, %s), 4326))
                       ) AS distance_m
                FROM {table_name}
                WHERE ST_DWithin(
                    geography(ST_SetSRID(ST_Point(longitude, latitude), 4326)),
                    geography(ST_SetSRID(ST_Point(%s, %s), 4326)),
                    %s
                )
                ORDER BY distance_m ASC
                LIMIT 100;
            """

        params = (longitude, latitude, longitude, latitude, radius_km * 1000)
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(query, params)
        shelter_rows = cur.fetchall()

        # --- 最新混雑度取得（crowd_statuses） ---
        cur.execute("""
            SELECT cs.shelter_id, cs.crowd_level
            FROM crowd_statuses cs
            INNER JOIN (
                SELECT shelter_id, MAX(updated_at) AS max_updated
                FROM crowd_statuses
                GROUP BY shelter_id
            ) t
            ON cs.shelter_id = t.shelter_id AND cs.updated_at = t.max_updated
        """)
        crowd_map = {str(row[0]): row[1] for row in cur.fetchall()}

        # --- 物資取得（shelter_supplies） ---
        cur.execute("""
            SELECT s1.shelter_id, s1.item_name, s1.quantity
            FROM shelter_supplies s1
            INNER JOIN (
                SELECT shelter_id, item_name, MAX(updated_at) AS max_updated
                FROM shelter_supplies
                GROUP BY shelter_id, item_name
            ) s2
            ON s1.shelter_id = s2.shelter_id AND s1.item_name = s2.item_name AND s1.updated_at = s2.max_updated
        """)
        supplies_map = {}
        for row in cur.fetchall():
            key = str(row[0])
            if key not in supplies_map:
                supplies_map[key] = {}
            supplies_map[key][row[1]] = row[2]

        cur.close()
        conn.close()

        # --- レスポンス整形 ---
        result = []
        for row in shelter_rows:
            sid = str(row[0])
            result.append({
                "id": sid,
                "name": row[1],
                "address": row[2],
                "latitude": row[3],
                "longitude": row[4],
                "elevation": row[5],
                "hazard": "不明" if row[6] is None else row[6],
                "distance_km": round(row[7] / 1000, 2) if row[7] is not None else None,
                "crowdedness": crowd_map.get(sid, "未登録"),
                "supplies": supplies_map.get(sid, {}),
            })

        return jsonify(result)

    except Exception as e:
        print("❌ /api/search 例外:", e)
        return jsonify({"error": str(e)}), 500
