from flask import Blueprint, jsonify

bp = Blueprint("option_lists", __name__)

@bp.route("/api/cities", methods=["GET"])
def cities():
    # 固定リスト or DBから動的取得
    return jsonify([
        {"code": "34207", "name": "福山市"},
        {"code": "34208", "name": "尾道市"},
        # ...
    ])

@bp.route("/api/disaster-types", methods=["GET"])
def disaster_types():
    return jsonify(["洪水", "土砂", "高潮", "地震", "津波", "火事", "内水", "火山"])
