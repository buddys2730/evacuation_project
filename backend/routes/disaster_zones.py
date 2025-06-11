# /Users/masashitakao/Desktop/evacuation_project/backend/routes/disaster_zones.py

from flask import Blueprint, request, jsonify
from sqlalchemy import func
from shapely.geometry import shape
from geoalchemy2.shape import to_shape
from models.disaster_zone_model import DisasterZone
from database import SessionLocal

bp = Blueprint("disaster_zones", __name__)

@bp.route("/api/disaster_zones")
def get_disaster_zones():
    session = SessionLocal()
    try:
        lat = float(request.args.get("lat"))
        lng = float(request.args.get("lng"))
        radius = float(request.args.get("radius", 1000))
        disaster_type = request.args.get("disaster_type", "")

        point = f"SRID=4326;POINT({lng} {lat})"

        query = session.query(DisasterZone).filter(
            func.ST_DWithin(DisasterZone.geometry, func.ST_GeomFromText(point, 4326), radius)
        )

        if disaster_type:
            query = query.filter(DisasterZone.category.ilike(f"%{disaster_type}%"))

        results = query.all()

        features = []
        for zone in results:
            geom = to_shape(zone.geometry)
            coordinates = [[list(coord) for coord in geom.exterior.coords]]
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": coordinates
                },
                "properties": {
                    "category": zone.category,
                    "source": zone.source,
                    "address": zone.address,
                    "prefecture": zone.prefecture,
                    "created_at": zone.created_at.isoformat()
                }
            })

        return jsonify({
            "type": "FeatureCollection",
            "features": features
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()
