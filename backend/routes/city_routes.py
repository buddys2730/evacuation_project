from flask import Blueprint, request, jsonify
from services.db_connection import get_db_connection
import unicodedata

city_bp = Blueprint("city_bp", __name__)

@city_bp.route("/api/cities", methods=["GET"])
def get_cities():
    import unicodedata
    pref = request.args.get("prefecture") or request.args.get("pref", "")
    pref_norm = unicodedata.normalize('NFC', pref).strip()
    print(f"[DEBUG] PREF: {repr(pref_norm)}")
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT DISTINCT city FROM designated_shelters
            WHERE pref = %s AND city IS NOT NULL AND city <> ''
            ORDER BY city;
        """, (pref_norm,))
        rows = cur.fetchall()
        print(f"[DEBUG] rows: {rows}")
        cur.close()
        conn.close()
        result = [{"name": r[0], "code": r[0]} for r in rows if r[0]]
        return jsonify({"cities": result})
    except Exception as e:
        print(f"[ERROR] {e}")
        return jsonify({"cities": []}), 500

