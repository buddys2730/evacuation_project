from flask import Blueprint, request, jsonify
from services.disaster_situation_service import (
    register_disaster_situation,
    get_disaster_situations_dynamic,
    update_disaster_situation_service,   # ← 追加
    get_active_disaster_situations_service,
)

bp = Blueprint('disaster_situations', __name__)

# POST: 災害状況の新規登録
@bp.route("/api/disaster_situations", methods=["POST"])
def post_disaster_situation():
    data = request.get_json()
    result = register_disaster_situation(data)
    if "id" in result:
        return jsonify(result), 201
    else:
        return jsonify(result), 400

# GET: 災害状況の一覧取得（動的フィルタ対応版）
@bp.route("/api/disaster_situations", methods=["GET"])
def get_disaster_situations():
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    date = request.args.get("date")
    result = get_disaster_situations_dynamic(start_date, end_date, date)
    return jsonify(result), 200

# PATCH: 災害状況の編集（ID指定）
@bp.route("/api/disaster_situations/<int:id>", methods=["PATCH"])
def patch_disaster_situation(id):
    data = request.get_json()
    result = update_disaster_situation_service(id, data)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result), 200

@bp.route("/api/disaster_situations/active", methods=["GET"])
def get_active_disaster_situations():
    result = get_active_disaster_situations_service()
    return jsonify(result), 200