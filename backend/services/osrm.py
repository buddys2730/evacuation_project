# /backend/services/osrm.py
import requests

def get_route_osrm(start, end):
    """
    start, end: [lng, lat]
    道路ルート探索（OSRMデモAPI利用）
    """
    try:
        osrm_url = (
            f"http://router.project-osrm.org/route/v1/driving/"
            f"{start[0]},{start[1]};{end[0]},{end[1]}"
            f"?overview=full&geometries=geojson"
        )
        resp = requests.get(osrm_url)
        resp.raise_for_status()
        data = resp.json()
        coords = data["routes"][0]["geometry"]["coordinates"]
        return coords  # [ [lng, lat], ... ]
    except Exception as e:
        print("OSRMリクエスト失敗:", e)
        return [start, end]  # 失敗時は直線
