import sys
import os
import json
from flask import Blueprint, request, jsonify
from shapely.geometry import shape, Point
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../database')))
from hazard_data_loader import load_all_hazard_polygons

# Flask Blueprint定義
route_safety_service = Blueprint('route_safety_service', __name__)

def evaluate_route_safety(route_points):
    """
    避難ルートの安全性を評価する。

    Parameters:
    - route_points: [{"lat": ..., "lng": ...}, ...]

    Returns:
    - status: "safe" or "danger"
    - dangerous_points: [{lat, lng, hazard_type}]
    """
    try:
        hazard_polygons = load_all_hazard_polygons()
        dangerous_points = []

        for point_data in route_points:
            point = Point(point_data["lng"], point_data["lat"])  # Shapelyはlng, latの順
            for hazard_type, polygons in hazard_polygons.items():
                for polygon in polygons:
                    if polygon.contains(point):
                        dangerous_points.append(
                            {
                                "lat": point_data["lat"],
                                "lng": point_data["lng"],
                                "hazard_type": hazard_type,
                            }
                        )
                        break  # 一つのハザードで一致すれば次のポイントへ

        if dangerous_points:
            return {"status": "danger", "dangerous_points": dangerous_points}
        else:
            return {"status": "safe", "dangerous_points": []}

    except Exception as e:
        return {"status": "error", "message": str(e)}

# Flaskルート登録
@route_safety_service.route("/api/route-safety", methods=["POST"])
def api_route_safety():
    try:
        data = request.get_json()
        route_points = data.get("route", [])
        result = evaluate_route_safety(route_points)
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
