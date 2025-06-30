import os
import requests
from flask import Blueprint, jsonify, request
from dotenv import load_dotenv
from services.db_connection import get_db_connection

route_check_service = Blueprint("route_check_service", __name__)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"))

@route_check_service.route("/api/route_check", methods=["POST"])
def route_check():
    print("=== route_check: API CALLED ===")
    try:
        data = request.get_json()
        print("data受信:", data)
        origin = data["origin"]
        destination = data["destination"]
        mode = data.get("mode", "hazard")

        api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
        print("API KEY取得:", bool(api_key))
        if not api_key:
            print("APIキー未設定でreturn")
            return jsonify({"error": "Google Maps APIキーが設定されていません"}), 500

        directions_url = (
            "https://maps.googleapis.com/maps/api/directions/json"
            f"?origin={origin['lat']},{origin['lng']}"
            f"&destination={destination['lat']},{destination['lng']}"
            f"&alternatives=true&key={api_key}"
        )
        print("directions_url:", directions_url)
        response = requests.get(directions_url)
        directions = response.json()
        print("Google Directions status:", directions.get("status"))

        if directions["status"] != "OK":
            print("Google Directions NG:", directions)
            return (
                jsonify({"error": f"Google Maps APIエラー: {directions['status']}"}),
                500,
            )

        # --------- mode=noneは安全ルートとみなす（DB判定不要） ---------
        if mode == "none":
            print("mode=noneのためGoogle Directions経路のみ返却")
            return jsonify({
                "status": "safe",
                "routes": directions["routes"],
                "danger_reasons": []
            })

        conn = get_db_connection()
        cur = conn.cursor()

        safe_routes = []
        blocked_routes = []
        blocked_reasons = []

        for route in directions["routes"]:
            path_coords = []
            for leg in route["legs"]:
                for step in leg["steps"]:
                    lat = step["end_location"]["lat"]
                    lng = step["end_location"]["lng"]
                    path_coords.append((lng, lat))
                    print(f"経路点: lng={lng}, lat={lat}")

            is_dangerous = False
            danger_detail = None
            for lng, lat in path_coords:
                print(f"危険判定: lng={lng}, lat={lat}, mode={mode}")
                if mode == "hazard":
                    cur.execute(
                        """
                        SELECT id, category FROM hazard_zones
                        WHERE ST_Intersects(
                            geometry,
                            ST_SetSRID(ST_MakePoint(%s, %s), 4326)
                        )
                        LIMIT 1;
                        """,
                        (lng, lat),
                    )
                    hz = cur.fetchone()
                    print(f"  hazard_zones判定: POINT({lng} {lat}) => {hz}")
                    if hz:
                        is_dangerous = True
                        danger_detail = {
                            "type": "hazard_zones",
                            "id": hz[0],
                            "category": hz[1],
                            "lng": lng,
                            "lat": lat
                        }
                        break
                elif mode == "disaster":
                    # 必ずカラム名を「disaster_type」に修正!!
                    cur.execute(
                        """
                        SELECT id, disaster_type FROM disaster_situations
                        WHERE cleared_at IS NULL
                        AND geometry IS NOT NULL
                        AND ST_Intersects(
                            geometry,
                            ST_SetSRID(ST_MakePoint(%s, %s), 4326)
                        )
                        LIMIT 1;
                        """,
                        (lng, lat),
                    )
                    dz = cur.fetchone()
                    print(f"  disaster_situations判定: POINT({lng} {lat}) => {dz}")
                    if dz:
                        is_dangerous = True
                        danger_detail = {
                            "type": "disaster_situations",
                            "id": dz[0],
                            "disaster_type": dz[1],
                            "lng": lng,
                            "lat": lat
                        }
                        break

            print("is_dangerous最終判定:", is_dangerous)
            if is_dangerous:
                blocked_routes.append(route)
                blocked_reasons.append(danger_detail)
            else:
                safe_routes.append(route)

        cur.close()
        conn.close()

        print("safe_routes件数:", len(safe_routes))
        print("blocked_routes件数:", len(blocked_routes))

        if safe_routes:
            print("safe_routesありでreturn")
            return jsonify({
                "status": "safe",
                "routes": safe_routes,
                "danger_reasons": []
            })
        elif blocked_routes:
            print("blocked_routesのみでreturn")
            return jsonify({
                "status": "all_danger",
                "routes": blocked_routes,
                "danger_reasons": blocked_reasons
            })
        else:
            print("ルート見つからずreturn")
            return jsonify({
                "status": "no_routes_found",
                "routes": [],
                "danger_reasons": []
            })

    except Exception as e:
        print("❌ /api/route_check 例外:", e)
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500
