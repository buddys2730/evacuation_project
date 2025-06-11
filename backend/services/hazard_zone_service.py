from flask import Blueprint, request, jsonify
import json
import psycopg2
import time  # ← 追加
from services.db_connection import get_db_connection
from shapely import wkb
from shapely.geometry import mapping
from backend.database.db_connection import get_db_connection

hazard_zone_service = Blueprint("hazard_zone_service", __name__)
hazard_category_bp = Blueprint("hazard_category", __name__)

# ✅ 1. 中心点 + 半径に基づく取得
@hazard_zone_service.route("/api/hazard_zones", methods=["GET"])
def get_hazard_zones():
    category = request.args.get("category")
    lat = request.args.get("lat", type=float)
    lng = request.args.get("lng", type=float)
    radius = request.args.get("radius", type=int)

    if not category or lat is None or lng is None or radius is None:
        return jsonify({"error": "Missing parameters"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        like_pattern = category + '%'

        query = """
    SELECT id, category, ST_AsGeoJSON(geometry)
    FROM hazard_zones
    WHERE category LIKE %s
      AND ST_DWithin(
          geography(geometry),
          geography(ST_SetSRID(ST_Point(%s, %s), 4326)),
          %s
      )
    LIMIT 300
"""

        cur.execute(query, (like_pattern, lng, lat, radius))
        rows = cur.fetchall()
        cur.close()
        conn.close()

        results = [{
            "id": row[0],
            "category": row[1],
            "geometry": json.loads(row[2])
        } for row in rows]

        return jsonify(results)

    except Exception as e:
        print("❌ /api/hazard_zones 例外:", e)
        return jsonify({"error": str(e)}), 500


# ✅ 2. 地図表示の高速描画用：矩形指定取得
@hazard_zone_service.route("/api/hazard_zones/viewport", methods=["GET"])
def get_hazard_zones_in_viewport():
    category = request.args.get("category")
    min_lat = request.args.get("min_lat", type=float)
    max_lat = request.args.get("max_lat", type=float)
    min_lng = request.args.get("min_lng", type=float)
    max_lng = request.args.get("max_lng", type=float)
    start_time = time.time()  # ⏱️ 処理開始時間

    if not category or None in (min_lat, max_lat, min_lng, max_lng):
        return jsonify({"error": "Missing bounding box or category"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        end_time = time.time()  # ⏱️ 処理終了時間
        duration = round((end_time - start_time) * 1000, 2)
        print(f"✅ /api/hazard_zones/viewport: 処理時間 {duration} ms")

        like_pattern = category + '%'
        query = """
            SELECT id, category, ST_AsBinary(geometry)
            FROM hazard_zones
            WHERE category LIKE %s
              AND ST_Intersects(
                geometry,
                ST_MakeEnvelope(%s, %s, %s, %s, 4326)
              )
            LIMIT 1000
        """
        cur.execute(query, (like_pattern, min_lng, min_lat, max_lng, max_lat))
        rows = cur.fetchall()
        cur.close()
        conn.close()

        features = []
        for row in rows:
            geom = wkb.loads(row[2], hex=False)
            simplified_geom = geom.simplify(0.0001, preserve_topology=True)
            geojson_geom = mapping(simplified_geom)
            features.append({
                "type": "Feature",
                "geometry": geojson_geom,
                "properties": {
                    "id": row[0],
                    "category": row[1]
                }
            })

        return jsonify({
            "type": "FeatureCollection",
            "features": features,
            "duration_ms": duration
        })

    except Exception as e:
        print("❌ /api/hazard_zones/viewport エラー:", e)
        return jsonify({"error": str(e)}), 500


# ✅ 3. メインカテゴリ一覧取得
@hazard_category_bp.route("/api/hazard_categories", methods=["GET"])
def get_main_categories():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        query = """
            SELECT DISTINCT split_part(category, '\\\\', 1) AS main_category
            FROM hazard_zones
            ORDER BY main_category;
        """
        cur.execute(query)
        rows = cur.fetchall()
        cur.close()
        conn.close()

        categories = [row[0] for row in rows if row[0] != '']
        return jsonify(categories)

    except Exception as e:
        print("❌ /api/hazard_categories エラー:", e)
        return jsonify({"error": str(e)}), 500


# ✅ 4. サブカテゴリ取得
@hazard_category_bp.route("/api/hazard_categories/<main_category>", methods=["GET"])
def get_subcategories(main_category):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        query = """
            SELECT DISTINCT category
            FROM hazard_zones
            WHERE category LIKE %s
            ORDER BY category;
        """
        like_pattern = main_category + "\\\\%"
        cur.execute(query, (like_pattern,))
        rows = cur.fetchall()
        cur.close()
        conn.close()

        subcategories = [row[0] for row in rows]
        return jsonify(subcategories)

    except Exception as e:
        print("❌ /api/hazard_categories/<main_category> エラー:", e)
        return jsonify({"error": str(e)}), 500
