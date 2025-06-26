import csv
import re
from collections import defaultdict

# 1. DB集計CSVの読み込み
db_counts = defaultdict(int)
with open('/tmp/db_counts.csv', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        key = f"{row['prefecture']}_{row['category']}"
        db_counts[key] = int(row['num'])

# 2. SQLファイルのINSERT件数テキストの読み込み
sql_counts = defaultdict(int)
insert_pattern = re.compile(r'^(.+)\.sql\s*:\s*(\d+)')
with open('/tmp/sql_insert_counts.txt', encoding='utf-8') as f:
    for line in f:
        m = insert_pattern.match(line.strip())
        if m:
            name, count = m.groups()
            # ファイル名から都道府県_カテゴリを取得
            # 例: 三重県_洪水_01_計画規模.sql → 三重県_洪水_01_計画規模
            sql_counts[name] += int(count)

# 3. 比較してレポート
all_keys = set(db_counts) | set(sql_counts)
diffs = []
for key in sorted(all_keys):
    db_num = db_counts.get(key, 0)
    sql_num = sql_counts.get(key, 0)
    diff = db_num - sql_num
    diffs.append((key, db_num, sql_num, diff))

print("都道府県_カテゴリ, DB件数, SQL件数, 差分")
for k, dbn, sqln, d in diffs:
    mark = "  << 差あり" if d != 0 else ""
    print(f"{k},{dbn},{sqln},{d}{mark}")
