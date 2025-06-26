# /Users/masashitakao/Desktop/evacuation_project/backend/routes/route_service.py

from flask import Blueprint, request, jsonify, make_response
from services.route_service import get_route_with_hazard_check

route_service = Blueprint('route_service', __name__)

@route_service.route('/api/route', methods=['POST', 'OPTIONS'])
def api_route():
    # --- 1. プリフライト（OPTIONS）リクエスト対応 ---
    if request.method == "OPTIONS":
        response = make_response('', 204)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    # --- 2. Content-Typeチェック ---
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415

    try:
        data = request.get_json()
        start = data.get("start")
        end = data.get("end")
        disaster_type = data.get("disaster_type", "洪水")
        category = data.get("category") or disaster_type  # 未指定なら自動補完
        center = data.get("center")
        radius_km = data.get("radius_km")
        prefecture = data.get("prefecture")

        # 必須チェックはstart/endだけ（ほかは空でもOK！）
        if not (start and end):
            return jsonify({"error": "start, end は必須"}), 400

        # centerがなければ自動でルートの中間点を使う（できれば）
        if not center and start and end:
            lng = (start[0] + end[0]) / 2
            lat = (start[1] + end[1]) / 2
            center = [lng, lat]
        if not radius_km:
            radius_km = 2  # デフォルト2km
        if not prefecture:
            prefecture = None  # 省略可

        result = get_route_with_hazard_check(
            start, end, disaster_type, category, center, radius_km, prefecture
        )
        return jsonify(result)
    except Exception as e:
        print("❌ /api/route error:", e)
        return jsonify({"error": str(e)}), 500
