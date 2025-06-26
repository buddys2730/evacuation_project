from flask import Blueprint, jsonify, request
from sqlalchemy import desc, cast, String, Integer
from database import db_session
from models import (
    DesignatedShelters, EmergencyShelters,
    ShelterSupplies, Supplies,
    CrowdStatuses
)

bp = Blueprint("admin_supplies", __name__, url_prefix="/api/admin")

# 検索API（指定避難所・緊急避難所で切り替え）
@bp.route("/shelters", methods=["GET"])
def get_admin_shelters():
    try:
        pref = request.args.get("pref")
        city = request.args.get("city")
        shelter_type = request.args.get("type", "指定避難所")  # デフォルト

        if shelter_type == "緊急避難所":
            q = db_session.query(EmergencyShelters)
            if pref:
                q = q.filter(EmergencyShelters.pref == pref)
            if city:
                q = q.filter(EmergencyShelters.city == city)
            q = q.order_by(EmergencyShelters.name)
            result = [
                dict(
                    id=row.id,
                    name=row.name,
                    address=row.address,
                    elevation=row.elevation,
                    shelter_type="緊急避難所",
                    pref=row.pref,
                    city=row.city,
                )
                for row in q.all()
            ]
        else:
            q = db_session.query(DesignatedShelters)
            if pref:
                q = q.filter(DesignatedShelters.pref == pref)
            if city:
                q = q.filter(DesignatedShelters.city == city)
            q = q.order_by(DesignatedShelters.name)
            result = [
                dict(
                    id=row.id,
                    name=row.name,
                    address=row.address,
                    elevation=row.elevation,
                    shelter_type="指定避難所",
                    pref=row.pref,
                    city=row.city,
                )
                for row in q.all()
            ]
        db_session.close()
        return jsonify(result)
    except Exception as e:
        db_session.rollback()
        print(f"[admin_shelters error] {e}")
        return jsonify({"error": str(e)}), 500

# 物資GET（両タイプ対応）
@bp.route("/supplies", methods=["GET"])
def get_admin_supplies():
    try:
        shelter_id = request.args.get("shelter_id")
        # まずintに変換できれば指定避難所と判断、できなければ緊急避難所
        supplies = []
        try:
            int_shelter_id = int(shelter_id)
            q = db_session.query(ShelterSupplies).filter(ShelterSupplies.shelter_id == int_shelter_id)
            supplies = [
                dict(
                    id=row.id,
                    item_name=row.item_name,
                    quantity=row.quantity,
                    updated_at=row.updated_at.strftime("%Y-%m-%d") if row.updated_at else "",
                )
                for row in q.all()
            ]
        except ValueError:
            # 文字列なら緊急避難所
            q = db_session.query(Supplies).filter(Supplies.shelter_id == shelter_id)
            supplies = [
                dict(
                    id=row.id,
                    item_name=row.item_name,
                    quantity=row.quantity,
                    updated_at=row.updated_at.strftime("%Y-%m-%d") if row.updated_at else "",
                )
                for row in q.all()
            ]
        db_session.close()
        return jsonify(supplies)
    except Exception as e:
        db_session.rollback()
        print(f"[admin_supplies error] {e}")
        return jsonify({"error": str(e)}), 500

# 混雑度GET（両タイプ対応）
@bp.route("/crowd", methods=["GET"])
def get_admin_crowd():
    try:
        shelter_id = request.args.get("shelter_id")
        q = db_session.query(CrowdStatuses).filter(CrowdStatuses.shelter_id == str(shelter_id)).order_by(desc(CrowdStatuses.updated_at))
        crowd = q.first()
        db_session.close()
        if not crowd:
            return jsonify({"crowd_level": ""})
        return jsonify({"crowd_level": crowd.crowd_level})
    except Exception as e:
        db_session.rollback()
        print(f"[admin_crowd error] {e}")
        return jsonify({"error": str(e)}), 500

# 混雑度POST
@bp.route("/crowd", methods=["POST"])
def post_admin_crowd():
    try:
        data = request.json
        shelter_id = str(data["shelter_id"])
        crowd_level = data["crowd_level"]
        from datetime import datetime
        new_crowd = CrowdStatuses(
            shelter_id=shelter_id,
            crowd_level=crowd_level,
            updated_at=datetime.now()
        )
        db_session.add(new_crowd)
        db_session.commit()
        return jsonify({"status": "ok"})
    except Exception as e:
        db_session.rollback()
        print(f"[post_admin_crowd error] {e}")
        return jsonify({"error": str(e)}), 500

# 必要物資 POST/PUT/DELETE（両テーブル自動切替・簡略例）
@bp.route("/supplies", methods=["POST", "PUT", "DELETE"])
def manage_supplies():
    try:
        data = request.json
        shelter_id = data.get("shelter_id")
        supply_id = data.get("supply_id")
        item_name = data.get("item_name")
        quantity = data.get("quantity")
        from datetime import datetime

        # shelter_id型判定（POST時はshelter_id必須、PUT/DELETE時はsupply_id必須）
        target_table = None
        if shelter_id is not None:
            try:
                int(shelter_id)
                target_table = ShelterSupplies
            except Exception:
                target_table = Supplies
        elif supply_id:
            # 既存物資の更新・削除時は supply_id から該当テーブル推測
            row = db_session.query(ShelterSupplies).filter(ShelterSupplies.id == supply_id).first()
            if row:
                target_table = ShelterSupplies
            else:
                target_table = Supplies
        else:
            raise Exception("shelter_idまたはsupply_idが必要")

        if request.method == "POST":
            new_supply = target_table(
                shelter_id=shelter_id,
                item_name=item_name,
                quantity=quantity,
                updated_at=datetime.now()
            )
            db_session.add(new_supply)
            db_session.commit()
            return jsonify({
                "id": new_supply.id,
                "item_name": new_supply.item_name,
                "quantity": new_supply.quantity,
                "updated_at": new_supply.updated_at.strftime("%Y-%m-%d") if new_supply.updated_at else ""
            })
        elif request.method == "PUT":
            row = db_session.query(target_table).filter(target_table.id == supply_id).first()
            if not row:
                return jsonify({"error": "Not found"}), 404
            row.quantity = quantity
            row.updated_at = datetime.now()
            db_session.commit()
            return jsonify({"status": "ok"})
        elif request.method == "DELETE":
            row = db_session.query(target_table).filter(target_table.id == supply_id).first()
            if not row:
                return jsonify({"error": "Not found"}), 404
            db_session.delete(row)
            db_session.commit()
            return jsonify({"status": "ok"})
    except Exception as e:
        db_session.rollback()
        print(f"[manage_supplies error] {e}")
        return jsonify({"error": str(e)}), 500
