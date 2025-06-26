# /Users/masashitakao/Desktop/evacuation_project/backend/services/disaster_situation_service.py

import json
from datetime import datetime
from database import db_session
from sqlalchemy import text

def register_disaster_situation(data):
    try:
        from models import DisasterSituation
        from shapely.geometry import shape
        from geoalchemy2.shape import from_shape

        disaster = DisasterSituation(
            disaster_type = data.get("disaster_type"),
            danger_level  = data.get("danger_level"),
            depth_m       = data.get("depth_m"),
            is_closed     = data.get("is_closed"),
            occurred_at   = data.get("occurred_at"),
            cleared_at    = data.get("cleared_at"),
            comment       = data.get("comment"),
            image_url     = data.get("image_url"),
            created_at    = datetime.now(),
            updated_at    = datetime.now()
        )

        # geometry: GeoJSON→WKB化
        if "geometry" in data and data["geometry"]:
            shapely_geom = shape(data["geometry"])
            disaster.geometry = from_shape(shapely_geom, srid=4326)

        db_session.add(disaster)
        db_session.commit()
        return {"id": disaster.id}
    except Exception as e:
        db_session.rollback()
        return {"error": str(e)}

def get_all_disaster_situations():
    sql = text("""
        SELECT id, disaster_type, danger_level, depth_m, is_closed, occurred_at, cleared_at, comment, image_url,
               created_at, updated_at,
               ST_AsGeoJSON(geometry) AS geometry
        FROM disaster_situations
        ORDER BY occurred_at DESC, id DESC
    """)
    rows = db_session.execute(sql).fetchall()
    result = []
    for row in rows:
        # row._mappingでdict化
        d = dict(row._mapping)
        # geometry列: GeoJSON（NoneならNone）
        d["geometry"] = json.loads(d["geometry"]) if d["geometry"] else None
        # 日付列: ISO形式文字列
        for key in ["occurred_at", "cleared_at", "created_at", "updated_at"]:
            val = d.get(key)
            if isinstance(val, datetime):
                d[key] = val.isoformat()
            elif val is None:
                d[key] = None
        result.append(d)
    return result

def get_disaster_situations_dynamic(start_date=None, end_date=None, date=None):
    """
    start_date, end_date: 範囲内のもの
    date: その日時点で有効なもの（タイムラプス用）
    """
    sql = """
        SELECT id, disaster_type, danger_level, depth_m, is_closed, occurred_at, cleared_at, comment, image_url,
               created_at, updated_at,
               ST_AsGeoJSON(geometry) AS geometry
        FROM disaster_situations
        WHERE 1=1
    """
    params = {}

    if date:
        sql += " AND occurred_at <= :date AND (cleared_at IS NULL OR cleared_at >= :date)"
        params["date"] = date
    else:
        if start_date:
            sql += " AND (occurred_at >= :start_date OR (cleared_at IS NOT NULL AND cleared_at >= :start_date))"
            params["start_date"] = start_date
        if end_date:
            sql += " AND (occurred_at <= :end_date OR (cleared_at IS NOT NULL AND cleared_at <= :end_date))"
            params["end_date"] = end_date

    sql += " ORDER BY occurred_at DESC, id DESC"

    rows = db_session.execute(text(sql), params).fetchall()
    result = []
    for row in rows:
        d = dict(row._mapping)
        d["geometry"] = json.loads(d["geometry"]) if d["geometry"] else None
        for key in ["occurred_at", "cleared_at", "created_at", "updated_at"]:
            val = d.get(key)
            if isinstance(val, datetime):
                d[key] = val.isoformat()
            elif val is None:
                d[key] = None
        result.append(d)
    return result