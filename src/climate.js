// NASA POWER Daily Point API (UTC): https://power.larc.nasa.gov/docs/services/api/temporal/daily/
// Parameter definitions: https://power.larc.nasa.gov/docs/tutorials/parameters/
export const nasaSource = 'https://power.larc.nasa.gov/docs/services/api/temporal/daily/'

export async function loadClimate({ lat, lng }, signal) {
  const query = new URLSearchParams({
    parameters: 'PRECTOTCORR,T2M_MAX,T2M_MIN',
    community: 'AG', latitude: lat.toFixed(4), longitude: lng.toFixed(4),
    start: '20150101', end: '20241231', format: 'JSON', 'time-standard': 'UTC',
  })
  const response = await fetch(`https://power.larc.nasa.gov/api/temporal/daily/point?${query}`, { signal })
  if (!response.ok) throw new Error('NASA POWER request failed')
  return summarizeClimate(await response.json())
}

export function summarizeClimate(payload) {
  const { PRECTOTCORR: rain, T2M_MAX: high, T2M_MIN: low } = payload.properties.parameter
  const years = []
  // The regional comparison uses complete calendar years; crop windows need local validation.
  for (let year = 2015; year <= 2024; year++) {
    const days = []
    for (const day = new Date(Date.UTC(year, 0, 1)); day.getUTCFullYear() === year; day.setUTCDate(day.getUTCDate() + 1)) {
      days.push(day.toISOString().slice(0, 10).replaceAll('-', ''))
    }
    if (days.some(day => !Number.isFinite(rain[day]) || rain[day] < 0)) continue
    const extremes = (series, pick) => {
      const values = days.map(day => series?.[day])
      return values.every(value => Number.isFinite(value) && value > -100) ? pick(...values) : null
    }
    years.push({
      year, rain: Math.round(days.reduce((total, day) => total + rain[day], 0)),
      total: days.reduce((total, day) => total + rain[day], 0),
      high: extremes(high, Math.max), low: extremes(low, Math.min),
    })
  }
  if (years.length < 3) throw new Error('Insufficient complete years')
  years.sort((a, b) => a.total - b.total || a.year - b.year)
  const median = (years[Math.floor((years.length - 1) / 2)].total + years[Math.floor(years.length / 2)].total) / 2
  const typical = [...years].sort((a, b) => Math.abs(a.total - median) - Math.abs(b.total - median) || a.year - b.year)[0]
  return { typical, dry: years[1], count: years.length }
}

export function fieldPoint(points) {
  // Intersect a horizontal line between distinct vertex latitudes with the polygon.
  // The midpoint of the first interior interval stays inside concave fields.
  const levels = [...new Set(points.map(point => point.lat))].sort((a, b) => a - b)
  if (levels.length < 2) return null
  const middle = Math.floor(levels.length / 2)
  const lat = (levels[middle - 1] + levels[middle]) / 2
  const crossings = points.flatMap((a, index) => {
    const b = points[(index + 1) % points.length]
    if ((a.lat > lat) === (b.lat > lat)) return []
    return [a.lng + (lat - a.lat) * (b.lng - a.lng) / (b.lat - a.lat)]
  }).sort((a, b) => a - b)
  return crossings[1] > crossings[0] ? { lat, lng: (crossings[0] + crossings[1]) / 2 } : null
}
