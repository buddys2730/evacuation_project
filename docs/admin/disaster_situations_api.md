管理ダッシュボード用 災害状況API設計（2025-06-22）

1. 通行止め・危険区域一覧取得API
エンドポイント

GET /admin/disaster-situations
クエリパラメータ例

city（市区町村名、例：福山市）
disaster_type（災害種別、例：洪水）
is_closed（通行止め区間のみ抽出：true/false）
danger_level（危険度）
from / to（発生日で期間絞り込み）
レスポンス例

[
  {
    "id": 1,
    "disaster_type": "土砂災害",
    "danger_level": "高",
    "address_label": "松永町3丁目15番地辺り",
    "area_label": "松永町3丁目～神村町付近",
    "occurred_at": "2025-06-22T09:00:00Z",
    "cleared_at": null,
    "comment": "崩落の危険あり",
    "geometry": { /* GeoJSON object */ }
  }
]
2. address_label自動生成ロジック例
地理情報（geometry: ポリゴン/ライン/点）の中心点（centroid）を逆ジオコーディング
DB登録時、またはAPIレスポンス生成時に
address_label → 町名・番地「辺り」
area_label → ポリゴンがまたぐ場合は町名区間「付近」
疑似コード例（Python）

from shapely.geometry import shape
from geopy.geocoders import Nominatim

def get_address_label(geometry_geojson):
    centroid = shape(geometry_geojson).centroid
    geolocator = Nominatim(user_agent="myapp")
    location = geolocator.reverse((centroid.y, centroid.x), language="ja")
    if location:
        address = location.raw["address"]
        town = address.get("town") or address.get("suburb") or address.get("city")
        block = address.get("block") or ""
        number = address.get("house_number") or ""
        return f"{town}{block}{number}辺り"
    return "位置不明"
ポリゴン全域の町名取得は、各頂点または境界点で町名取得→リスト化し「◯◯町～△△町付近」生成
API・DB設計ではaddress_labelとarea_label両方用意、カードUIには適切な方を表示
3. 管理者用CRUD
登録：
POST /admin/disaster-situations
編集：
PUT /admin/disaster-situations/{id}
address_labelは編集可能
削除：
DELETE /admin/disaster-situations/{id}
4. 認証・認可
管理者APIは必ず認証（JWTなど）＋権限チェック
ログインUI・セッション管理設計は別mdに分離