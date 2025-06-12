# services/search_service.py

import psycopg2
import os
from flask import jsonify, request, Blueprint
from dotenv import load_dotenv
from backend.services.db_connection import get_db_connection

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


# 災害種別とカラムの対応
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
        # クエリパラメータ取得
        pref = request.args.get("pref")
        city = request.args.get("city")
        disaster_type = request.args.get("disaster_type")
        category = request.args.get("category")  # category=洪水_01_計画規模 など
        shelter_type = request.args.get("shelter_type")  # ← 緊急避難所 or 指定避難所

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
            return (
                jsonify(
                    {
                        "error": "latitude, longitude, radius_km は数値である必要があります"
                    }
                ),
                400,
            )

        # テーブル選択
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
            return (
                jsonify(
                    {
                        "error": "避難所の種別（緊急避難所 / 指定避難所）を指定してください"
                    }
                ),
                400,
            )

        # SQLクエリ構築
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

        # 実行
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(query, params)
        rows = cur.fetchall()
        cur.close()
        conn.close()

        # 結果整形
        result = [
            {
                "id": row[0],
                "name": row[1],
                "address": row[2],
                "latitude": row[3],
                "longitude": row[4],
                "elevation": row[5],
                "hazard": "不明" if row[6] is None else row[6],
                "distance_km": round(row[7] / 1000, 2) if row[7] is not None else None,
            }
            for row in rows
        ]

        return jsonify(result)

    except Exception as e:
        print("❌ /api/search 例外:", e)
        return jsonify({"error": str(e)}), 500
