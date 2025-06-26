from flask import Blueprint, request, jsonify
from services.hazard_zone_service import get_hazard_polygons
import urllib.parse

hazard_polygons_bp = Blueprint("hazard_polygons_bp", __name__)

@hazard_polygons_bp.route("/api/hazard-polygons", methods=["GET"])
def hazard_polygons_api():
    # get()で既に1回デコードされるが、2重エンコード対応のためunquoteも明示的に2回呼ぶ
    category = request.args.get("category")
    if category:
        category = urllib.parse.unquote(category)
        category = urllib.parse.unquote(category)  # ← ここで2回
    lat = request.args.get("lat", type=float)
    lng = request.args.get("lng", type=float)
    radius_km = request.args.get("radius_km", type=float, default=None)
    prefecture = request.args.get("prefecture", type=str, default=None)
    if prefecture:
        prefecture = urllib.parse.unquote(prefecture)
        prefecture = urllib.parse.unquote(prefecture)  # ← ここで2回
    mode = request.args.get("mode")  # 'hazard' or 'disaster'

    center = (lng, lat) if lat is not None and lng is not None else None

    print(f"[DEBUG] /api/hazard-polygons リクエスト: mode={mode}, category={category}, lat={lat}, lng={lng}, radius_km={radius_km}, prefecture={prefecture}")

    if not category:
        return jsonify({"error": "category required"}), 400

    # 静的ハザード
    polygons = get_hazard_polygons(
        disaster_type=category,
        center=center,
        radius_km=radius_km,
        prefecture=prefecture
    )

    results = []
    if polygons:
        results.extend(polygons)

    # ★ 現在の災害状況も取得
    if mode == "disaster":
        from database import db_session
        from models import DisasterSituation
        from geoalchemy2.shape import to_shape
        import json

        q = db_session.query(DisasterSituation).filter(
            DisasterSituation.geometry != None
        )
        count = q.count()
        print(f"[DEBUG] disaster_situations 件数: {count}")
        for ds in q:
            if ds.geometry is not None:
                shape_geom = to_shape(ds.geometry)
                geojson = json.loads(shape_geom.to_geojson())
                print(f"[DEBUG] disaster_situation id={ds.id} geojson={geojson}")
                results.append({
                    "id": ds.id,
                    "type": "disaster_situation",
                    "danger_level": ds.danger_level,
                    "geometry": geojson,
                    "properties": {
                        "comment": ds.comment,
                        "danger_level": ds.danger_level,
                        "disaster_type": ds.disaster_type,
                        "occurred_at": ds.occurred_at.isoformat() if ds.occurred_at else None,
                    }
                })

    print(f"[DEBUG] hazard_polygons_api 返却件数: {len(results)}")
    return jsonify(results)
