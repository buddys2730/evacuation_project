import PropTypes from 'prop-types';
// frontend/src/components/ARView.js

import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ARView = () => {
  const location = useLocation();
  const evacData = location.state;

  useEffect(() => {
    if (!evacData || !evacData.latitude || !evacData.longitude || !evacData.name) {
      alert('避難所データが不足しています。');
      return;
    }

    // HTMLファイルへ情報を埋め込んで遷移
    const queryParams = new URLSearchParams({
      lat: evacData.latitude,
      lng: evacData.longitude,
      name: evacData.name,
    });

    window.location.href = `/evacuation_ar.html?${queryParams.toString()}`;
  }, [evacData]);

  return (
    <div>
      <p>AR画面に遷移中です...</p>
    </div>
  );
};

export default ARView;

ARView.propTypes = {
  // 自動挿入: 必要に応じて手動で編集してください
};
