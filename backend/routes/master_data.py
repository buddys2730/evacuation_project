from flask import Blueprint, jsonify, request
from sqlalchemy import text
import unicodedata
from database import get_db_session

master_data_bp = Blueprint('master_data_bp', __name__)

@master_data_bp.route('/api/prefectures', methods=['GET'])
def get_prefectures():
    db = get_db_session()
    # city_masterテーブルから正規化して抽出
    rows = db.execute(
        text("SELECT DISTINCT prefecture FROM city_master WHERE prefecture IS NOT NULL AND prefecture <> '' ORDER BY prefecture")
    ).fetchall()
    # NFC正規化して返却（不可視文字対策）
    prefectures = [
        unicodedata.normalize('NFC', row[0]).strip() if isinstance(row[0], str) else row[0]
        for row in rows
    ]
    return jsonify(prefectures)

@master_data_bp.route('/api/cities', methods=['GET'])
def get_cities():
    pref = request.args.get('pref', "")
    if not pref or not pref.strip():
        return jsonify([]), 400
    # 必ずNFC正規化
    pref_norm = unicodedata.normalize('NFC', pref).strip()
    db = get_db_session()
    rows = db.execute(
        text("SELECT DISTINCT city FROM city_master WHERE prefecture=:pref AND city IS NOT NULL AND city <> '' ORDER BY city"),
        {"pref": pref_norm}
    ).fetchall()
    # 市町村名もNFC正規化して返却
    cities = [
        unicodedata.normalize('NFC', row[0]).strip() if isinstance(row[0], str) else row[0]
        for row in rows
    ]
    return jsonify(cities)
