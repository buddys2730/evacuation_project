import sys
import os
import json
import psycopg2
import time
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../database')))

from flask import Blueprint, request, jsonify
from db_connection import get_db_connection
from shapely import wkb
from shapely.geometry import mapping

hazard_zone_service = Blueprint("hazard_zone_service", __name__)
hazard_category_bp = Blueprint("hazard_category", __name__)

# ✅ 0. 都道府県リスト取得API
@hazard_zone_service.route("/api/prefs", methods=["GET"])
def get_prefectures():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT DISTINCT prefecture FROM city_master ORDER BY prefecture;")
        prefs = [row[0] for row in cur.fetchall()]
        cur.close()
        conn.close()
        return jsonify({"prefs": prefs})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ 0-2. 市町村リスト取得API
#@hazard_zone_service.route("/api/cities", methods=["GET"])
#def get_cities():
    pref = request.args.get("pref")
    if not pref:
        return jsonify({"cities": []}), 400
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT city FROM city_master WHERE prefecture = %s ORDER BY city;",
            (pref,)
        )
        cities = [row[0] for row in cur.fetchall()]
        cur.close()
        conn.close()
        return jsonify({"cities": cities})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ 1. 中心点 + 半径に基づく取得（既存）
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
        like_pattern = category + "%"
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

        results = [
            {"id": row[0], "category": row[1], "geometry": json.loads(row[2])}
            for row in rows
        ]

        return jsonify(results)

    except Exception as e:
        print("❌ /api/hazard_zones 例外:", e)
        return jsonify({"error": str(e)}), 500

# /backend/services/hazard_zone_service.py

def get_hazard_polygons(disaster_type, category=None, center=None, radius_km=None, prefecture=None):
    """
    災害種別＋カテゴリ（例: 洪水_02_想定最大規模）、中心点(center=[lng,lat])・半径[km]・都道府県名で
    ポリゴン抽出し [{"geometry": geojson, "id": ..., "type": ..., "level": ...}, ...] で返却
    静的ハザード（hazard_zones）＋動的災害状況（disaster_situations）を統合
    """
    import json
    from database import db_session

    polygons = []

    # -------- 静的ハザード（hazard_zones） --------
    try:
        # category優先。なければdisaster_typeを使う
        if not category:
            category = disaster_type
        like_pattern = category + "%"
        lng, lat = None, None
        radius_m = None
        if center is not None and len(center) == 2:
            lng, lat = center
        if radius_km is not None:
            radius_m = int(float(radius_km) * 1000)

        # 必要なパラメータチェック（都道府県も必要な場合あり）
        if None in (lat, lng, radius_m) or not prefecture:
            return []

        conn = get_db_connection()
        cur = conn.cursor()

        sql = """
        SELECT id, category, ST_AsGeoJSON(geometry)
        FROM hazard_zones
        WHERE category LIKE %s
          AND ST_DWithin(
              geography(geometry),
              geography(ST_SetSRID(ST_Point(%s, %s), 4326)),
              %s
          )
          AND prefecture = %s
        LIMIT 500
        """
        params = (like_pattern, lng, lat, radius_m, prefecture)
        cur.execute(sql, params)
        rows = cur.fetchall()
        cur.close()
        conn.close()

        for row in rows:
            polygons.append({
                "id": row[0],
                "type": row[1],
                "level": "",
                "geometry": json.loads(row[2])
            })
    except Exception as e:
        print(f"❌ get_hazard_polygons hazard_zones エラー: {e}")

    # -------- 動的ハザード（disaster_situations） --------
    try:
        # 範囲内＋未解除（または解除日が未来）
        sql = """
        SELECT id, disaster_type, danger_level, depth_m, occurred_at, cleared_at, ST_AsGeoJSON(geometry)
        FROM disaster_situations
        WHERE occurred_at <= NOW() AND (cleared_at IS NULL OR cleared_at > NOW())
        """
        result = db_session.execute(sql)
        for row in result.fetchall():
            geom = json.loads(row["ST_AsGeoJSON(geometry)"]) if "ST_AsGeoJSON(geometry)" in row else json.loads(row[6])
            polygons.append({
                "id": row["id"] if "id" in row else row[0],
                "type": "disaster_situation",
                "level": row["danger_level"] if "danger_level" in row else row[2],
                "geometry": geom,
                "danger_level": row["danger_level"] if "danger_level" in row else row[2],
                "depth_m": row["depth_m"] if "depth_m" in row else row[3],
                "occurred_at": str(row["occurred_at"] if "occurred_at" in row else row[4]),
                "cleared_at": str(row["cleared_at"] if "cleared_at" in row else row[5])
            })
    except Exception as e:
        print(f"❌ get_hazard_polygons disaster_situations エラー: {e}")

    return polygons


