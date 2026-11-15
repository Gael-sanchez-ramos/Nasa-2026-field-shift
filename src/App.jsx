'use client'

import { useRef, useState } from 'react'
import FieldMap from './FieldMap'
import VegetationHistory from './VegetationHistory'
import LocalSoil from './LocalSoil'
import { fieldPoint, loadClimate, nasaSource } from './climate'
import sample from './sample.json'
import ndviCache from './sample-ndvi.json'
import { rankRotations } from './score.js'

// Display-only boundary centered on the demo point. Actual field corners were not supplied.
const sampleBoundary = [
  [-0.001, -0.002], [0.001, -0.002], [0.001, 0.002], [-0.001, 0.002],
].map(([lat, lng]) => ({ lat: sample.location.lat + lat, lng: sample.location.lng + lng }))
const priorities = [
  ['income', 'Income'], ['water', 'Water saving'], ['soil', 'Soil health'],
]
const reportSections = ['NASA observations', 'Local soil', 'Crop characteristics', 'Farmer priorities']
const mapLayers = [
  ['satellite', 'Satellite', 'Natural color'],
  ['ndvi', 'Vegetation (NDVI)', 'Greenness, from near-infrared'],
  ['rain', 'Rainfall', 'Annual total, regional'],
  ['temp', 'Temperature', 'Hottest day, regional'],
  ['soil', 'Soil', 'Not verified here'],
]
const ndviMean = ndviCache.observations.reduce((sum, obs) => sum + obs.ndvi, 0) / ndviCache.observations.length

