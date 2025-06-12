# services/db_connection.py

import psycopg2
import os
from dotenv import load_dotenv

# .env の読み込みを明示
load_dotenv(dotenv_path="/Users/masashitakao/Desktop/evacuation_project/.env")


def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv("PG_DBNAME"),
        user=os.getenv("PG_USER"),
        password=os.getenv("PG_PASSWORD"),
        host=os.getenv("PG_HOST"),
        port=os.getenv("PG_PORT"),
    )
