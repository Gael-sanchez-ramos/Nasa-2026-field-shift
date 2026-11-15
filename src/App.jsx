'use client'

import { useRef, useState } from 'react'
import FieldMap from './FieldMap'
import VegetationHistory from './VegetationHistory'
import RootZoneMoisture from './RootZoneMoisture'
import LocalSoil from './LocalSoil'
import { fieldPoint, loadClimate, nasaSource } from './climate'
import sample from './sample.json'
import imergMap from './imerg-map.json'
import temperatureMap from './temperature-map.json'
import smapMap from './smap-map.json'
import soilgridsMap from './soilgrids-map.json'
import { rankRotations } from './score.js'

// Display-only boundary centered on the demo point. Actual field corners were not supplied.
const sampleBoundary = [
  [-0.001, -0.002], [0.001, -0.002], [0.001, 0.002], [-0.001, 0.002],
].map(([lat, lng]) => ({ lat: sample.location.lat + lat, lng: sample.location.lng + lng }))
const priorities = [
  ['income', 'Income'], ['water', 'Water saving'], ['soil', 'Soil health'],
]
const cropAdvice = {
  'grain-sorghum': [
    'Plant grain sorghum one more time.',
    'You keep selling grain.',
    'The soil gets less of a break than if you add beans.',
  ],
  'sorghum-bean': [
    'Plant sorghum, then dry beans the next season.',
    'The beans are there to help the soil.',
    'Selling grain still brings in more money.',
  ],
  'forage-sorghum': [
    'Plant sorghum, then sorghum cut as animal feed.',
    'This is the option that needs less water.',
    'It only makes sense if someone nearby will buy that feed.',
  ],
}
const reportSections = ['NASA observations', 'Local soil', 'Crop characteristics', 'Farmer priorities']
const mapLayers = [
  ['satellite', 'Satellite', 'Natural color'],
  ['ndvi', 'Vegetation (NDVI)', 'Greenness, from near-infrared'],
  ['imerg', 'Rainfall', 'NASA IMERG · Nuevo León area'],
  ['temp', 'Temperature (global)', 'MERRA-2 · Global scale'],
  ['regional-temp', 'Temperature (regional)', 'MERRA-2 · Nuevo León scale'],
  ['smap', 'Soil moisture', 'NASA SMAP · Top 1 m of soil'],
  ['soilgrids', 'Soil water retention', 'ISRIC SoilGrids · 15–30 cm deep'],
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
  const rainMax = Math.max(report?.typical?.rain ?? 0, report?.dry?.rain ?? 0)

  // GIBS tile overlays paint the whole map with real NASA rasters; no key or account needed.
  // POWER stays the source for the report numbers; the map layers are visual context.
  // Docs: https://nasa-gibs.github.io/gibs-api-docs/access-basics/
  const gibsYear = climate?.year ?? 2023
  const hasImerg = imergMap.years.includes(gibsYear)
  const hasRegionalTemperature = temperatureMap.years.includes(gibsYear)
  const hasSmap = smapMap.years.includes(gibsYear)
  const availableLayers = { imerg: hasImerg, 'regional-temp': hasRegionalTemperature, smap: hasSmap }
  const activeLayer = availableLayers[layer] === false ? 'satellite' : layer
  const overlay = {
    smap: {
      legend: 'smap', image: `/smap/august-${gibsYear}.png`, bounds: smapMap.bounds, zoomToCoverage: true,
      label: `Estimated soil moisture (% by volume) · August ${gibsYear} · Top 1 m`,
      note: 'Regional estimate on a ~9 km grid.',
      source: ['NASA POWER / SMAP Level 4', 'https://power.larc.nasa.gov/docs/methodology/data/sources_hydrology/#smap'],
    },
    soilgrids: {
      legend: 'soilgrids', image: '/soilgrids/water-retention.png', bounds: soilgridsMap.bounds, zoomToCoverage: true,
      label: 'Estimated water retention (% by volume) · 15–30 cm deep',
      note: 'Soil property at 33 kPa. It does not change with the year.',
      source: ['ISRIC SoilGrids', 'https://maps.isric.org/generated/soilgrids/wv0033.html'],
    },
    'regional-temp': hasRegionalTemperature ? {
      legend: 'regionalTemperature', image: `/temperature/august-${gibsYear}.png`, bounds: temperatureMap.bounds,
      label: `Average air temperature at 2 m (°C) · August ${gibsYear} · NASA MERRA-2`,
    } : null,
    imerg: hasImerg ? {
      legend: 'imerg', image: `/imerg/august-${gibsYear}.png`, bounds: imergMap.bounds,
      label: `Average daily rain (mm/day) · August ${gibsYear} · NASA IMERG · ~10 km grid`,
    } : null,
    ndvi: { legend: 'ndvi', id: 'MODIS_Terra_L3_NDVI_Monthly', level: 7, date: `${gibsYear}-08-01`,
      label: `MODIS Terra NDVI, monthly · August ${gibsYear} · NASA GIBS` },
    temp: { legend: 'temperature', id: 'MERRA2_2m_Air_Temperature_Monthly', level: 6, date: `${gibsYear}-08-01`,
      label: `MERRA-2 monthly mean 2 m air temperature · August ${gibsYear} · NASA GIBS` },
  }[activeLayer] ?? null

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
            <summary>Map view <small>· {mapLayers.find(([key]) => key === activeLayer)?.[1]}</small></summary>
            <div className="layer-options" role="radiogroup" aria-label="Map layer">
              {mapLayers.map(([key, name, note]) => {
                const available = availableLayers[key] ?? true
                const noteText = available ? note : 'Available for August 2017 and 2023'
                return <label key={key} className={available ? undefined : 'disabled'}>
                  <input type="radio" name="map-layer" value={key} checked={activeLayer === key} disabled={!available}
                    onChange={() => setLayer(key)} />
                  <span><strong>{name}</strong><small>{noteText}</small></span>
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
      <p className="intro">Move the sliders. The three options below change order.</p>
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
          {climate ? <details className="stat-card panel">
            <summary>
              <span className="stat-kicker" id="climate-title">Rain and heat</span>
              <span className="climate-tiles">
                <span className="stat-poster rain">
                  <strong>{climate.rain} mm</strong>
                  <small>{scenario === 'dry' ? `Rain in ${climate.year}, the second-driest year` : `Rain in ${climate.year}, a typical year`}</small>
                </span>
                <span className="stat-poster hot">
                  <strong>{climate.high == null ? '—' : `${climate.high.toFixed(1)}°C`}</strong>
                  <small>Hottest day</small>
                </span>
                <span className="stat-poster cold">
                  <strong>{climate.low == null ? '—' : `${climate.low.toFixed(1)}°C`}</strong>
                  <small>Coldest day</small>
                </span>
              </span>
            </summary>
            <div className="stat-body">
              <div className="year-choices" role="group" aria-label="Historical scenario">
                {[['typical', 'Typical year', ''], ['dry', 'Dry year', 'second-driest']].map(([key, label, note]) => {
                  const row = report[key]
                  if (!row) return null
                  return <button key={key} type="button" className="year-choice" aria-pressed={scenario === key}
                    onClick={() => setScenario(key)}>
                    <span className="year-name">{label}<b>{row.year}{note ? ` · ${note}` : ''}</b></span>
                    <span className="year-track"><i style={{ width: `${rainMax ? row.rain / rainMax * 100 : 0}%` }} /></span>
                    <strong>{row.rain} mm</strong>
                  </button>
                })}
              </div>
              {rainGap > 0 && <p className="stat-callout">{rainGap} mm less rain in the dry year</p>}
              <p className="stat-source"><a href={nasaSource}>NASA POWER</a> · rain and temperature for a wide area, not a gauge in the field.</p>
            </div>
          </details> : <details className="stat-card panel">
            <summary>
              <span className="stat-kicker">Rain and heat</span>
              <span className="stat-poster rain"><strong>—</strong><small>Climate for this field is not loaded yet.</small></span>
            </summary>
          </details>}
        </div>
        <div className="col decision-col">
          <section className="panel pad" aria-labelledby="priorities-title">
            <div className="section-head">
              <h2 id="priorities-title">Farmer priorities</h2>
              <span className="badge">You set these</span>
            </div>
            <div className="priority-inputs">
              {priorities.map(([key, label]) => <label key={key}>
                <span>{label} <strong>{Math.round(comparison.weights[key] * 100)}%</strong></span>
                <input type="range" min="0" max="5" value={weights[key]} aria-valuetext={`${weights[key]} out of 5`}
                  onChange={event => setWeights(previous => ({ ...previous, [key]: Number(event.target.value) }))} />
                <span className="scale" aria-hidden="true"><span>Less</span><span>More</span></span>
              </label>)}
            </div>
            {weights.income + weights.water + weights.soil === 0 && <p>All three sliders are at zero, so each priority gets equal weight.</p>}
            <label className="irrigation">Will you have water for irrigation?
              <select value={irrigation} onChange={event => setIrrigation(event.target.value)}>
                <option value="Limited">Some irrigation water</option><option value="Available">I have irrigation water</option><option value="Rainfed">Rain only</option><option value="Unknown">I am not sure</option>
              </select>
            </label>
          </section>
          <section className="panel pad suggestions" aria-labelledby="crop-title">
            <div className="section-head">
              <h2 id="crop-title">Rotation suggestions</h2>
            </div>
            <div className="crops">{comparison.ranked.map((crop, index) => <article key={crop.name} className={index === 0 ? 'leader' : undefined}>
              <div className="crop-head">
                <span className="rank" aria-label={`Rank ${index + 1}`}>{index + 1}</span>
                <span className="badge">{crop.isCurrent ? 'Current sequence' : crop.forage ? 'Forage' : 'Exploratory'}</span>
              </div>
              <h3>{crop.name}</h3>
              {cropAdvice[crop.id].map(line => <p key={line}>{line}</p>)}
              {crop.id === 'sorghum-bean' && <a className="source" href="https://cienciasagricolas.inifap.gob.mx/index.php/agricolas/es/article/download/2186/3423?inline=1">Regional study, Table 6</a>}
            </article>)}</div>
            <p className="decision-note">It does not tell anyone what to plant. A local advisor still has to review the choice.</p>
          </section>
        </div>
      </div>
      <section className="evidence" aria-labelledby="why-title">
        <h2 id="why-title">Why these options?</h2>
        <div className="dash-grid">
          {report.isSample && climate && <RootZoneMoisture location={report.location} year={climate.year} />}
          {report.isSample && <VegetationHistory location={report.location} />}
          <LocalSoil location={report?.isSample ? sample.location : drawing ? null : point} />
          <details className="gaps plain-fold">
            <summary id="gaps-title">Before you plant</summary>
            <ul>
              <li>No yield, price, or lab soil test.</li>
              <li>The municipality of this {report.isSample ? 'demo point' : 'field'} is not verified.</li>
              <li>The rain number covers a wide area, not a gauge in the field.</li>
              <li>Greenness is not the crop name.</li>
            </ul>
          </details>
        </div>
      </section>
    </main>
  </>
}
