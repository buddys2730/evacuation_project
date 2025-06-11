// src/utils/fetchHazardPolygons.js
export async function fetchHazardPolygons(
  disasterType,
  latitude,
  longitude,
  radiusKm
) {
  try {
    const params = new URLSearchParams({
      disaster_type: disasterType,
      latitude,
      longitude,
      radius_km: radiusKm,
    });
    const response = await fetch(`/api/hazard_polygons?${params.toString()}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data.polygons || [];
  } catch (error) {
    console.error('ポリゴン取得エラー:', error);
    return [];
  }
}
