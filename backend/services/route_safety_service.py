import json
from shapely.geometry import shape, Point
from backend.database.hazard_data_loader import load_all_hazard_polygons

def evaluate_route_safety(route_points):
    """
    避難ルートの安全性を評価する。

    Parameters:
    - route_points: [{"lat": ..., "lng": ...}, ...]

    Returns:
    - status: "safe" or "danger"
    - dangerous_points: [{lat, lng, hazard_type}]
    """
    try:
        hazard_polygons = load_all_hazard_polygons()
        dangerous_points = []

        for point_data in route_points:
            point = Point(point_data["lng"], point_data["lat"])  # Shapelyはlng, latの順
            for hazard_type, polygons in hazard_polygons.items():
                for polygon in polygons:
                    if polygon.contains(point):
                        dangerous_points.append({
                            "lat": point_data["lat"],
                            "lng": point_data["lng"],
                            "hazard_type": hazard_type
                        })
                        break  # 一つのハザードで一致すれば次のポイントへ

        if dangerous_points:
            return {
                "status": "danger",
                "dangerous_points": dangerous_points
            }
        else:
            return {
                "status": "safe",
                "dangerous_points": []
            }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