export default function App() {
  const [points, setPoints] = useState([])
  const [drawing, setDrawing] = useState(false)
  const [view, setView] = useState('map')
  const [scenario, setScenario] = useState('typical')
  const [report, setReport] = useState(null)
  const [message, setMessage] = useState('')
  const [irrigation, setIrrigation] = useState('Limited')
  const [weights, setWeights] = useState({ income: 3, water: 3, soil: 3 })
  const [layer, setLayer] = useState('satellite')
  const [loading, setLoading] = useState(false)
  const request = useRef(null)
  const point = fieldPoint(points)

  function resetReport() {
    request.current?.abort()
    setLoading(false)
    setReport(null)
    setMessage('')
    setLayer('satellite')
  }

  const [sampleSelections, setSampleSelections] = useState(0)

  function useSample() {
    resetReport()
    setPoints(sampleBoundary)
    setSampleSelections(previous => previous + 1)
    setDrawing(false)
    setReport({ ...sample, isSample: true })
    setView('report')
  }

  async function analyze() {
    resetReport()
    const controller = new AbortController()
    request.current = controller
    setLoading(true)
    const timeout = setTimeout(() => controller.abort('timeout'), 25000)
    try {
      const climate = await loadClimate(point, controller.signal)
      if (!controller.signal.aborted) {
        setReport({ ...climate, location: point })
        setView('report')
      }
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
  const comparison = rankRotations(weights, climate, scenario)
  const leaders = comparison.ranked.filter(crop => Math.abs(crop.score - comparison.ranked[0].score) < 1e-10)
  const topPriorities = priorities.filter(([key]) => comparison.weights[key] === Math.max(...Object.values(comparison.weights)))

  // Overlay tints restyle the field polygon; the base map stays satellite imagery.
  // Values are the cached point or regional POWER cell, never a field measurement.
  const layerTint = {
    satellite: null,
    ndvi: report?.isSample ? {
      color: '#2e7d4f', opacity: 0.25 + ndviMean * 0.4,
      label: `Mean NDVI ${ndviCache.year}: ${ndviMean.toFixed(2)} · demo point`,
    } : null,
    rain: climate ? {
      color: '#3a7bd5', opacity: 0.35,
      label: `${climate.year} rainfall: ${climate.rain} mm · NASA POWER regional cell`,
    } : null,
    temp: climate?.high != null ? {
      color: '#d15b3a', opacity: 0.35,
      label: `${climate.year} hottest day: ${climate.high.toFixed(1)} °C · NASA POWER regional cell`,
    } : null,
    soil: null,
  }[layer]

  if (view === 'map') return <>
    <header className="top"><strong>Field Shift</strong><span>Nuevo León pilot</span></header>
    <main>
      <h1>Start by outlining your field.</h1>
      <p className="intro">Find your field on the map and tap its corners. The report opens when the outline is closed.</p>
      <section className="panel map-panel" aria-label="Field map">
        <FieldMap points={points} drawing={drawing} center={sample.location} recenterRequest={sampleSelections}
          tint={layerTint} onPoint={point => setPoints(previous => [...previous, point])}>
          <fieldset className="layer-panel">
            <legend>Map view</legend>
            {mapLayers.map(([key, name, note]) => {
              const available = key === 'satellite' || (key !== 'soil' && Boolean({
                ndvi: report?.isSample, rain: climate, temp: climate?.high != null,
              }[key]))
              return <label key={key} className={available ? undefined : 'disabled'}>
                <input type="radio" name="map-layer" value={key} checked={layer === key} disabled={!available}
                  onChange={() => setLayer(key)} />
                <span><strong>{name}</strong><small>{key === 'soil' || available ? note : 'Load the report first'}</small></span>
              </label>
            })}
          </fieldset>
          {drawing && <div className="map-status">
            {points.length} {points.length === 1 ? 'corner' : 'corners'} placed · tap Finish drawing to close the outline
          </div>}
        </FieldMap>
        <div className="controls pad map-controls">
          {drawing ? <>
            <button onClick={() => setPoints(points.slice(0, -1))} disabled={!points.length}>Undo point</button>
            <button className="primary" onClick={() => setDrawing(false)} disabled={!point}>Finish drawing</button>
          </> : <button className="primary" disabled={!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} onClick={() => {
            resetReport()
            setPoints([])
            setDrawing(true)
          }}>Draw your field</button>}
          <span className="spacer" />
          <span className="controls-note">No field to draw?</span>
          <button onClick={useSample}>Use sample field</button>
        </div>
      </section>
      <section className="panel pad report-preview" aria-labelledby="report-preview-title">
        <div className="preview-head">
          <h2 id="report-preview-title">Field report</h2>
          {report
            ? <button className="primary" onClick={() => setView('report')}>View report</button>
            : <button className="primary" disabled={!point || drawing || loading} onClick={analyze}>
              {loading ? 'Loading NASA data…' : 'Analyze field'}
            </button>}
        </div>
        {message && <p role="alert">{message}</p>}
        <p>{report
          ? 'Your report is ready. Open it to compare the three rotations.'
          : 'Close the outline, then analyze the field to load its NASA data. The sample field opens the report right away.'}</p>
        <ul className="section-chips">
          {reportSections.map(name => <li key={name}>{name}</li>)}
        </ul>
      </section>
    </main>
  </>

  return <>
    <header className="top"><strong>Field Shift</strong><span>Nuevo León pilot</span></header>
    <main>
      <h1>Compare three rotations against your field’s dry year.</h1>
      <p className="intro">Your field is outlined. Move the priorities to see how the comparison changes. This is not a planting order.</p>
      <div className="workspace">
        <div className="col">
          <section className="panel" aria-labelledby="field-title">
            <div className="pad">
              <h2 id="field-title">Your field</h2>
              <p>{report.isSample ? 'Demo point' : 'Selected field'} · {Math.abs(report.location.lat).toFixed(4)}° N, {Math.abs(report.location.lng).toFixed(4)}° W</p>
            </div>
            <FieldMap compact points={points} drawing={false} center={report.location} recenterRequest={sampleSelections}
              onPoint={point => setPoints(previous => [...previous, point])} />
            <div className="controls pad">
              <button onClick={useSample}>Use sample field</button>
              <button onClick={() => { setView('map'); setDrawing(true) }}>Edit outline</button>
            </div>
          </section>
          <section className="panel pad" aria-labelledby="nasa-title">
            <div className="section-head">
              <h3 id="nasa-title">NASA observations</h3>
              <span className="badge badge-nasa">NASA data</span>
            </div>
            {climate ? <>
              <div className="controls scenarios" aria-label="Historical scenario">
                <button aria-pressed={scenario === 'typical'} onClick={() => setScenario('typical')}>Typical year</button>
                <button aria-pressed={scenario === 'dry'} onClick={() => setScenario('dry')}>Dry year</button>
              </div>
              <div aria-live="polite">
                <h4>{climate.year} regional climate</h4>
                <p>{scenario === 'dry' ? 'Second-driest' : 'Closest to median rainfall'} complete year in this series, 2015–2024.</p>
                <details className="fold">
                  <summary>Statistics: {climate.rain} mm rain{climate.high != null && ` · high ${climate.high.toFixed(1)} °C`}{climate.low != null && ` · low ${climate.low.toFixed(1)} °C`}</summary>
                  <dl className="metrics">
                    <div><dt>Annual rainfall</dt><dd>{climate.rain} mm</dd></div>
                    <div><dt>Highest temperature</dt><dd>{climate.high == null ? 'Unavailable' : climate.high.toFixed(1) + ' °C'}</dd></div>
                    <div><dt>Lowest temperature</dt><dd>{climate.low == null ? 'Unavailable' : climate.low.toFixed(1) + ' °C'}</dd></div>
                  </dl>
                  <p className="source"><a href={nasaSource}>NASA POWER Daily API</a> · {report.count} complete rainfall years evaluated, 2015–2024 UTC. Regional cell, not a gauge on the field. Typical is closest to median annual rainfall. Dry is the second-driest year.</p>
                </details>
              </div>
            </> : <p>Climate data for this field is pending.</p>}
            {report.isSample && <VegetationHistory location={report.location} />}
          </section>
          <LocalSoil location={report?.isSample ? sample.location : drawing ? null : point} />
        </div>
        <div className="col">
          <section className="panel pad" aria-labelledby="priorities-title">
            <div className="section-head">
              <h3 id="priorities-title">Farmer priorities</h3>
              <span className="badge">You set these</span>
            </div>
            <p>Set what matters most to you. The crop options below update as you move the sliders.</p>
            <div className="priority-inputs">
              {priorities.map(([key, label]) => <label key={key}>
                <span>{label} <strong>{Math.round(comparison.weights[key] * 100)}%</strong></span>
                <input type="range" min="0" max="5" value={weights[key]} aria-valuetext={`${weights[key]} out of 5`}
                  onChange={event => setWeights(previous => ({ ...previous, [key]: Number(event.target.value) }))} />
                <span className="scale" aria-hidden="true"><span>Less</span><span>More</span></span>
              </label>)}
            </div>
            <label className="irrigation">Irrigation availability
              <select value={irrigation} onChange={event => setIrrigation(event.target.value)}>
                <option>Limited</option><option>Available</option><option>Rainfed</option><option>Unknown</option>
              </select>
            </label>
          </section>
          <section className="panel pad" aria-labelledby="crop-title">
            <div className="section-head">
              <h3 id="crop-title">Rotation suggestions</h3>
              <span className="badge">Team estimates, not a yield model</span>
            </div>
            <p>Crop characteristics rated 1–5 by the team. Three rotations, ordered by your priorities. There is no single winner.</p>
            <div className="crops">{comparison.ranked.map((crop, index) => <article key={crop.name} className={index === 0 ? 'leader' : undefined}>
              <div className="crop-head">
                <span className="rank" aria-label={`Rank ${index + 1}`}>{index + 1}</span>
                <span className="badge">{crop.isCurrent ? 'Current sequence' : crop.forage ? 'Scenario · Forage' : 'Exploratory'}</span>
              </div>
              <h4>{crop.name}</h4>
              <p>{crop.summary}</p>
              <dl className="ratings">
                {priorities.map(([key, label]) => <div key={key}>
                  <dt>{label}</dt>
                  <dd aria-label={`${crop[key]} out of 5`}>{Array.from({ length: 5 }, (_, dot) =>
                    <span key={dot} className={dot < crop[key] ? 'dot on' : 'dot'} aria-hidden="true" />)}</dd>
                </div>)}
              </dl>
              {crop.bestFor.length > 0 && <p className="top-rating">Top rating: {crop.bestFor.map(key =>
                key === 'water' ? 'water saving' : key === 'soil' ? 'soil health' : key).join(' and ')}</p>}
              {crop.id === 'sorghum-bean' && <a className="source" href="https://cienciasagricolas.inifap.gob.mx/index.php/agricolas/es/article/download/2186/3423?inline=1">Regional rotation study, Table 6</a>}
            </article>)}</div>
            <p>{irrigation === 'Rainfed' ? 'Check rainfall during the local growing window.' : 'Confirm available irrigation during each crop’s growing window.'} Review local planting dates with an advisor.</p>
          </section>
          <section className="panel pad accent" aria-labelledby="comparison-title">
            <h3 id="comparison-title">How to read this comparison</h3>
            <div aria-live="polite">
              <p><strong>{leaders.length > 1 ? 'Tied for first' : 'Highest score'}:</strong> {leaders.map(crop => crop.name).join(' · ')}.</p>
              <p>Highest-weight {topPriorities.length > 1 ? 'priorities' : 'priority'}: {topPriorities.map(([, label]) => label).join(', ')}. {weights.income + weights.water + weights.soil === 0 && 'All three sliders are at zero, so each priority gets equal weight. '}The ranking uses your sliders and the team’s crop ratings. It is not a yield forecast.</p>
              {climate && <p>{climate.year}, {scenario === 'dry' ? 'second-driest year' : 'closest-to-median year'} in this cache: {climate.rain} mm{climate.high != null && ` and a daily maximum of ${climate.high.toFixed(2)} °C`}. <a href={nasaSource}>NASA POWER</a>, regional cell, not a field gauge. Historical climate gives context; it does not change the scores.</p>}
            </div>
            <p>Before planting, confirm your soil type, local planting dates and water availability with a local advisor. Check local prices and costs if income is your priority.</p>
          </section>
          <section className="gaps" aria-labelledby="gaps-title">
            <h3 id="gaps-title">What this does not know</h3>
            <ul>
              <li>The farmer’s yield, market price, or lab soil test. There is no yield model.</li>
              <li>The municipality of this {report.isSample ? 'demo point' : 'field'}. It is not verified. The mapped soil texture is a regional INEGI estimate, not a lab test.</li>
              <li>Rain on the field itself. NASA POWER is a regional cell, not a station on the field.</li>
              <li>What grows at the point. NDVI shows greenness, not crop type or yield.</li>
            </ul>
            <p>It does not tell anyone what to plant. A local advisor still has to review the choice.</p>
          </section>
        </div>
      </div>
    </main>
  </>
}
