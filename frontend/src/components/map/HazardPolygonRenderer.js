// /components/map/HazardPolygonRenderer.js
import React from 'react';
import { Polygon } from '@react-google-maps/api';

const HazardPolygonRenderer = ({ polygons }) => {
  if (!polygons || !Array.isArray(polygons)) return null;

  return (
    <>
      {polygons.map((polygonCoords, index) => (
        <Polygon
          key={index}
          paths={polygonCoords}
          options={{
            fillColor: '#FF0000',
            fillOpacity: 0.3,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            clickable: false,
            zIndex: 1,
          }}
        />
      ))}
    </>
  );
};

export default HazardPolygonRenderer;
