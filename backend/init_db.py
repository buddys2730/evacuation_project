# /Users/masashitakao/Desktop/evacuation_project/backend/init_db.py

from database import Base, engine
from sqlalchemy import inspect

def recreate_tables():
    inspector = inspect(engine)
    if "hazard_zones" not in inspector.get_table_names():
        print("✅ hazard_zones テーブルが存在しません。作成します...")
        Base.metadata.create_all(bind=engine)
        print("✅ 作成完了")
    else:
        print("✅ hazard_zones テーブルは既に存在しています")

if __name__ == "__main__":
    recreate_tables()
