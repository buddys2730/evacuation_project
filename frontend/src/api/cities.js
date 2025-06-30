export async function fetchCities() {
  const res = await fetch(process.env.REACT_APP_API_BASE_URL + "/api/cities");
  const data = await res.json();
  // APIが { cities: [...] } 形式なら return data.cities
  // 配列なら return data
  return Array.isArray(data) ? data : data.cities || [];
}
