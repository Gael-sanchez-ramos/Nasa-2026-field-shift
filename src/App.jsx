import { useRef, useState } from 'react'
import FieldMap from './FieldMap'
import { fieldPoint, loadClimate, nasaSource } from './climate'
import sample from './sample.json'
import './App.css'

const sampleBoundary = [
  { lat: 25.699, lng: -99.242 }, { lat: 25.701, lng: -99.242 },
  { lat: 25.701, lng: -99.238 }, { lat: 25.699, lng: -99.238 },
]
const crops = [
  ['Plant sorghum again', 'Continues the current crop sequence.'],
  ['Plant dry beans', 'Adds a different crop to the rotation.'],
]

export default function App() {
  const [points, setPoints] = useState([])
  const [drawing, setDrawing] = useState(false)
  const [scenario, setScenario] = useState('typical')
  const [report, setReport] = useState(null)
  const [message, setMessage] = useState('')
  const [irrigation, setIrrigation] = useState('Limited')
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
            </> : <button className="primary" disabled={!import.meta.env.VITE_GOOGLE_MAPS_API_KEY} onClick={() => {
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
          {climate ? <>
            <div className="controls scenarios" aria-label="Historical scenario">
              <button aria-pressed={scenario === 'typical'} onClick={() => setScenario('typical')}>Typical year</button>
              <button aria-pressed={scenario === 'dry'} onClick={() => setScenario('dry')}>Dry year</button>
            </div>
            <div aria-live="polite">
              <h3>{climate.year} regional climate</h3>
              <p>{report.isSample ? 'Sample location · Real NASA data' : 'Selected field location'} · {report.location.lat.toFixed(3)}°, {report.location.lng.toFixed(3)}°</p>
              <dl className="metrics">
                <div><dt>Annual rainfall</dt><dd>{climate.rain} mm</dd></div>
                <div><dt>Highest temperature</dt><dd>{climate.high == null ? 'Unavailable' : climate.high.toFixed(1) + ' °C'}</dd></div>
                <div><dt>Lowest temperature</dt><dd>{climate.low == null ? 'Unavailable' : climate.low.toFixed(1) + ' °C'}</dd></div>
              </dl>
              <p className="source"><a href={nasaSource}>NASA POWER Daily API</a> · {report.count} complete rainfall years evaluated, 2015–2024 UTC. Typical is closest to median annual rainfall. Dry is the second-driest year.</p>
            </div>
            <div className="crops">{crops.map(([name, summary]) => <article key={name}>
              <h3>{name}</h3><p>{summary}</p>
            </article>)}</div>
            <p>{irrigation === 'Rainfed' ? 'Check rainfall during the local growing window.' : 'Confirm the water available during each crop’s growing window.'} Local planting windows and soil are pending validation.</p>
          </> : <p>Draw a field or load the sample to compare historical scenarios.</p>}
        </section>
      </div>
    </main>
  </>
}
