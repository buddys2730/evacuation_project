import axios from "axios";
import config from "../config.js";

/**
 * ハザード・災害状況ポリゴン取得
 * @param {string|string[]} categories
 * @param {number} lat
 * @param {number} lng
 * @param {number} radiusKm
 * @param {string} prefecture
 * @param {string} mode - "hazard" or "disaster"
 * @returns {Promise<Array|Object>} GeoJSON配列またはFeatureCollection
 */
export async function fetchHazardPolygons(
  categories,
  lat,
  lng,
  radiusKm,
  prefecture,
  mode = "hazard",
) {
  // 「現在の災害状況」モードなら別APIに切り替え
  if (mode === "disaster") {
    console.log("[API呼び出し] /api/disaster_situations/active");
    const res = await axios.get(
      `${config.API_BASE_URL}/api/disaster_situations/active`,
    );
    // 取得件数の統一ログ
    const features = Array.isArray(res.data?.features)
      ? res.data.features
      : Array.isArray(res.data)
        ? res.data
        : [];
    console.log("[取得件数]", features.length);
    return res.data;
  }

  // 通常ハザードモード
  const category =
    Array.isArray(categories) && categories.length > 0
      ? categories[0]
      : categories;

  // ここでエンコードは不要！
  const params = {
    category, // ← そのまま
    lat,
    lng,
    radius_km: radiusKm,
    prefecture, // ← そのまま
    mode,
  };

  // ログ出力
  console.log("[API呼び出し] /api/hazard-polygons", params);

  const res = await axios.get(`${config.API_BASE_URL}/api/hazard-polygons`, {
    params,
  });

  // 統一的に「features」もしくは素配列の件数をログ表示
  const features = Array.isArray(res.data?.features)
    ? res.data.features
    : Array.isArray(res.data)
      ? res.data
      : [];
  console.log("[取得件数]", features.length);

  return res.data;
}
