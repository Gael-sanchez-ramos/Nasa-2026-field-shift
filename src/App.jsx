'use client'

import { useRef, useState } from 'react'
import FieldMap from './FieldMap'
import { fieldPoint, loadClimate, nasaSource } from './climate'
import sample from './sample.json'

const sampleBoundary = [
  { lat: 25.699, lng: -99.242 }, { lat: 25.701, lng: -99.242 },
  { lat: 25.701, lng: -99.238 }, { lat: 25.699, lng: -99.238 },
]
// Crop scenarios and soil verification: docs/FUENTES.md, sections 3–5.
const inifap = 'https://cienciasagricolas.inifap.gob.mx/index.php/agricolas/es/article/download/2186/3423?inline=1'
const crops = [
  { name: 'Grain sorghum again', summary: 'Current sequence in the sample scenario.' },
  { name: 'Sorghum, then dry bean', summary: 'A sequence studied in Nuevo León.', source: inifap },
  { name: 'Sorghum, then forage sorghum', summary: 'Exploratory option. Local suitability is not verified.' },
]
const priorities = [
  ['income', 'Income'], ['water', 'Water saving'], ['soil', 'Soil health'],
]

export default function App() {
  const [points, setPoints] = useState([])
  const [drawing, setDrawing] = useState(false)
  const [scenario, setScenario] = useState('typical')
  const [report, setReport] = useState(null)
  const [message, setMessage] = useState('')
  const [irrigation, setIrrigation] = useState('Limited')
  const [weights, setWeights] = useState({ income: 3, water: 3, soil: 3 })
  const [loading, setLoading] = useState(false)
  const request = useRef(null)
  const point = fieldPoint(points)

  function resetReport() {
    request.current?.abort()
    setLoading(false)
    setReport(null)
    setMessage('')
  }

  function useSample() {
    resetReport()
    setPoints(sampleBoundary)
    setDrawing(false)
    setReport({ ...sample, isSample: true })
  }

  async function analyze() {
    resetReport()
    const controller = new AbortController()
    request.current = controller
    setLoading(true)
    const timeout = setTimeout(() => controller.abort('timeout'), 25000)
    try {
      const climate = await loadClimate(point, controller.signal)
      if (!controller.signal.aborted) setReport({ ...climate, location: point })
    } catch {
      if (!controller.signal.aborted || controller.signal.reason === 'timeout') {
        setMessage('Could not load NASA POWER data. Retry or use the sample field.')
      }
    } finally {
      clearTimeout(timeout)
      if (request.current === controller) setLoading(false)
    }
  }

  const climate = report?.[scenario]

  return <>
    <header className="top"><strong>Field Shift</strong><span>Nuevo León pilot</span></header>
    <main>
      <h1>Plan your next crop</h1>
      <p className="intro">Outline your field and explore historical climate before planting after sorghum.</p>
      <div className="workspace">
        <section className="panel map-panel" aria-labelledby="field-title">
          <div className="pad"><h2 id="field-title">Your field</h2>
            <p>{drawing ? 'Tap the corners of your field, then finish drawing.' : 'Find your field on the satellite map.'}</p></div>
          <FieldMap points={points} drawing={drawing} center={sample.location}
            onPoint={point => setPoints(previous => [...previous, point])} />
          <div className="controls pad">
            {drawing ? <>
              <button onClick={() => setPoints(points.slice(0, -1))} disabled={!points.length}>Undo point</button>
              <button className="primary" onClick={() => setDrawing(false)} disabled={!point}>Finish drawing</button>
            </> : <button className="primary" disabled={!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} onClick={() => {
              resetReport()
              setPoints([])
              setDrawing(true)
            }}>Draw your field</button>}
            <button onClick={useSample}>Use sample field</button>
          </div>
        </section>
        <section className="panel pad results" aria-labelledby="report-title">
          <h2 id="report-title">Field report</h2>
          <label className="irrigation">Irrigation availability
            <select value={irrigation} onChange={event => setIrrigation(event.target.value)}>
              <option>Limited</option><option>Available</option><option>Rainfed</option><option>Unknown</option>
            </select>
          </label>
          <button className="primary" disabled={!point || drawing || loading} onClick={analyze}>
            {loading ? 'Loading NASA data…' : 'Analyze field'}
          </button>
          {message && <p role="alert">{message}</p>}
          <section className="report-section" aria-labelledby="nasa-title">
          <h3 id="nasa-title">NASA observations</h3>
          {climate ? <>
            <div className="controls scenarios" aria-label="Historical scenario">
              <button aria-pressed={scenario === 'typical'} onClick={() => setScenario('typical')}>Typical year</button>
              <button aria-pressed={scenario === 'dry'} onClick={() => setScenario('dry')}>Dry year</button>
            </div>
            <div aria-live="polite">
              <h4>{climate.year} regional climate</h4>
              <p>{report.isSample ? 'Sample location · Real NASA data' : 'Selected field location'} · {report.location.lat.toFixed(3)}°, {report.location.lng.toFixed(3)}°</p>
              <dl className="metrics">
                <div><dt>Annual rainfall</dt><dd>{climate.rain} mm</dd></div>
                <div><dt>Highest temperature</dt><dd>{climate.high == null ? 'Unavailable' : climate.high.toFixed(1) + ' °C'}</dd></div>
                <div><dt>Lowest temperature</dt><dd>{climate.low == null ? 'Unavailable' : climate.low.toFixed(1) + ' °C'}</dd></div>
              </dl>
              <p className="source"><a href={nasaSource}>NASA POWER Daily API</a> · {report.count} complete rainfall years evaluated, 2015–2024 UTC. Typical is closest to median annual rainfall. Dry is the second-driest year.</p>
            </div>
          </> : <p>Draw a field or load the sample to compare historical scenarios.</p>}
          </section>
          <section className="report-section" aria-labelledby="soil-title">
            <h3 id="soil-title">Local soil</h3>
            <p><strong>Not verified</strong>{report?.isSample ? ' · The sample point returned no mean value at 0–5 cm.' : ' · Soil data for this field is pending.'}</p>
            <a className="source" href="https://soilgrids.org/">ISRIC SoilGrids</a>
          </section>
          <section className="report-section" aria-labelledby="crop-title">
            <h3 id="crop-title">Crop characteristics</h3>
            <div className="crops">{crops.map(({ name, summary, source }) => <article key={name}>
              <h4>{name}</h4>
              <p>{summary}</p>
              {source && <a className="source" href={source}>INIFAP study, Table 6</a>}
            </article>)}</div>
            <p>{irrigation === 'Rainfed' ? 'Check rainfall during the local growing window.' : 'Confirm available irrigation during each crop’s growing window.'} Review local planting dates with an advisor.</p>
          </section>
          <section className="report-section" aria-labelledby="priorities-title">
            <h3 id="priorities-title">Farmer priorities</h3>
            <div className="priority-inputs">
              {priorities.map(([key, label]) => <label key={key}>
                <span>{label} <strong aria-hidden="true">{weights[key]} / 5</strong></span>
                <input type="range" min="0" max="5" value={weights[key]}
                  onChange={event => setWeights(previous => ({ ...previous, [key]: Number(event.target.value) }))} />
              </label>)}
            </div>
            <p>Rotation ranking is not yet available. Review the options with a local advisor before planting.</p>
          </section>
        </section>
      </div>
    </main>
  </>
}
