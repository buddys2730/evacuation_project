import os
from dotenv import load_dotenv

# .envをまず最初に明示的に読み込む
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
print("dotenv_path:", dotenv_path)
load_dotenv(dotenv_path=dotenv_path, override=True)

print("==== 環境変数の一部 ====")
print("PG_DBNAME:", os.getenv("PG_DBNAME"))
print("PG_USER:", os.getenv("PG_USER"))
print("PG_PASSWORD:", os.getenv("PG_PASSWORD"))
print("PG_HOST:", os.getenv("PG_HOST"))
print("PG_PORT:", os.getenv("PG_PORT"))
print("=====================")

from flask import Flask
from flask_cors import CORS

# 必要なBlueprintをimport
from services.search_service import search_service
from services.route_check_service import route_check_service
from services.route_safety_service import route_safety_service
from services.disaster_zone_service import disaster_zone_service
from services.hazard_zone_service import hazard_zone_service, hazard_category_bp
from services.hazard_polygons_service import hazard_polygons_service
from routes.hazard_polygons import hazard_polygons_bp
from routes.route_service import route_service
from routes.city_routes import city_bp
from routes.city_center import city_center_bp
from routes.admin_supplies import bp as admin_supplies_bp
from routes.master_data import master_data_bp
from routes.disaster_situations import bp as disaster_situations_bp
from routes.user_supplies import user_supplies_bp

app = Flask(__name__)

# ここで「JSONをUTF-8のまま返す」設定を追加
app.config['JSON_AS_ASCII'] = False
try:
    app.json.ensure_ascii = False
except Exception:
    pass  # Flaskのバージョンによっては属性がない場合がある

# Cloudflare Tunnel・ローカル両対応 CORS完全許可
CORS(
    app,
    origins="*",
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]  # ← PATCHを必ず追加
)

# Blueprint登録（「/api/cities」競合回避のためcity_bpを一番最後にする）
app.register_blueprint(search_service)
app.register_blueprint(route_check_service)
app.register_blueprint(route_safety_service)
app.register_blueprint(disaster_zone_service)
app.register_blueprint(hazard_category_bp)
# app.register_blueprint(hazard_polygons_service)
app.register_blueprint(hazard_polygons_bp)
app.register_blueprint(route_service)
app.register_blueprint(hazard_zone_service)    # city_bpの前
app.register_blueprint(city_bp)                # 必ず一番最後
app.register_blueprint(admin_supplies_bp)
app.register_blueprint(master_data_bp)
app.register_blueprint(city_center_bp)
app.register_blueprint(disaster_situations_bp)
app.register_blueprint(user_supplies_bp)

# 健康チェックやトップページ確認用ルート（必要なら追加）
@app.route("/")
def index():
    return "Flask backend is running. (Evacuation Project)"

if __name__ == "__main__":
    print("==== Flask ルート一覧 ====")
    print(app.url_map)
    print("=========================")
    app.run(host="0.0.0.0", port=5001, debug=True)
