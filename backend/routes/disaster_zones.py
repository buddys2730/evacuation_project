from flask import Blueprint, request, jsonify
from models.disaster_zone_model import DisasterZone
from database import SessionLocal
from geoalchemy2.shape import from_shape
from shapely.geometry import shape
from sqlalchemy.exc import SQLAlchemyError

bp = Blueprint("disaster_zones", __name__)

@bp.route("/api/disaster_zones", methods=["POST"])
def create_disaster_zone():
    """
    災害状況ポリゴンの新規登録API
    例: {
      "geometry": {...GeoJSON...},
      "category": "冠水",
      "disaster_type": "浸水",
      "water_depth": 1.5,
      "prefecture": "広島県",
      "city": "福山市",
      "source": "管理画面入力",
      "address": "〇〇町1-2-3"
    }
    """
    data = request.json
    session = SessionLocal()
    try:
        # GeoJSON→WKT(Shapely→GeoAlchemy2)
        geom = from_shape(shape(data["geometry"]), srid=4326)
        zone = DisasterZone(
            geometry=geom,
            category=data.get("category"),
            disaster_type=data.get("disaster_type"),
            detail_type=data.get("detail_type"),
            water_depth=data.get("water_depth"),
            prefecture=data.get("prefecture"),
            city=data.get("city"),
            source=data.get("source"),
            address=data.get("address"),
        )
        session.add(zone)
        session.commit()
        return jsonify({"id": zone.id}), 201
    except SQLAlchemyError as e:
        session.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()
