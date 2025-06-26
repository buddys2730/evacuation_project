from flask import Blueprint, request, jsonify
from services.db_connection import get_db_connection
import unicodedata

city_bp = Blueprint("city_bp", __name__)

@city_bp.route("/api/cities", methods=["GET"])
def get_cities():
    print("★★ city_routes.get_cities 実行 ★★")
    pref = request.args.get("pref", "")

    # デバッグ：リクエスト値（不可視文字もreprで表示）
    print(f"[DEBUG] リクエストpref = [{repr(pref)}]")

    if not pref or not pref.strip():
        print("[WARNING] 都道府県が未入力 or 空値")
        return jsonify({"cities": []})

    # 全角・半角・不可視文字・末尾空白除去＋NFC正規化
    pref_norm = unicodedata.normalize('NFC', pref).strip()
    print(f"[DEBUG] 正規化済みpref(NFC) = [{repr(pref_norm)}]")

    # DB値も念のため全部取得してrepr比較用にダンプ
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT DISTINCT prefecture FROM city_master WHERE prefecture IS NOT NULL")
        db_prefs = [row[0] for row in cur.fetchall()]
        db_prefs_repr = [repr(s) for s in db_prefs]
        print(f"[DEBUG] DB都道府県一覧 = {db_prefs_repr}")

        # prefecture完全一致検索
        cur.execute(
            "SELECT city, ward, city_code FROM city_master WHERE prefecture = %s",
            (pref_norm,)
        )
        rows = cur.fetchall()
        print(f"[DEBUG] prefecture一致ヒット件数: {len(rows)}")
    except Exception as e:
        print(f"[ERROR] SQL失敗: {e}")
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()
        return jsonify({"cities": []}), 500

    cur.close()
    conn.close()

    # レコード0件の場合、入力値・DB値を1件ずつrepr比較で差分表示
    if len(rows) == 0:
        for db_val in db_prefs:
            if pref_norm == db_val:
                print(f"[DEBUG] 一致: {repr(pref_norm)} == {repr(db_val)}")
            else:
                print(f"[DEBUG] 不一致: {repr(pref_norm)} != {repr(db_val)}")
        print("[WARNING] prefecture完全一致0件、要調査")

    # 重複排除しつつ「name」「code」形式で返却
    unique_cities = set()
    result = []
    for city, ward, code in rows:
        name = city
        if ward and ward.strip():
            name = f"{city} {ward}"
        if name not in unique_cities:
            unique_cities.add(name)
            result.append({"name": name, "code": code})

    print(f"[DEBUG] レスポンス: {result}")
    return jsonify({"cities": result})
