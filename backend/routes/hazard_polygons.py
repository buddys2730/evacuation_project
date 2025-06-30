from flask import Blueprint, request, jsonify
from services.hazard_zone_service import get_hazard_polygons
import urllib.parse

from sqlalchemy import text   # ← ここを必ず追記

hazard_polygons_bp = Blueprint("hazard_polygons_bp", __name__)

@hazard_polygons_bp.route("/api/hazard-polygons", methods=["GET"])
def hazard_polygons_api():
    # --- 1. クエリパラメータ取得 ---
    category = request.args.get("category")
    prefecture = request.args.get("prefecture")
    lat = request.args.get("lat", type=float)
    lng = request.args.get("lng", type=float)
    radius_km = request.args.get("radius_km", type=float, default=None)
    mode = request.args.get("mode")  # 'hazard' or 'disaster'

    print(f"=== DEBUG: クエリmode値 = {repr(mode)}")   # ← ここ！

    # --- 2. repr/型でデバッグ出力 ---
    print("=== DEBUG: raw category repr ===", repr(category), type(category))
    print("=== DEBUG: raw prefecture repr ===", repr(prefecture), type(prefecture))

    # --- 3. 2重デコード防止とUTF-8対応 ---
    def decode_param(param):
        if param is None:
            return None
        try:
            v = urllib.parse.unquote(param)
            v = urllib.parse.unquote(v)
            if isinstance(v, bytes):
                v = v.decode("utf-8")
            return v
        except Exception as e:
            print("DECODE ERROR", e)
            return param

    category = decode_param(category)
    prefecture = decode_param(prefecture)

    print(f"=== DEBUG: after decode === category={repr(category)} prefecture={repr(prefecture)}")

    center = (lng, lat) if lat is not None and lng is not None else None

    print(f"[DEBUG] /api/hazard-polygons リクエスト: mode={mode}, category={category}, lat={lat}, lng={lng}, radius_km={radius_km}, prefecture={prefecture}")

    if not category:
        return jsonify({"error": "category required"}), 400

    # --- 4. ハザードポリゴン取得（静的） ---
    results = []
    polygons = get_hazard_polygons(
        disaster_type=category,
        center=center,
        radius_km=radius_km,
        prefecture=prefecture
    )
    if polygons:
        results.extend(polygons)

    # --- 5. 現在の災害状況（SQLでST_AsGeoJSON） ---
    if mode == "disaster":
        print("[DEBUG] disaster_situations ブロック突入！")
        from database import db_session
        import json

        sql = """
            SELECT id, disaster_type, danger_level, comment, occurred_at,
                   ST_AsGeoJSON(geometry) as geojson
            FROM disaster_situations
            WHERE geometry IS NOT NULL
        """
        rows = db_session.execute(text(sql))
        for row in rows:
            # SQLAlchemy 1.4以降ならrow._mapping["geojson"]で必ず取れる
            mapping = row._mapping if hasattr(row, "_mapping") else row
            geojson = json.loads(mapping["geojson"])
            results.append({
                "id": mapping["id"],
                "type": "disaster_situation",
                "danger_level": mapping["danger_level"],
                "geometry": geojson,
                "properties": {
                    "comment": mapping["comment"],
                    "danger_level": mapping["danger_level"],
                    "disaster_type": mapping["disaster_type"],
                    "occurred_at": mapping["occurred_at"].isoformat() if mapping["occurred_at"] else None,
                }
            })
        print(f"[DEBUG] disaster_situations 件数: {len(results)}")

    # --- 6. FeatureCollection形式で返却 ---
    return jsonify({
        "type": "FeatureCollection",
        "features": results
    })
