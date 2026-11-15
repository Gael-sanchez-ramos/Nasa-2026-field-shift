import cache from './sample-ndvi.json'

const source = 'https://data.nasa.gov/dataset/hls-sentinel-2-multi-spectral-instrument-vegetation-indices-daily-global-30-m-v2-0-90ed0'

function greenness(value) {
  const t = Math.min(1, Math.max(0, (value - 0.2) / 0.6))
  const from = [176, 132, 90]
  const to = [24, 122, 58]
  const rgb = from.map((channel, index) => Math.round(channel + (to[index] - channel) * t))
  return `rgb(${rgb.join(',')})`
}

export default function VegetationHistory({ location }) {
  const series = cache?.location.lat === location.lat && cache?.location.lng === location.lng ? cache : null
  if (!series) return <details className="stat-card panel">
    <summary>
      <span className="stat-kicker">Greenness at the point</span>
      <span className="stat-poster leaf"><strong>No record</strong><small>Greenness for this point is not saved yet.</small></span>
    </summary>
  </details>

  const average = series.observations.reduce((sum, item) => sum + item.ndvi, 0) / series.observations.length
  const lowest = Math.min(...series.observations.map(item => item.ndvi))
  const highest = Math.max(...series.observations.map(item => item.ndvi))
  const span = Math.max(0.05, highest - lowest)
  const cover = average >= 0.6 ? 'Mostly green' : average >= 0.3 ? 'Mixed cover' : 'Mostly bare'

  return <details className="stat-card panel">
    <summary>
      <span className="stat-kicker">Greenness at the point</span>
      <span className="stat-poster leaf">
        <strong>{cover}</strong>
        <small>{series.year} · greener means more plant cover</small>
      </span>
      <span className="green-strip" aria-hidden="true">
        {series.observations.map(({ date, ndvi }) => <i key={date} style={{ background: greenness(ndvi) }} />)}
      </span>
    </summary>
    <div className="stat-body">
      <p className="stat-read">Each mark is one satellite look. Brown is sparse cover. Green is a full canopy.</p>
      <div className="big-bars" aria-label="Greenness through the year">
        {series.observations.map(({ date, ndvi }) => <span key={date} title={`${date}: ${ndvi.toFixed(2)}`}
          style={{ height: `${8 + (ndvi - lowest) / span * 92}%`, background: greenness(ndvi) }} />)}
      </div>
      <div className="big-axis" aria-hidden="true"><span>Jan</span><span>Dec</span></div>
      <p className="stat-source"><a href={source}>NASA HLS Sentinel-2</a> · 30 m at the point. Greenness, not the crop name or a yield.</p>
    </div>
  </details>
}
