from flask import Blueprint, request, jsonify
from services.route_safety_service import evaluate_route_safety

route_safety_bp = Blueprint("route_safety", __name__)


@route_safety_bp.route("/api/route-safety", methods=["POST"])
def check_route_safety():
    try:
        data = request.get_json()
        if not data or "route" not in data:
            return jsonify({"status": "error", "message": "Missing 'route' data"}), 400

        result = evaluate_route_safety(data["route"])
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
