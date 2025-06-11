# database/hazard_data_loader.py

import psycopg2
import os
from shapely import wkb
from collections import defaultdict
from dotenv import load_dotenv

# .env を読み込み
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, "backend/.env"))

def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv("PG_DBNAME"),
        user=os.getenv("PG_USER"),
        password=os.getenv("PG_PASSWORD"),
        host=os.getenv("PG_HOST"),
        port=os.getenv("PG_PORT")
    )

def load_all_hazard_polygons():
    conn = get_db_connection()
    cur = conn.cursor()
    
    query = """
        SELECT category, ST_AsBinary(geometry)
        FROM hazard_zones
        WHERE geometry IS NOT NULL;
    """
    cur.execute(query)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    hazard_polygons = defaultdict(list)

    for category, geom_wkb in rows:
        polygon = wkb.loads(geom_wkb, hex=False)
        hazard_polygons[category].append(polygon)

    return hazard_polygons
