from models import db
from sqlalchemy.dialects.postgresql import VARCHAR
from geoalchemy2 import Geometry


class HazardZone(db.Model):
    __tablename__ = "hazard_zones"

    id = db.Column(db.Integer, primary_key=True)
    disaster_type = db.Column(VARCHAR(50), nullable=False)
    geom = db.Column(Geometry("POLYGON", srid=4326), nullable=False)
