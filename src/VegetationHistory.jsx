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
  if (!series?.observations.length) return <details className="stat-card panel">
    <summary>
      <span className="stat-kicker">Vegetation greenness</span>
      <span className="stat-poster leaf"><strong>No record</strong><small>Greenness for this point is not saved yet.</small></span>
    </summary>
  </details>

  const average = series.observations.reduce((sum, item) => sum + item.ndvi, 0) / series.observations.length
  const yearStart = Date.UTC(series.year, 0, 1)
  const yearEnd = Date.UTC(series.year + 1, 0, 1)
  const position = time => (time - yearStart) / (yearEnd - yearStart) * 100
  const ticks = [[0, 'Jan'], [3, 'Apr'], [6, 'Jul'], [9, 'Oct']]

  return <details className="stat-card panel">
    <summary>
      <span className="stat-kicker">Vegetation greenness</span>
      <span className="stat-poster leaf">
        <strong>{average.toFixed(2)}</strong>
        <small>Average observed NDVI · {series.year}</small>
      </span>
    </summary>
    <div className="stat-body">
      <p className="stat-read">NDVI estimates plant greenness. Each bar marks a satellite observation on its actual date. Gaps mean no valid observations.</p>
      <div className="ndvi-timeline">
        <div className="ndvi-plot">
          {series.observations.map(({ date, ndvi }) => <span key={date} tabIndex={0} role="img" aria-label={`${date}: NDVI ${ndvi.toFixed(2)}`} data-tooltip={`${date} · ${ndvi.toFixed(2)} NDVI`}
            style={{ left: `${position(Date.parse(date))}%`, height: `${(ndvi + 1) * 50}%`, background: greenness(ndvi) }} />)}
        </div>
        <div className="ndvi-ticks">
          {ticks.map(([month, label]) => <span key={label}
            style={{ left: `${position(Date.UTC(series.year, month, 1))}%` }}>{label}</span>)}
        </div>
      </div>
      <p>NDVI scale: −1 to 1. The bars start at −1.</p>
      <details className="fold">
        <summary>See observations by date</summary>
        <ul className="ndvi-observations">
          {series.observations.map(({ date, ndvi }) => <li key={date}>
            <time dateTime={date}>{date}</time>
            <meter min={-1} max={1} value={ndvi} aria-label={`NDVI on ${date}`} />
            <span>{ndvi.toFixed(2)}</span>
          </li>)}
        </ul>
      </details>
      <p className="stat-source"><a href={source}>NASA HLS Sentinel-2</a> · 30 m at the point. NDVI alone cannot diagnose crop health or tell what is growing.</p>
    </div>
  </details>
}
