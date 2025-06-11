// /Users/masashitakao/Desktop/evacuation_project/frontend/src/components/SearchForm.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';

// 都道府県一覧
const prefectures = [
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
  '滋賀県',
  '京都府',
  '大阪府',
  '兵庫県',
  '奈良県',
  '和歌山県',
  '鳥取県',
  '島根県',
  '岡山県',
  '広島県',
  '山口県',
  '徳島県',
  '香川県',
  '愛媛県',
  '高知県',
  '福岡県',
  '佐賀県',
  '長崎県',
  '熊本県',
  '大分県',
  '宮崎県',
  '鹿児島県',
  '沖縄県',
];

const disasterTypes = ['洪水', '津波', '地震', '土砂', '高潮', '火山', '火事', '内水'];

const floodDetailOptions = [
  { label: '通常想定される洪水', value: '計画規模' },
  { label: 'まれに起こる大規模洪水', value: '想定最大規模' },
  { label: '水が引くまでの時間', value: '浸水継続時間' },
];

const shelterTypeOptions = [
  { label: '全て', value: '' },
  { label: '指定避難所', value: '指定避難所' },
  { label: '緊急避難所', value: '緊急避難所' },
];

const SearchForm = ({
  onResults,
  onSearchParams,
  defaultRadius,
  setUserLocation = () => {}, // ✅ デフォルト空関数を指定
}) => {
  const [pref, setPref] = useState('広島県');
  const [city, setCity] = useState('福山市');
  const [disasterType, setDisasterType] = useState('洪水');
  const [floodDetailType, setFloodDetailType] = useState('計画規模');
  const [shelterType, setShelterType] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // 初期位置取得
  useEffect(() => {
    if (!navigator.geolocation) {
      alert('このブラウザでは位置情報が取得できません。');
      const fallback = { lat: 34.5436137, lng: 133.289872 };
      setLocation(fallback);
      setUserLocation(fallback);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setLocation(loc);
        setUserLocation(loc);
      },
      (err) => {
        console.error('位置取得失敗:', err);
        alert('現在地の取得に失敗しました。デフォルト位置を使用します。');
        const fallback = { lat: 34.5436137, lng: 133.289872 };
        setLocation(fallback);
        setUserLocation(fallback);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [setUserLocation]);

  const handleSearch = async () => {
    if (!pref || !city || !disasterType || !location) {
      alert('すべての項目と現在地が必要です。');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/search`, {
        params: {
          pref,
          city,
          disaster_type: disasterType === '洪水' ? `洪水_${floodDetailType}` : disasterType,
          latitude: location.lat,
          longitude: location.lng,
          radius_km: defaultRadius,
          shelter_type: shelterType,
        },
      });

      const results = response.data.results || [];
      onResults && onResults(results);
      onSearchParams &&
        onSearchParams({
          pref,
          city,
          disasterType: disasterType === '洪水' ? `洪水_${floodDetailType}` : disasterType,
          latitude: location.lat,
          longitude: location.lng,
          radius: defaultRadius,
          shelter_type: shelterType,
        });
    } catch (error) {
      console.error('検索エラー:', error);
      alert('検索に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1rem', background: '#f9f9f9' }}>
      <h2>避難所検索</h2>

      <div>
        <label>都道府県: </label>
        <select value={pref} onChange={(e) => setPref(e.target.value)}>
          <option value="">選択してください</option>
          {prefectures.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>市区町村: </label>
        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
      </div>

      <div>
        <label>災害種別: </label>
        <select value={disasterType} onChange={(e) => setDisasterType(e.target.value)}>
          {disasterTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {disasterType === '洪水' && (
        <div>
          <label>洪水の種類: </label>
          <select value={floodDetailType} onChange={(e) => setFloodDetailType(e.target.value)}>
            {floodDetailOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label>避難所の種別: </label>
        <select value={shelterType} onChange={(e) => setShelterType(e.target.value)}>
          {shelterTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: '10px' }}>
        <button onClick={handleSearch} disabled={loading || !location}>
          {loading ? '検索中...' : '検索'}
        </button>
      </div>
    </div>
  );
};

export default SearchForm;
