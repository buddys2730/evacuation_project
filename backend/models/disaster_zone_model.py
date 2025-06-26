from sqlalchemy import Column, Integer, String, Text, DateTime, Numeric
from geoalchemy2 import Geometry
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class DisasterZone(Base):
    __tablename__ = "disaster_zones"
    id = Column(Integer, primary_key=True)
    geometry = Column(Geometry("POLYGON", srid=4326))
    category = Column(Text)
    disaster_type = Column(Text)
    detail_type = Column(Text)
    source = Column(Text)
    address = Column(Text)
    prefecture = Column(Text)
    city = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    water_depth = Column(Numeric, nullable=True)  # ★追加★
