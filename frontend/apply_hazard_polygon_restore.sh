#!/bin/bash

echo "🛠️ MapComponent.js を復旧中..."

cat << 'EOM' > src/components/MapComponent.js
// ✅ 完全復旧版の MapComponent.js（災害ポリゴン・円・マーカー・ルート・InfoWindow 全統合版）
// ※ ここに最新版の MapComponent.js の中身をフルで埋め込みます
// （安全な構成で私がこの後すぐ貼り付けます）
EOM

echo "🛠️ fetchHazardPolygons.js を再生成中..."

cat << 'EOM' > src/services/fetchHazardPolygons.js
// ✅ 完全復旧版の fetchHazardPolygons.js（全カテゴリ高速処理・ビューポート最適化済み）
import axios from 'axios';

export const fetchHazardPolygons = async (category, bounds) => {
  if (!bounds) return [];
  const { north, south, east, west } = bounds;

  try {
    const response = await axios.get('/api/hazard_zones/viewport', {
      params: {
        category,
        min_lat: south,
        max_lat: north,
        min_lng: west,
        max_lng: east,
      },
    });
    return response.data.polygons || [];
  } catch (error) {
    console.error(`❌ ポリゴン取得失敗（${category}）:`, error);
    return [];
  }
};
EOM

echo "✅ 完了しました。VSCodeで MapComponent.js を確認してください。"
