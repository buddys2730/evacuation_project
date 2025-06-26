# /backend/routes/search_routes.py
from flask import Blueprint, request, jsonify
from services.search_service import search_evacuation_centers

search_bp = Blueprint('search', __name__)

@search_bp.route('/api/search', methods=['GET'])
def search():
    prefecture = request.args.get("prefecture")
    city = request.args.get("city")
    disaster_type = request.args.get("disasterType")
    # 他のクエリパラメータも必要なら取得

    result = search_evacuation_centers(
        prefecture=prefecture,
        city=city,
        disaster_type=disaster_type,
        # 他のパラメータ
    )
    return jsonify(result)
