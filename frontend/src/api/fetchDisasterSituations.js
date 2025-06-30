// frontend/src/api/disasterSituations.js
export async function fetchDisasterSituations({
  pref,
  city,
  disasterType,
  dangerLevel,
  from,
  to,
}) {
  const params = new URLSearchParams();
  if (pref) params.append("pref", pref);
  if (city) params.append("city", city);
  if (disasterType) params.append("disaster_type", disasterType);
  if (dangerLevel) params.append("danger_level", dangerLevel);
  if (from) params.append("from", from);
  if (to) params.append("to", to);

  const url =
    process.env.REACT_APP_API_BASE_URL +
    "/admin/disaster-situations?" +
    params.toString();
  const res = await fetch(url);
  return await res.json();
}
