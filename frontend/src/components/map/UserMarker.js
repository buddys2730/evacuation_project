import PropTypes from 'prop-types';
// /components/map/UserMarker.js
import React from 'react';
import { Circle } from '@react-google-maps/api';

const UserMarker = ({ userLocation, radius = 1000 }) => {
  if (!userLocation) return null;

  const circleOptions = {
    strokeColor: '#1976d2',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#1976d2',
    fillOpacity: 0.2,
  };

  return <Circle center={userLocation} radius={radius} options={circleOptions} />;
};

export default UserMarker;

UserMarker.propTypes = {
  // 自動挿入: 必要に応じて手動で編集してください
};
