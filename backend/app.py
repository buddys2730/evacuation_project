from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

# .env 読み込み
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"))

# Blueprint の読み込み
from routes.search import search_bp
from routes.route_check import route_check_bp
from routes.hazard_zones import hazard_zones_bp
from routes.route_safety import route_safety_bp
from database import db_session

app = Flask(__name__)
CORS(app, origins="*")  # ← ★★ これに変更（固定originの代わり）

# Blueprint登録
app.register_blueprint(search_bp)
app.register_blueprint(route_check_bp)
app.register_blueprint(hazard_zones_bp)
app.register_blueprint(route_safety_bp)


# セッション終了処理
@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()


if __name__ == "__main__":
    app.run(port=5001, debug=True)
