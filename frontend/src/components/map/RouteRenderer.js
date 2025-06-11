import PropTypes from 'prop-types';
// /components/map/RouteRenderer.js
import React from 'react';
import { DirectionsRenderer } from '@react-google-maps/api';

const RouteRenderer = ({ directions }) => {
  if (!directions) return null;

  return (
    <DirectionsRenderer
      directions={directions}
      options={{
        suppressMarkers: false,
        preserveViewport: true,
        polylineOptions: {
          strokeColor: '#1976d2',
          strokeOpacity: 0.8,
          strokeWeight: 5,
        },
      }}
    />
  );
};

export default RouteRenderer;

RouteRenderer.propTypes = {
  // 自動挿入: 必要に応じて手動で編集してください
};
