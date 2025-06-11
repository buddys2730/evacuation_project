import React from 'react';

const ResultList = ({ points, selectedId, onSelect }) => {
  if (!points || points.length === 0) {
    return <p style={{ marginTop: '15px' }}>検索結果がありません。</p>;
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>避難所一覧（距離順）</h3>
      <ul style={{ paddingLeft: '20px' }}>
        {points.map((point) => (
          <li
            key={point.id}
            style={{
              marginBottom: '10px',
              cursor: 'pointer',
              fontWeight: point.id === selectedId ? 'bold' : 'normal',
              color: point.id === selectedId ? '#d9534f' : '#333',
            }}
            onClick={() => onSelect(point.id)}
          >
            {point.name}（{point.distance_km} km）
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResultList;
