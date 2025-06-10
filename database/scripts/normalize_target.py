import psycopg2
import re

conn = psycopg2.connect(
    dbname="evacuation_db",
    user="masashitakao",
    host="localhost",
    password="",  # 必要に応じて設定
    port="5432"
)
cur = conn.cursor()

def normalize(text):
    if text is None:
        return None
    text = text.lower()
    norm = []
    if re.search("高齢", text): norm.append("高齢者")
    if re.search("障がい|障害", text): norm.append("障がい者")
    if re.search("妊婦", text): norm.append("妊婦")
    if re.search("子供|児童", text): norm.append("子供")
    if re.search("外国人|外国籍", text): norm.append("外国人")
    if re.search("病気|疾患|療養", text): norm.append("病気の方")
    if re.search("ペット", text): norm.append("ペット可")
    return ",".join(sorted(set(norm))) if norm else None

cur.execute("SELECT id, target FROM designated_shelters;")
records = cur.fetchall()
for rid, target in records:
    normalized = normalize(target)
    cur.execute("UPDATE designated_shelters SET normalized_target = %s WHERE id = %s;", (normalized, rid))

conn.commit()
cur.close()
conn.close()
print("✅ 対象者の表記正規化が完了しました。")
