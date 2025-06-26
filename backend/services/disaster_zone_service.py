import sys
import os
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../database')))

from flask import Blueprint, jsonify, request
from database import db_session, HazardZone
from geoalchemy2.shape import to_shape
from sqlalchemy.sql import func
from geoalchemy2.functions import ST_DWithin, ST_GeomFromText
from db_connection import get_db_connection

disaster_zone_service = Blueprint("disaster_zone_service", __name__)
hazard_zone_service = Blueprint("hazard_zone_service", __name__)

# ✅ 1. 緯度経度・半径で災害ゾーン取得
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

# ✅ 2. 市町村単位でポリゴン取得
@hazard_zone_service.route("/api/hazard_zones/by_city", methods=["GET"])
def get_hazard_zones_by_city():
    city_name = request.args.get("city_name")
    category = request.args.get("category")  # Optional: 災害カテゴリで絞る

    if not city_name:
        return jsonify({"error": "city_name is required"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        # 市町村のジオメトリを取得し、その範囲に含まれるポリゴンを抽出
        sql = """
            SELECT hz.id, hz.category, ST_AsGeoJSON(hz.geometry)
            FROM hazard_zones hz
            JOIN city_master cm ON ST_Within(hz.geometry, cm.geom)
            WHERE cm.city_name = %s
        """
        params = [city_name]
        if category:
            sql += " AND hz.category LIKE %s"
            params.append(category + "%")
        sql += " LIMIT 1000"

        cur.execute(sql, params)
        rows = cur.fetchall()
        cur.close()
        conn.close()

        results = [
            {"id": row[0], "category": row[1], "geometry": json.loads(row[2])}
            for row in rows
        ]
        return jsonify(results)
    except Exception as e:
        print("❌ /api/hazard_zones/by_city 例外:", e)
        return jsonify({"error": str(e)}), 500
