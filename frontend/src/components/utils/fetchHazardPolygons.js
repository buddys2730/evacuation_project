export default async function fetchHazardPolygons(pref, city) {
  if (!pref || !city) {
    console.error("❌ ポリゴン取得に必要な都道府県か市区町村が未定義です:", {
      pref,
      city,
    });
    return [];
  }

  try {
    const response = await fetch(
      `/api/hazard_polygon?pref=${encodeURIComponent(pref)}&city=${encodeURIComponent(city)}`,
    );
    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("ポリゴン取得エラー:", error);
    return [];
  }
}

// 市町村単位でハザードポリゴンを取得
export async function fetchHazardPolygonsByCity(cityName, category) {
  const params = new URLSearchParams({ city_name: cityName });
  if (category) params.append("category", category);

  const res = await fetch(`/api/hazard_zones/by_city?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch polygons");
  return await res.json();
}
