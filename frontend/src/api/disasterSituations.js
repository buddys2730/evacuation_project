const API_BASE = process.env.REACT_APP_API_BASE_URL || "";

export async function fetchDisasterSituations({
  city,
  disasterType,
  dangerLevel,
  from,
  to,
}) {
  const params = new URLSearchParams({
    city,
    disaster_type: disasterType,
    danger_level: dangerLevel,
    from,
    to,
  });
  const res = await fetch(
    `${API_BASE}/admin/disaster-situations?${params.toString()}`,
  );
  if (!res.ok) throw new Error("API error");
  return res.json();
}