# ✅ 2. 地図表示の高速描画用：矩形指定取得（既存）
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

        like_pattern = category + "%"
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
            features.append(
                {
                    "type": "Feature",
                    "geometry": geojson_geom,
                    "properties": {"id": row[0], "category": row[1]},
                }
            )

        return jsonify(
            {"type": "FeatureCollection", "features": features, "duration_ms": duration}
        )

    except Exception as e:
        print("❌ /api/hazard_zones/viewport エラー:", e)
        return jsonify({"error": str(e)}), 500

# ✅ 3. メインカテゴリ一覧取得（既存）
@hazard_category_bp.route("/api/hazard_categories", methods=["GET"])
def get_main_categories():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        query = """
            SELECT DISTINCT split_part(category, '\\', 1) AS main_category
            FROM hazard_zones
            ORDER BY main_category;
        """
        cur.execute(query)
        rows = cur.fetchall()
        cur.close()
        conn.close()

        categories = [row[0] for row in rows if row[0] != ""]
        return jsonify(categories)

    except Exception as e:
        print("❌ /api/hazard_categories エラー:", e)
        return jsonify({"error": str(e)}), 500

# ✅ 4. サブカテゴリ取得（既存）
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
        like_pattern = main_category + "\\%"
        cur.execute(query, (like_pattern,))
        rows = cur.fetchall()
        cur.close()
        conn.close()

        subcategories = [row[0] for row in rows]
        return jsonify(subcategories)

    except Exception as e:
        print("❌ /api/hazard_categories/<main_category> エラー:", e)
        return jsonify({"error": str(e)}), 500

# /backend/services/hazard_zone_service.py
# 市区町村単位でハザードポリゴン取得API【爆速・インデックス完全活用・都道府県市絞り込み】

# ✅ 5. 市区町村単位でハザードポリゴン取得API（爆速最適化・都道府県市重複対策・LIMIT追加）
@hazard_zone_service.route("/api/hazard_zones/by_city", methods=["GET"], endpoint="hazard_zones_by_city")
def hazard_zones_by_city():
    city_name = request.args.get("city_name")
    prefecture = request.args.get("prefecture")  # 県名で追加絞り込み
    category = request.args.get("category")  # Optional: 災害カテゴリで絞る

    if not city_name:
        return jsonify({"error": "city_name is required"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        # 県・市の両方で特定し、必ずindexを利用
        sql = """
            SELECT hz.id, hz.category, ST_AsGeoJSON(hz.geometry)
            FROM hazard_zones hz
            JOIN city_master cm ON ST_Within(hz.geometry, cm.geometry)
            WHERE cm.city = %s
        """
        params = [city_name]
        if prefecture:
            sql += " AND cm.prefecture = %s"
            params.append(prefecture)
        if category:
            sql += " AND hz.category LIKE %s"
            params.append(category + "%")
        sql += " LIMIT 500"

        cur.execute(sql, params)
        rows = cur.fetchall()
        cur.close()
        conn.close()

        results = [
            {"id": row[0], "category": row[1], "geometry": json.loads(row[2])}
            for row in rows
        ]
        return jsonify(results)
    except Exception as e:
        print("❌ /api/hazard_zones/by_city 例外:", e)
        return jsonify({"error": str(e)}), 500
    
    """
    災害種別（例: "洪水_02_想定最大規模"）に該当するhazard_zonesテーブルの全ポリゴンを返す
    戻り値: [{"geometry": geojson, "id": ..., "type": ..., "level": ...}, ...]
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        query = """
            SELECT id, category, ST_AsGeoJSON(geometry)
            FROM hazard_zones
            WHERE category = %s
            LIMIT 300
        """
        cur.execute(query, (disaster_type,))
        rows = cur.fetchall()
        cur.close()
        conn.close()

        results = [
            {
                "id": row[0],
                "type": row[1],
                "level": "",
                "geometry": json.loads(row[2])
            }
            for row in rows
        ]
        return results
    except Exception as e:
        print("❌ get_hazard_polygons エラー:", e)
        return []

