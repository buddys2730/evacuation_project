from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session
from geoalchemy2 import Geometry
import datetime
import os
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else:
    load_dotenv()

Base = declarative_base()

# HazardZone モデル
class HazardZone(Base):
    __tablename__ = "hazard_zones"

    id = Column(Integer, primary_key=True)
    geometry = Column(Geometry("POLYGON", srid=4326))
    category = Column(Text)
    disaster_type = Column(Text)  # ✅
    detail_type = Column(Text)    # ✅
    source = Column(Text)
    address = Column(Text)
    prefecture = Column(Text)
    city = Column(Text)           # ✅
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    prefecture_id = Column(Integer)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("環境変数 DATABASE_URL が設定されていません。.env の設定を確認してください。")

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = scoped_session(sessionmaker(bind=engine))
db_session = SessionLocal()

def get_db_session():
    """SQLAlchemyのDBセッションを新規発行して返します（呼び出し元でclose必須）。"""
    return SessionLocal()

# ========== psycopg2直結用 ==========

import psycopg2
import psycopg2.extras
from flask import g

def get_db():
    if 'db' not in g:
        g.db = psycopg2.connect(
            dbname=os.environ.get("PG_DBNAME"),
            user=os.environ.get("PG_USER"),
            password=os.environ.get("PG_PASSWORD"),
            host=os.environ.get("PG_HOST"),
            port=os.environ.get("PG_PORT"),
            cursor_factory=psycopg2.extras.DictCursor
        )
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()
