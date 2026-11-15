import cache from './sample-ndvi.json'

const source = 'https://data.nasa.gov/dataset/hls-sentinel-2-multi-spectral-instrument-vegetation-indices-daily-global-30-m-v2-0-90ed0'

export default function VegetationHistory({ location }) {
  const series = cache?.location.lat === location.lat && cache?.location.lng === location.lng ? cache : null

  return <div className="vegetation-history">
    <h4>Vegetation history (NDVI)</h4>
    {series ? <>
      <p>{series.year} · Sample point · {series.observations.length} valid observations</p>
      <p>Higher values usually mean greener plants. If the number drops, check whether the crop was harvested or the field was dry around that date.</p>
      <details className="fold">
        <summary>Daily observations graph</summary>
        <ul className="ndvi-observations" aria-label="NDVI by observation date">
          {series.observations.map(({ date, ndvi }) => <li key={date}>
            <time dateTime={date}>{date}</time>
            <meter min={-1} max={1} value={ndvi} aria-label={`NDVI on ${date}`} />
            <span>{ndvi.toFixed(2)}</span>
          </li>)}
        </ul>
      </details>
    </> : <p>NDVI data for this sample point has not been downloaded yet.</p>}
    <a className="source" href={source}>NASA HLS Sentinel-2 vegetation indices · 30 m</a>
  </div>
}
