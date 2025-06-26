# /backend/routes/route.py

from flask import Blueprint, request, jsonify
from services.route_service import get_route_with_hazard_check

route_bp = Blueprint('route', __name__)

@route_bp.route('/api/route', methods=['POST'])
def route():
    """
    ルート探索＆ハザード・通行止めチェックAPI
    リクエストJSON: { "start": [lng, lat], "end": [lng, lat], ... , "avoid_danger": true, "user_location": [lng, lat] }
    """
    data = request.json
    start = data.get("start")
    end = data.get("end")
    disaster_type = data.get("disaster_type", None)
    category = data.get("category")
    center = data.get("center")
    radius_km = data.get("radius_km")
    prefecture = data.get("prefecture")
    avoid_danger = data.get("avoid_danger", False)
    user_location = data.get("user_location")
    if not start or not end or not disaster_type or not category or not center or not radius_km or not prefecture:
        return jsonify({"error": "必要なパラメータが不足しています"}), 400
    route_info = get_route_with_hazard_check(
        start, end, disaster_type, category, center, radius_km, prefecture,
        avoid_danger=avoid_danger, user_location=user_location
    )
    return jsonify(route_info)
