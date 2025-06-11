// /frontend/src/services/fetchHazardPolygonsFromViewport.js
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

export async function fetchHazardPolygonsFromViewport(bounds, category) {
  if (!bounds || !bounds.getSouthWest || !bounds.getNorthEast) {
    console.warn('❌ 無効なビューポートバウンドが渡されました。');
    return [];
  }

  try {
    const southWest = bounds.getSouthWest();
    const northEast = bounds.getNorthEast();

    const url = new URL(`${API_BASE_URL}/api/hazard_zones/viewport`);
    url.searchParams.append('min_lat', southWest.lat());
    url.searchParams.append('max_lat', northEast.lat());
    url.searchParams.append('min_lng', southWest.lng());
    url.searchParams.append('max_lng', northEast.lng());
    if (category) url.searchParams.append('category', category);

    const start = performance.now();
    const response = await fetch(url.toString());

    if (!response.ok) {
      console.error('❌ ポリゴン取得失敗: ', response.statusText);
      return [];
    }

    const data = await response.json();
    const elapsed = (performance.now() - start).toFixed(2);
    console.log(
      `✅ fetchHazardPolygonsFromViewport: ${data.length} 件, ${elapsed} ms`
    );

    return data;
  } catch (error) {
    console.error('❌ fetchHazardPolygonsFromViewport エラー:', error);
    return [];
  }
}
