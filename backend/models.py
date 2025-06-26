from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from geoalchemy2 import Geometry

Base = declarative_base()

# 指定避難所
class DesignatedShelters(Base):
    __tablename__ = "designated_shelters"
    id = Column(String, primary_key=True)
    name = Column(String)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    elevation = Column(Float)
    target = Column(String)
    city = Column(String)
    pref = Column(String)
    normalized_target = Column(String)
    ward = Column(String)
    town = Column(String)
    chome_block = Column(String)
    target_category = Column(String)
    romanized_name = Column(String)
    shelter_type = Column(String)   # ←★★★必須

# 混雑度（避難所ID文字列）
class CrowdStatuses(Base):
    __tablename__ = "crowd_statuses"
    id = Column(Integer, primary_key=True)
    shelter_id = Column(String)
    crowd_level = Column(String)
    updated_at = Column(DateTime)

# 物資（shelter_idはint。物資名ごとにレコード）
class ShelterSupplies(Base):
    __tablename__ = "shelter_supplies"
    id = Column(Integer, primary_key=True)
    shelter_id = Column(Integer)
    item_name = Column(String)
    quantity = Column(Integer)
    updated_at = Column(DateTime)

# 物資マスタ
class SupplyItems(Base):
    __tablename__ = "supply_items"
    id = Column(Integer, primary_key=True)
    item_name = Column(String)
    description = Column(Text)

# 緊急避難所（主キー：文字列）
class EmergencyShelters(Base):
    __tablename__ = "emergency_shelters"
    id = Column(String, primary_key=True)
    name = Column(String)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    elevation = Column(Float)
    hazard_flood = Column(Boolean)
    hazard_landslide = Column(Boolean)
    hazard_storm_surge = Column(Boolean)
    hazard_earthquake = Column(Boolean)
    hazard_tsunami = Column(Boolean)
    hazard_fire = Column(Boolean)
    hazard_inland_flood = Column(Boolean)
    hazard_volcano = Column(Boolean)
    city = Column(String)
    pref = Column(String)
    ward = Column(String)
    town = Column(String)
    chome_block = Column(String)
    romanized_name = Column(String)

# 物資（shelter_idが文字列）
class Supplies(Base):
    __tablename__ = "supplies"
    id = Column(Integer, primary_key=True)
    shelter_id = Column(String)
    item_name = Column(String)
    quantity = Column(Integer)
    updated_at = Column(DateTime)

# 災害状況
class DisasterSituation(Base):
    __tablename__ = "disaster_situations"
    id = Column(Integer, primary_key=True)
    disaster_type = Column(String)
    danger_level = Column(String)
    depth_m = Column(Float)
    is_closed = Column(Boolean)
    geometry = Column(Geometry("POLYGON"))
    occurred_at = Column(DateTime)
    cleared_at = Column(DateTime)
    comment = Column(Text)
    image_url = Column(Text)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
