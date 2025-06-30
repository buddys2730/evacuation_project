# routes/user_supplies.py
from flask import Blueprint, request, jsonify
from sqlalchemy import desc
from database import db_session
from models import ShelterSupplies, Supplies, CrowdStatuses

user_supplies_bp = Blueprint("user_supplies_bp", __name__)

def get_new_session():
    # db_sessionはスレッド間安全でない場合があるので、毎回新規セッションを使う
    from sqlalchemy.orm import scoped_session, sessionmaker
    from database import engine
    return scoped_session(sessionmaker(bind=engine))

@user_supplies_bp.route("/api/supplies", methods=["GET"])
def user_get_supplies():
    shelter_id = request.args.get("shelter_id")
    if not shelter_id:
        return jsonify([])
    session = get_new_session()
    try:
        # 数値IDと文字列ID両対応
        try:
            int_shelter_id = int(shelter_id)
            q1 = session.query(ShelterSupplies).filter(ShelterSupplies.shelter_id == int_shelter_id)
            q2 = session.query(Supplies).filter(Supplies.shelter_id == shelter_id)
            results = list(q1.all()) + list(q2.all())
        except Exception:
            q2 = session.query(Supplies).filter(Supplies.shelter_id == shelter_id)
            results = list(q2.all())
        supplies = [
            dict(
                id=row.id,
                item_name=row.item_name,
                quantity=row.quantity,
                updated_at=row.updated_at.strftime("%Y-%m-%d") if row.updated_at else "",
            )
            for row in results
        ]
    finally:
        session.remove()
    return jsonify(supplies)

@user_supplies_bp.route("/api/crowd", methods=["GET"])
def user_get_crowd():
    shelter_id = request.args.get("shelter_id")
    session = get_new_session()
    try:
        q = session.query(CrowdStatuses).filter(CrowdStatuses.shelter_id == str(shelter_id)).order_by(desc(CrowdStatuses.updated_at))
        crowd = q.first()
        if not crowd:
            return jsonify({"crowd_level": ""})
        return jsonify({"crowd_level": crowd.crowd_level})
    finally:
        session.remove()
