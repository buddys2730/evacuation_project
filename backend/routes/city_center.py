# backend/routes/city_center.py
from flask import Blueprint, request, jsonify
from database import get_db

city_center_bp = Blueprint("city_center", __name__)

@city_center_bp.route("/api/city-center", methods=["GET"])
def get_city_center():
    pref = request.args.get("pref")
    city = request.args.get("city")
    if not pref or not city:
        return jsonify({"error": "pref and city required"}), 400

    db = get_db()
    cur = db.cursor()
    # geometryからST_Centroidで中心座標を取得
    cur.execute(
        """
        SELECT ST_X(ST_Centroid(geometry)) AS lng, ST_Y(ST_Centroid(geometry)) AS lat
        FROM city_master
        WHERE prefecture = %s AND city = %s AND geometry IS NOT NULL
        LIMIT 1
        """,
        (pref, city)
    )
    row = cur.fetchone()
    cur.close()
    if not row or row[0] is None or row[1] is None:
        return jsonify({"error": "not found"}), 404
    return jsonify({"lat": row[1], "lng": row[0]})
