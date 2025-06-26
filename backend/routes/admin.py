from flask import Blueprint, request, jsonify
from backend.database import get_db

bp = Blueprint('admin', __name__)

@bp.route("/api/admin/shelters")
def admin_shelters():
    pref = request.args.get('pref')
    city = request.args.get('city')
    db = get_db()
    rows = db.execute(
        "SELECT id, name, address FROM designated_shelters WHERE pref=? AND city=?",
        (pref, city)
    ).fetchall()
    return jsonify([dict(row) for row in rows])

@bp.route("/api/admin/supplies")
def admin_supplies():
    shelter_id = request.args.get("shelter_id")
    db = get_db()
    rows = db.execute(
        "SELECT id, item_name, quantity FROM shelter_supplies WHERE CAST(shelter_id AS TEXT)=?",
        (shelter_id,)
    ).fetchall()
    return jsonify([dict(row) for row in rows])

@bp.route("/api/admin/crowd")
def admin_crowd():
    shelter_id = request.args.get("shelter_id")
    db = get_db()
    row = db.execute(
        "SELECT crowd_level FROM crowd_statuses WHERE shelter_id=? ORDER BY updated_at DESC LIMIT 1",
        (shelter_id,)
    ).fetchone()
    return jsonify({"crowd_level": row["crowd_level"] if row else ""})

@bp.route("/api/admin/crowd", methods=["POST"])
def admin_crowd_update():
    data = request.get_json()
    db = get_db()
    db.execute(
        "INSERT INTO crowd_statuses (shelter_id, crowd_level, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
        (data["shelter_id"], data["crowd_level"])
    )
    db.commit()
    return jsonify({"result": "ok"})
