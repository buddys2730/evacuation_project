from flask import Blueprint, request, jsonify
from sqlalchemy import or_
from database import db_session
from database.models import EvacuationCenter

search_bp = Blueprint("search", __name__)


@search_bp.route("/api/search", methods=["GET"])
def search_evacuation_centers():
    city = request.args.get("city", "")
    disaster = request.args.get("disaster", "")

    if not city and not disaster:
        return jsonify({"error": "検索条件が不足しています"}), 400

    query = db_session.query(EvacuationCenter)

    if city:
        query = query.filter(EvacuationCenter.city.ilike(f"%{city}%"))

    if disaster:
        # 複数の災害区分をカンマで分割して処理
        disaster_list = [d.strip() for d in disaster.split(",")]
        disaster_filters = [
            getattr(EvacuationCenter, d) == True
            for d in disaster_list
            if hasattr(EvacuationCenter, d)
        ]
        if disaster_filters:
            query = query.filter(or_(*disaster_filters))

    results = query.all()
    centers = [
        {
            "id": center.id,
            "name": center.name,
            "address": center.address,
            "lat": center.lat,
            "lng": center.lng,
            "city": center.city,
        }
        for center in results
    ]

    return jsonify(centers)
