import React from "react";
import PropTypes from "prop-types";
import { Marker } from "@react-google-maps/api";

/**
 * UserMarker 現在地をマップ上に表示するマイクロシステム
 * @param {{ position: {lat: number, lng: number} }} props
 */
const UserMarker = ({ position }) => {
  if (!position) return null;
  return <Marker position={position} label="現在地" />;
};

UserMarker.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
};

export default UserMarker;
