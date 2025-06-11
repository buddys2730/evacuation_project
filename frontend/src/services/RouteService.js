// src/services/RouteService.js
export async function checkRouteSafety(routePoints) {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/route-safety`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ route: routePoints }), // ← JSON形式で route 配列を送信
    });

    if (!response.ok) {
      throw new Error('API呼び出し失敗');
    }

    const data = await response.json();
    return data.result; // { status: "safe", dangerous_points: [...] } を返す
  } catch (error) {
    console.error('❌ ルート判定エラー:', error);
    return { status: 'error', message: error.message };
  }
}
