from flask import Blueprint, request, jsonify
import json
from db_connection import get_db_connection

hazard_polygons_service = Blueprint("hazard_polygons_service", __name__)

@hazard_polygons_service.route("/api/hazard-polygons", methods=["GET"])
def hazard_polygons():
    category = request.args.get("category")
    lat = request.args.get("lat", type=float)
    lng = request.args.get("lng", type=float)
    radius_km = request.args.get("radius_km", type=float, default=2.0)
    prefecture = request.args.get("prefecture")

    print("[DEBUG] /api/hazard-polygons", category, lat, lng, radius_km, prefecture)

    # 必須パラメータ確認
    if not all([category, lat, lng, prefecture]):
        print("[ERROR] 必須パラメータ不足:", category, lat, lng, prefecture)
        return jsonify({"error": "必須パラメータ(category, lat, lng, prefecture)が不足しています"}), 400
    
    try:
        radius = radius_km * 1000  # SQL内で使うのはメートル
        conn = get_db_connection()
        cur = conn.cursor()
        sql = """
            SELECT id, category, ST_AsGeoJSON(ST_Simplify(geometry, 0.0001)) as geojson
            FROM hazard_zones
            WHERE prefecture = %s
              AND category = %s
              AND geometry IS NOT NULL
              AND ST_DWithin(
                geometry::geography,
                ST_SetSRID(ST_Point(%s, %s), 4326)::geography,
                %s
              )
            ORDER BY
              ST_Distance(
                geometry::geography,
                ST_SetSRID(ST_Point(%s, %s), 4326)::geography
              ) ASC
            LIMIT 500
        """
        params = (prefecture, category, lng, lat, radius, lng, lat)

        print("[DEBUG] 実行SQL:", sql)
        print("[DEBUG] パラメータ:", params)
        cur.execute(sql, params)
        rows = cur.fetchall()
        cur.close()
        conn.close()

        features = []
        for row in rows:
            geojson = row[2]
            if not geojson:
                print("[WARNING] geometry未変換またはNoneを検出、id:", row[0])
                continue
            try:
                geometry = json.loads(geojson)
            except Exception as e:
                print(f"[ERROR] json.loads失敗: id={row[0]}, e={e}, geojson={geojson}")
                continue
            features.append({
                "type": "Feature",
                "geometry": geometry,
                "properties": {
                    "id": row[0],
                    "category": row[1],
                }
            })
        print(f"[DEBUG] ポリゴン件数: {len(features)}")
        return jsonify({"type": "FeatureCollection", "features": features})

    except Exception as e:
        print("❌ /api/hazard-polygons 例外:", e)
        return jsonify({"error": str(e)}), 500
