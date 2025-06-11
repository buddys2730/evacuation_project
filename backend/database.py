# /Users/masashitakao/Desktop/evacuation_project/backend/database.py

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session
from geoalchemy2 import Geometry
import datetime
import os

Base = declarative_base()

# 変更済みの HazardZone モデル
class HazardZone(Base):
    __tablename__ = "hazard_zones"

    id = Column(Integer, primary_key=True)
    geometry = Column(Geometry("POLYGON", srid=4326))
    category = Column(Text)
    disaster_type = Column(Text)      # ✅ 追加済み
    detail_type = Column(Text)        # ✅ 追加済み
    source = Column(Text)
    address = Column(Text)
    prefecture = Column(Text)
    city = Column(Text)               # ✅ 追加済み
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    prefecture_id = Column(Integer)

# データベース接続
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/evacuation_db")
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = scoped_session(sessionmaker(bind=engine))
db_session = SessionLocal
