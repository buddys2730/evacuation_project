from flask import Blueprint, jsonify
from services.hazard_zone_service import get_all_hazard_zones

hazard_zones_bp = Blueprint("hazard_zones", __name__)


@hazard_zones_bp.route("/api/hazard-zones", methods=["GET"])
def get_hazard_zones():
    try:
        zones = get_all_hazard_zones()
        return jsonify({"status": "success", "hazard_zones": zones})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
