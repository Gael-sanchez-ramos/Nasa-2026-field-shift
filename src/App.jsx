'use client'

import { useRef, useState } from 'react'
import FieldMap from './FieldMap'
import VegetationHistory from './VegetationHistory'
import RootZoneMoisture from './RootZoneMoisture'
import LocalSoil from './LocalSoil'
import { fieldPoint, loadClimate, nasaSource } from './climate'
import sample from './sample.json'
import { rankRotations } from './score.js'

// Display-only boundary centered on the demo point. Actual field corners were not supplied.
const sampleBoundary = [
  [-0.001, -0.002], [0.001, -0.002], [0.001, 0.002], [-0.001, 0.002],
].map(([lat, lng]) => ({ lat: sample.location.lat + lat, lng: sample.location.lng + lng }))
const priorities = [
  ['income', 'Income'], ['water', 'Water saving'], ['soil', 'Soil health'],
]
const cropChecks = {
  'grain-sorghum': 'Check local sorghum prices and what you spent last season.',
  'sorghum-bean': 'Check when to plant beans and how well water drains in your field.',
  'forage-sorghum': 'Check who would buy the forage and how much water the local variety needs.',
}
const reportSections = ['NASA observations', 'Local soil', 'Crop characteristics', 'Farmer priorities']
const mapLayers = [
  ['satellite', 'Satellite', 'Natural color'],
  ['ndvi', 'Vegetation (NDVI)', 'Greenness, from near-infrared'],
  ['rain', 'Rainfall', 'Not shown: half-hourly snapshots read empty in a dry year'],
  ['temp', 'Temperature', 'Monthly mean air temperature'],
  ['soil', 'Soil', 'See mapped texture in the field report'],
]

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
  const rainGap = report?.typical && report?.dry ? report.typical.rain - report.dry.rain : null
  const comparison = rankRotations(weights, climate, scenario)
  const leaders = comparison.ranked.filter(crop => Math.abs(crop.score - comparison.ranked[0].score) < 1e-10)
  const topPriorities = priorities.filter(([key]) => comparison.weights[key] === Math.max(...Object.values(comparison.weights)))

  // GIBS tile overlays paint the whole map with real NASA rasters; no key or account needed.
  // POWER stays the source for the report numbers; the map layers are visual context.
  // Docs: https://nasa-gibs.github.io/gibs-api-docs/access-basics/
  const gibsYear = climate?.year ?? 2023
  const overlay = {
    ndvi: { legend: 'ndvi', id: 'MODIS_Terra_L3_NDVI_Monthly', level: 7, date: `${gibsYear}-08-01`,
      label: `MODIS Terra NDVI, monthly · August ${gibsYear} · NASA GIBS` },
    temp: { legend: 'temperature', id: 'MERRA2_2m_Air_Temperature_Monthly', level: 6, date: `${gibsYear}-08-01`,
      label: `MERRA-2 monthly mean 2 m air temperature · August ${gibsYear} · NASA GIBS` },
  }[layer] ?? null

  if (view === 'map') return <>
    <header className="top"><strong>Field Shift</strong><span>Nuevo León pilot</span></header>
    <main>
      <h1>{report && !drawing ? 'Explore your field' : 'Start by outlining your field.'}</h1>
      <p className="intro">{report && !drawing
        ? 'Open Map view to choose a layer. Select View report to return to your crop comparison.'
        : 'Find your field on the map and tap its corners. Close the outline, then select Analyze field.'}</p>
      <section className="panel map-panel" aria-label="Field map">
        <FieldMap points={points} drawing={drawing} center={report?.location ?? sample.location} recenterRequest={sampleSelections}
          overlay={overlay} onPoint={point => setPoints(previous => [...previous, point])}>
          <details className="layer-panel">
            <summary>Map view <small>· {mapLayers.find(([key]) => key === layer)?.[1]}</small></summary>
            <div className="layer-options" role="radiogroup" aria-label="Map layer">
              {mapLayers.map(([key, name, note]) => {
                const available = key === 'satellite' || key === 'ndvi' || key === 'temp'
                return <label key={key} className={available ? undefined : 'disabled'}>
                  <input type="radio" name="map-layer" value={key} checked={layer === key} disabled={!available}
                    onChange={() => setLayer(key)} />
                  <span><strong>{name}</strong><small>{note}</small></span>
                </label>
              })}
            </div>
          </details>
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
      <h1>What could you plant after sorghum?</h1>
      <p className="intro">Compare three options for your field. Move the sliders to see which option to explore first.</p>
      <div className="workspace">
        <div className="col">
          <section className="panel" aria-labelledby="field-title">
            <div className="pad">
              <h2 id="field-title">Your field</h2>
              <p>{report.isSample ? 'Demo point' : 'Selected field'} · {Math.abs(report.location.lat).toFixed(4)}° N, {Math.abs(report.location.lng).toFixed(4)}° W</p>
            </div>
            <FieldMap compact points={points} drawing={false} center={report.location} recenterRequest={sampleSelections}
              onPoint={point => setPoints(previous => [...previous, point])} />
            <div className="controls pad field-report-controls">
              <button className="primary" onClick={() => setView('map')}>View map</button>
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
                {rainGap > 0 && <p>The dry year got <strong>{rainGap} mm less rain</strong> than the typical year. Check how much rain usually falls during your crop’s growing months.</p>}
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
            {report.isSample && climate && <RootZoneMoisture location={report.location} year={climate.year} />}
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
            <label className="irrigation">Will you have water for irrigation?
              <select value={irrigation} onChange={event => setIrrigation(event.target.value)}>
                <option value="Limited">Some irrigation water</option><option value="Available">I have irrigation water</option><option value="Rainfed">Rain only</option><option value="Unknown">I am not sure</option>
              </select>
            </label>
          </section>
          <section className="panel pad" aria-labelledby="crop-title">
            <div className="section-head">
              <h3 id="crop-title">Rotation suggestions</h3>
              <span className="badge">Team estimates, not a yield model</span>
            </div>
            <p>The team rated each option from 1 to 5. Your sliders decide which ratings matter most in the order below.</p>
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
              <p><strong>What to check:</strong> {cropChecks[crop.id]}</p>
              {crop.id === 'sorghum-bean' && <a className="source" href="https://cienciasagricolas.inifap.gob.mx/index.php/agricolas/es/article/download/2186/3423?inline=1">Regional rotation study, Table 6</a>}
            </article>)}</div>
            <p>{irrigation === 'Rainfed' ? 'Check rainfall during the local growing window.' : 'Confirm available irrigation during each crop’s growing window.'} Review local planting dates with an advisor.</p>
          </section>
          <section className="panel pad accent" aria-labelledby="comparison-title">
            <h3 id="comparison-title">How to read this comparison</h3>
            <div aria-live="polite">
              <p><strong>{leaders.length > 1 ? 'Tied for first' : 'Highest score'}:</strong> {leaders.map(crop => crop.name).join(' · ')}.</p>
              <p>Most important to you: {topPriorities.map(([, label]) => label).join(', ')}. {weights.income + weights.water + weights.soil === 0 && 'All three sliders are at zero, so each priority gets equal weight. '}The ranking uses your sliders and the team’s crop ratings. It is not a yield forecast.</p>
              {climate && <p>{climate.year}, {scenario === 'dry' ? 'second-driest year' : 'closest-to-median year'} in this cache: {climate.rain} mm{climate.high != null && ` and a daily maximum of ${climate.high.toFixed(2)} °C`}. <a href={nasaSource}>NASA POWER</a>, regional cell, not a field gauge. Use this history to check water and heat risks before choosing a crop.</p>}
            </div>
            <p>Before planting, confirm your soil type, local planting dates and water availability with a local advisor. Check local prices and costs if income is your priority.</p>
          </section>
          <section className="gaps" aria-labelledby="gaps-title">
            <h3 id="gaps-title">Before you plant</h3>
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
