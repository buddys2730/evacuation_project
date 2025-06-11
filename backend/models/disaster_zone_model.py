# /Users/masashitakao/Desktop/evacuation_project/backend/models/disaster_zone_model.py

from sqlalchemy import Column, Integer, String, DateTime
from geoalchemy2 import Geometry
from datetime import datetime
from database import Base

class DisasterZone(Base):
    __tablename__ = 'disaster_zones'

    id = Column(Integer, primary_key=True, autoincrement=True)
    geometry = Column(Geometry('POLYGON', srid=4326), nullable=False)
    category = Column(String, nullable=False)
    source = Column(String, nullable=True)
    address = Column(String, nullable=True)
    prefecture = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
