// ✅ config.js - APIエンドポイント定義
const config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
};

if (!config.API_BASE_URL) {
  console.error('❌ REACT_APP_API_BASE_URL が設定されていません。');
}

export default config;
