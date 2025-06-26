from services.hazard_zone_service import get_hazard_polygons
from services.road_closure_service import get_road_closures
from services.osrm import get_route_osrm
from shapely.geometry import LineString, shape
from database import db_session  # 避難所検索のため
from models import DesignatedShelters  # テーブル名に応じて調整

def get_route_with_hazard_check(
    start, end, disaster_type, category, center=None, radius_km=None, prefecture=None, avoid_danger=False, user_location=None
):
    # OSRMで経路探索（start, end = [lng, lat]）
    route_coords = get_route_osrm(start, end)
    route_line = LineString(route_coords)

    # ハザード＆通行止め
    hazards = get_hazard_polygons(
        disaster_type=disaster_type,
        category=category,
        center=center,
        radius_km=radius_km,
        prefecture=prefecture,
    )
    closures = get_road_closures()
    hazard_polygons = [shape(hz["geometry"]) for hz in hazards]

    # ルートを「危険区間／安全区間」ごとに分割
    sections = []
    current_section = []
    in_danger = None

    for i in range(len(route_coords) - 1):
        p1 = route_coords[i]
        p2 = route_coords[i + 1]
        seg = LineString([p1, p2])
        danger = any(poly.intersects(seg) for poly in hazard_polygons)
        if in_danger is None:
            current_section = [p1]
            in_danger = danger
        if danger == in_danger:
            current_section.append(p2)
        else:
            sections.append({
                "danger": in_danger,
                "coords": current_section.copy()
            })
            current_section = [p1, p2]
            in_danger = danger
    if current_section:
        sections.append({
            "danger": in_danger,
            "coords": current_section.copy()
        })

    # 通行止め判定
    is_blocked = False
    closure_sections = []
    for cls in closures:
        polygon = shape(cls["geometry"])
        intersects = polygon.intersects(route_line)
        if intersects:
            inter = polygon.intersection(route_line)
            coords = list(inter.coords) if hasattr(inter, "coords") else []
            if coords:
                is_blocked = True
                closure_sections.append({
                    "closure_id": cls.get("id"),
                    "reason": cls.get("reason", ""),
                    "section": coords
                })

    # ◆◆【超厳格：danger区間1つでもあれば絶対"danger"、blockあれば"blocked"】
    has_danger_section = any(sec["danger"] for sec in sections)
    status = "blocked" if is_blocked else ("danger" if has_danger_section else "safe")
    recommendation = (
        "通行止め区間あり" if is_blocked else
        "危険エリアを通過します。迂回推奨" if has_danger_section else
        "安全なルートです"
    )

    # ▼▼▼【追加】通行止め時に到達可能な避難所リスト探索▼▼▼
    alternate_shelters = []
    if status == "blocked" and user_location:
        lat, lng = user_location[1], user_location[0]
        sql = """
        SELECT id, name, latitude, longitude
        FROM designated_shelters
        WHERE ST_DWithin(
            geography(ST_SetSRID(ST_MakePoint(longitude, latitude),4326)),
            geography(ST_SetSRID(ST_MakePoint(:lng, :lat),4326)),
            :distance_m
        )
        """
        result = db_session.execute(sql, {"lng": lng, "lat": lat, "distance_m": 3000})
        for row in result.fetchall():
            shelter = dict(row._mapping)
            # それぞれの避難所へのルート探索→danger/blockedをチェック
            shelter_route_coords = get_route_osrm(user_location, [shelter["longitude"], shelter["latitude"]])
            shelter_route_line = LineString(shelter_route_coords)
            # ▼危険判定をもう一度厳密に（1つでも通るなら除外！）
            is_blocked_alt = False
            has_danger_alt = False
            # ハザードエリア
            for poly in hazard_polygons:
                if poly.intersects(shelter_route_line):
                    has_danger_alt = True
                    break
            # 通行止めエリア
            for cls2 in closures:
                poly2 = shape(cls2["geometry"])
                if poly2.intersects(shelter_route_line):
                    is_blocked_alt = True
                    break
            if not is_blocked_alt and not has_danger_alt:
                alternate_shelters.append({
                    "id": shelter["id"],
                    "name": shelter["name"],
                    "latitude": shelter["latitude"],
                    "longitude": shelter["longitude"],
                })
    # ▲▲▲ 追加ここまで ▲▲▲

    return {
        "route": route_coords,
        "sections": sections,
        "road_closures": closure_sections,
        "recommendation": recommendation,
        "status": status,
        "alternate_shelters": alternate_shelters
    }
