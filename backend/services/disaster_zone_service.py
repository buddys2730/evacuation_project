from flask import Blueprint, jsonify, request
from database import db_session, HazardZone
from geoalchemy2.shape import to_shape
from sqlalchemy.sql import func
from geoalchemy2.functions import ST_DWithin, ST_GeomFromText
from backend.database.db_connection import get_db_connection

disaster_zone_service = Blueprint("disaster_zone_service", __name__)


@disaster_zone_service.route("/api/disaster_zones", methods=["GET"])
def get_disaster_zones():
    try:
        lat_param = request.args.get("lat")
        lng_param = request.args.get("lng")
        radius_param = request.args.get("radius", "1000")
        disaster_type = request.args.get("disaster_type", "")

        if not lat_param or not lng_param:
            return jsonify({"error": "lat, lng は必須です"}), 400

        try:
            lat = float(lat_param)
            lng = float(lng_param)
            radius = float(radius_param)
        except ValueError:
            return (
                jsonify({"error": "lat, lng, radius は数値である必要があります"}),
                400,
            )

        point = f"SRID=4326;POINT({lng} {lat})"

        query = db_session.query(HazardZone).filter(
            ST_DWithin(HazardZone.geometry, func.ST_GeomFromText(point, 4326), radius)
        )

        if disaster_type:
            query = query.filter(HazardZone.disaster_type.ilike(f"%{disaster_type}%"))

        results = query.all()

        features = []
        for zone in results:
            geom = to_shape(zone.geometry)
            coordinates = [[list(coord) for coord in geom.exterior.coords]]
            features.append(
                {
                    "type": "Feature",
                    "geometry": {"type": "Polygon", "coordinates": coordinates},
                    "properties": {
                        "category": zone.category,
                        "source": zone.source,
                        "address": zone.address,
                        "prefecture": zone.prefecture,
                        "created_at": zone.created_at.isoformat(),
                    },
                }
            )

        return jsonify({"type": "FeatureCollection", "features": features})

    except Exception as e:
        print("❌ /api/disaster_zones 例外:", e)
        return jsonify({"error": str(e)}), 500
