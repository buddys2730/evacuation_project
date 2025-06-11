from flask import Flask
from flask_cors import CORS

from backend.services.search_service import search_service
from backend.services.route_check_service import route_check_service
from backend.services.route_safety_service import route_safety_service
from backend.services.hazard_zone_service import hazard_zone_service
from backend.services.disaster_zone_service import disaster_zone_service
from backend.services.hazard_zone_service import hazard_zone_service, hazard_category_bp

app = Flask(__name__)
CORS(app)

# Blueprint 登録
app.register_blueprint(search_service)
app.register_blueprint(route_check_service)
app.register_blueprint(route_safety_service)
app.register_blueprint(hazard_zone_service)
app.register_blueprint(disaster_zone_service)
app.register_blueprint(hazard_category_bp)

if __name__ == '__main__':
    app.run(port=5001, debug=True)
