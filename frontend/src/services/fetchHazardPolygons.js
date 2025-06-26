import axios from "axios";
import config from "../config.js";

export async function fetchHazardPolygons(
  categories,
  lat,
  lng,
  radiusKm,
  prefecture,
  mode = "hazard"
) {
  const category =
    Array.isArray(categories) && categories.length > 0 ? categories[0] : categories;

  // ここでエンコードは絶対に不要！
  const params = {
    category,    // ← そのまま
    lat,
    lng,
    radius_km: radiusKm,
    prefecture,  // ← そのまま
    mode,
  };

  // ログ出力
  console.log("[API呼び出し] /api/hazard-polygons", params);

  const res = await axios.get(`${config.API_BASE_URL}/api/hazard-polygons`, {
    params,
  });

  // 統一的に「features」もしくは素配列の件数をログ表示
  const features =
    Array.isArray(res.data?.features)
      ? res.data.features
      : Array.isArray(res.data)
      ? res.data
      : [];
  console.log("[取得件数]", features.length);

  return res.data;
}
