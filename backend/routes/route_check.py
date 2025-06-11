from flask import Blueprint, request, jsonify
from services.route_checker import check_route_safety

route_check_bp = Blueprint('route_check', __name__)

@route_check_bp.route('/api/route-check', methods=['POST'])
def route_check():
    try:
        data = request.get_json()
        origin = data.get("origin")
        destination = data.get("destination")

        if not origin or not destination:
            return jsonify({"error": "originとdestinationは必須です"}), 400

        result = check_route_safety(origin, destination)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
