import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ARView = () => {
  const location = useLocation();
  const evacData = location.state;

  useEffect(() => {
    if (
      !evacData ||
      !evacData.latitude ||
      !evacData.longitude ||
      !evacData.name
    ) {
      alert("避難所データが不足しています。");
      return;
    }
    // HTMLファイルへ情報を埋め込んで遷移（追加パラメータもここに！）
    const queryParams = new URLSearchParams({
      lat: evacData.latitude,
      lng: evacData.longitude,
      name: evacData.name,
      turns: evacData.turns ?? "",
      elev: evacData.elev ?? "",         // ← 標高
      supplies: evacData.supplies ?? "", // ← 物資
      crowd: evacData.crowd ?? "",       // ← 混雑度
      apiKey: evacData.apiKey ?? ""
    });
    window.location.href = `/evacuation_ar.html?${queryParams.toString()}`;
  }, [evacData]);

  return (
    <div>
      {/* === ARカメラ・センサー許可ガイド（必ず先頭） === */}
      <div style={{
        background: '#f8fff4',
        borderRadius: 14,
        padding: '20px 24px',
        margin: '18px 0',
        color: '#234',
        fontSize: '1.13em',
        boxShadow: '0 2px 10px #d2f2dd90',
        lineHeight: 1.7
      }}>
        <b style={{fontSize:'1.18em'}}>【AR初回利用時のご案内】</b><br/>
        本サービスでは<b>カメラ・位置情報・センサーの許可</b>が必要です。<br/>
        <ul style={{margin:'8px 0 0 20px'}}>
          <li>「カメラ起動」「AR表示」ボタンを<b>必ずタップ</b>してください。</li>
          <li>iPhoneの方<br/>
            1. 設定→Safari→カメラ/位置情報→<b>許可</b><br/>
            2. アドレスバー左「AA」→Webサイトの設定→カメラ/位置情報→<b>許可</b></li>
          <li>Androidの方：画面下の許可ダイアログを<b>許可</b>してください。</li>
          <li>動作しない場合はリロードや端末の再起動をお試しください。</li>
        </ul>
      </div>
      <p>AR画面に遷移中です...</p>
    </div>
  );
};

export default ARView;

ARView.propTypes = {
  // 必要ならprops追加
};
