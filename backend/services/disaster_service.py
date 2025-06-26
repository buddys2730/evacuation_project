def get_disaster_situations(city, from_date, to_date, disaster_type, danger_level):
    # DBクエリ: filter条件はすべて可変
    # 住所ラベルはDB格納 or 逆ジオコーディング関数
    # geometryはGeoJSON化
    pass

def export_disaster_situations_csv(city, from_date, to_date, disaster_type, danger_level):
    # フィルタ後CSV生成・一時保存→パス返却
    pass
