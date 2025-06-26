from flask import Blueprint, request, jsonify
from services.hazard_zone_service import get_hazard_zones_by_city

hazard_zone_bp = Blueprint('hazard_zone', __name__)

@hazard_zone_bp.route('/api/hazard_zones', methods=['GET'])
def hazard_zones():
    city_name = request.args.get('city_name')
    if not city_name:
        return jsonify({'error': 'city_name is required'}), 400
    polygons = get_hazard_zones_by_city(city_name)
    return jsonify({'polygons': polygons})
