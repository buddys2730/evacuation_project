# services/route_check_service.py

import os
import requests
import json
from flask import Blueprint, jsonify, request
from dotenv import load_dotenv
from backend.services.db_connection import get_db_connection

# Blueprint 作成
route_check_service = Blueprint("route_check_service", __name__)

# ✅ 環境変数の読み込み
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"))


@route_check_service.route("/api/route_check", methods=["POST"])
def route_check():
    try:
        data = request.get_json()
        origin = data["origin"]
        destination = data["destination"]

        api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
        if not api_key:
            return jsonify({"error": "Google Maps APIキーが設定されていません"}), 500

        directions_url = (
            "https://maps.googleapis.com/maps/api/directions/json"
            f"?origin={origin['lat']},{origin['lng']}"
            f"&destination={destination['lat']},{destination['lng']}"
            f"&alternatives=true&key={api_key}"
        )
        response = requests.get(directions_url)
        directions = response.json()

        if directions["status"] != "OK":
            return (
                jsonify({"error": f"Google Maps APIエラー: {directions['status']}"}),
                500,
            )

        conn = get_db_connection()
        cur = conn.cursor()

        safe_routes = []
        blocked_routes = []

        for route in directions["routes"]:
            path_coords = []
            for leg in route["legs"]:
                for step in leg["steps"]:
                    lat = step["end_location"]["lat"]
                    lng = step["end_location"]["lng"]
                    path_coords.append((lng, lat))

            is_dangerous = False
            for lng, lat in path_coords:
                cur.execute(
                    """
                    SELECT 1 FROM hazard_zones
                    WHERE ST_Intersects(
                        geometry,
                        ST_SetSRID(ST_MakePoint(%s, %s), 4326)
                    )
                    LIMIT 1;
                """,
                    (lng, lat),
                )
                if cur.fetchone():
                    is_dangerous = True
                    break

            if is_dangerous:
                blocked_routes.append(route)
            else:
                safe_routes.append(route)

        cur.close()
        conn.close()

        if safe_routes:
            return jsonify({"status": "safe", "routes": safe_routes})
        elif blocked_routes:
            return jsonify({"status": "all_danger", "routes": blocked_routes})
        else:
            return jsonify({"status": "no_routes_found"})

    except Exception as e:
        print("❌ /api/route_check 例外:", e)
        ({"error": str(e)}), 500
