import ndvi from './sample-ndvi.json'
import smap from './sample-smap.json'
import { nasaSource } from './climate'
import { soilSource } from './soil'

export default function DataSources({ report }) {
  const query = new URLSearchParams({ parameters: 'PRECTOTCORR,T2M_MAX,T2M_MIN', community: 'AG',
    latitude: report.location.lat.toFixed(4), longitude: report.location.lng.toFixed(4),
    start: '20150101', end: '20241231', format: 'JSON', 'time-standard': 'UTC' })
  const matches = cache => cache.location.lat === report.location.lat && cache.location.lng === report.location.lng
  return <details className="panel provenance">
    <summary>Data sources and method <span>Observations, mapped data and estimates</span></summary>
    <div className="provenance-body">
      <p>Report point: {report.location.lat.toFixed(7)}°, {report.location.lng.toFixed(7)}°. {report.isSample ? 'Bundled sample observations; no live climate request is needed for this report.' : 'Climate retrieved for the selected field point.'}</p>
      <dl>
        <div><dt>Rain and heat · NASA POWER</dt><dd>Daily PRECTOTCORR (mm/day), T2M_MAX and T2M_MIN (°C), 2015–2024 UTC. {report.count} complete rainfall years. Annual rainfall is summed; temperatures are daily extremes. Typical is closest to median rainfall; dry is second-driest. Values represent a regional cell.<br /><a href={nasaSource}>Method documentation</a> · <a href={`https://power.larc.nasa.gov/api/temporal/daily/point?${query}`}>Point request</a></dd></div>
        {report.isSample && matches(smap) && <div><dt>Soil moisture · NASA POWER / SMAP Level 4</dt><dd>RZMC, modeled water content in the top 1 m; shown as percent by volume. Cached years: {Object.keys(smap.years).join(', ')}. Weekly means use bins starting January 1. Regional grid, approximately 9 km.<br /><a href="https://power.larc.nasa.gov/docs/methodology/data/sources_hydrology/#smap">Product documentation</a></dd></div>}
        {report.isSample && matches(ndvi) && <div><dt>Vegetation greenness · NASA HLS Sentinel-2</dt><dd>{ndvi.product}, {ndvi.year}, 30 m point observations. NDVI is unitless (−1 to 1); gaps indicate no valid observations. This record stays in {ndvi.year} when the climate year changes.<br /><a href="https://lpdaac.usgs.gov/documents/2088/HLS_VI_User_Guide_V2.pdf">Product guide</a></dd></div>}
        <div><dt>Mapped soil · INEGI</dt><dd>Edaphology Series II, Linares G14-11, 1:250,000. Spatial lookup of mapped unit and surface texture; this is not a field laboratory test.<br /><a href={soilSource}>Map source</a></dd></div>
        <div><dt>Rotation ratings · Team estimates</dt><dd>Illustrative ordinal ratings dated November 14, 2026. No local profit, water-demand or yield model. The regional study linked on the bean option does not validate these numerical ratings.</dd></div>
      </dl>
      <p className="provenance-note">Download timestamps were not recorded in the bundled observation files. The periods above describe observation coverage, not retrieval dates.</p>
    </div>
  </details>
}
