# /Users/masashitakao/Desktop/evacuation_project/backend/routes/disaster_situations.py

from flask import Blueprint, request, jsonify
from services.disaster_situation_service import (
    register_disaster_situation,
    get_disaster_situations_dynamic
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
    # クエリパラメータ取得
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    date = request.args.get("date")
    # city/disaster_typeも追加したい場合ここで取得
    result = get_disaster_situations_dynamic(start_date, end_date, date)
    return jsonify(result), 200
