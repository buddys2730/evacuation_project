// /src/hooks/useHazardPolygons.js
import { useEffect, useState } from "react";
import { fetchHazardPolygons } from "../services/fetchHazardPolygons.js"; // ✅ 修正

const useHazardPolygons = (disasterType, userLocation, radiusKm, trigger) => {
  const [hazardPolygons, setHazardPolygons] = useState([]);

  useEffect(() => {
    if (!userLocation || !disasterType) return;

    const fetch = async () => {
      const polygons = await fetchHazardPolygons(
        disasterType,
        userLocation.lat,
        userLocation.lng,
        radiusKm,
      );
      setHazardPolygons(polygons);
    };

    fetch();
  }, [disasterType, userLocation, radiusKm, trigger]);

  return hazardPolygons;
};

export default useHazardPolygons;
