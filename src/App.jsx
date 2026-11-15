'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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
  'grain-sorghum': 'Keep grain sorghum for the next season. Check local grain prices and your costs.',
  'sorghum-bean': 'Try dry beans after sorghum. Check local planting dates and how well water drains.',
  'forage-sorghum': 'Follow grain sorghum with sorghum for animal feed. Check local water needs and who would buy the feed.',
}
const irrigationAdvice = {
  Limited: 'Check when irrigation is available and how much water you can use during the growing season.',
  Available: 'Check whether your irrigation supply can cover each crop’s growing season.',
  Rainfed: 'Check rainfall and dry periods during each crop’s local growing season.',
  Unknown: 'Confirm whether you can irrigate before comparing the options.',
}
const reportSections = ['NASA observations', 'Local soil', 'Crop characteristics', 'Farmer priorities']
const mapLayers = [
  ['satellite', 'Satellite', 'Natural color'],
  ['ndvi', 'Crop health', 'NDVI · Plant greenness only'],
  ['imerg', 'Rainfall', 'NASA IMERG · Nuevo León area'],
  ['temp', 'Temperature (global)', 'MERRA-2 · Global scale'],
  ['regional-temp', 'Temperature (regional)', 'MERRA-2 · Nuevo León scale'],
  ['smap', 'Soil moisture', 'NASA SMAP · Top 1 m of soil'],
  ['soilgrids', 'Soil water retention', 'ISRIC SoilGrids · 15–30 cm deep'],
]

function CropIllustration({ kind }) {
  return <div className="crop-illustration" aria-hidden="true"><svg viewBox="0 0 64 72" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'sorghum-bean' ? <>
      <path d="M31 66V34M31 49C12 49 10 36 12 30c13-1 20 6 19 19ZM32 40c0-16 10-24 23-21 0 13-9 23-23 21Z" />
      <path d="M17 37l13 10m9-15 10-8" />
    </> : <>
      <path d="M32 67V15m0 43C19 57 12 49 10 39c13 0 21 8 22 19Zm0-10c13-1 20-9 22-19-13 0-21 8-22 19Z" />
      {[0,1,2].map(i => <path key={i} d={`M32 ${12+i*8}c-9 0-12-5-9-8 5-1 8 3 9 8Zm0 0c9 0 12-5 9-8-5-1-8 3-9 8Z`} />)}
      {kind === 'forage-sorghum' && <path d="M43 67V48m0 10c8-1 11-6 12-12-8 0-11 5-12 12Z" />}
    </>}
  </svg></div>
}

function Navigation({ view, onMap, onReport, hasReport }) {
  return <header className="top">
    <button className="brand" onClick={onMap} aria-label="Xopan home"><span className="brand-mark" aria-hidden="true">✳</span><strong>Xopan<span className="brand-period">.</span></strong></button>
    <nav aria-label="Main navigation">
      <button aria-current={view === 'map' ? 'page' : undefined} onClick={onMap}>Explore map</button>
      <button aria-current={view === 'report' ? 'page' : undefined} disabled={!hasReport} onClick={onReport}>Field report</button>
    </nav>
    <span className="pilot"><i />Nuevo León pilot</span>
  </header>
}

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
  const cropContainer = useRef(null)
  const cropPositions = useRef(new Map())

  useLayoutEffect(() => {
    const cards = cropContainer.current?.querySelectorAll('article') ?? []
    const next = new Map()
    for (const card of cards) {
      const rect = card.getBoundingClientRect()
      const previous = cropPositions.current.get(card.dataset.crop)
      next.set(card.dataset.crop, rect)
      if (previous && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        card.getAnimations().forEach(animation => animation.cancel())
        card.animate([{ transform: `translate(${previous.left - rect.left}px, ${previous.top - rect.top}px)` }, { transform: 'translate(0, 0)' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' })
      }
    }
    cropPositions.current = next
  }, [weights, view])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [view])

  useEffect(() => {
    // Keep native details semantics while animating both opening and closing.
    const animations = new Map()
    const click = event => {
      const summary = event.target.closest('summary')
      if (!summary || event.target.closest('a, button, input, select')) return
      const detail = summary.parentElement
      if (detail.tagName !== 'DETAILS' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      event.preventDefault()
      if (animations.has(detail)) return
      const opening = !detail.open
      const start = detail.getBoundingClientRect().height
      if (opening) detail.open = true
      const end = opening ? detail.getBoundingClientRect().height : summary.getBoundingClientRect().height
      detail.style.overflow = 'hidden'
      const animation = detail.animate([{ height: `${start}px` }, { height: `${end}px` }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' })
      animations.set(detail, animation)
      animation.onfinish = () => {
        detail.open = opening
        detail.style.overflow = ''
        animations.delete(detail)
      }
    }
    document.addEventListener('click', click)
    return () => {
      document.removeEventListener('click', click)
      animations.forEach((animation, detail) => { animation.cancel(); detail.style.overflow = '' })
    }
  }, [view])

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

  const navigation = <Navigation view={view} hasReport={Boolean(report)} onMap={() => setView('map')} onReport={() => setView('report')} />
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
    {navigation}
    <main key="map" className="map-page">
      <div className="eyebrow">FIELD INTELLIGENCE / NUEVO LEÓN</div>
      <h1>{report && !drawing ? 'Explore your field' : 'A closer look at your land.'}</h1>
      <p className="intro">{report && !drawing
        ? 'Open Map view to choose a layer. Select View report to return to your crop comparison.'
        : 'Explore the land. Understand the conditions. Find a rotation that fits your priorities.'}</p>
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
            <button onClick={() => { setDrawing(false); setPoints([]) }}>Cancel drawing</button>
            <button onClick={() => setPoints(points.slice(0, -1))} disabled={!points.length}>Undo point</button>
            <button className="primary" onClick={() => setDrawing(false)} disabled={points.length < 3 || !point}>Finish drawing</button>
          </> : <button className="primary" disabled={!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} onClick={() => {
            resetReport()
            setPoints([])
            setDrawing(true)
          }}>Draw your field</button>}
          <span className="spacer" />
          <span className="controls-note">Explore a real example</span>
          <button onClick={useSample}>Use sample field</button>
        </div>
      </section>
      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && <p className="map-help">Satellite drawing is unavailable in this environment. The sample report is ready to explore.</p>}
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
      <footer className="page-footer"><strong>Xopan.</strong><span>Grounded in observations. Guided by you.</span><span>Nuevo León · NASA Space Apps 2026</span></footer>
    </main>
  </>

  return <>
    {navigation}
    <main key="report" className="report-page">
      <div className="report-heading"><div><div className="eyebrow">YOUR LAND. YOUR PRIORITIES.</div>
      <h1>A new season of possibilities.</h1>
      <p className="intro">Compare what comes after sorghum, with your field in perspective.</p></div>
      <div className="scenario-switch" role="group" aria-label="Report year">
        {['typical', 'dry'].map(key => <button key={key} aria-pressed={scenario === key} onClick={() => setScenario(key)}>{key === 'dry' ? 'Dry year' : 'Typical year'}<span>{report[key].year}</span></button>)}
      </div></div>
      <div className="workspace">
        <div className="col">
          <section className="panel" aria-labelledby="field-title">
            <div className="pad">
              <div className="eyebrow">01 / THE PLACE</div><h2 id="field-title">Your field</h2>
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
              <div><div className="eyebrow">02 / WHAT MATTERS TO YOU</div><h2 id="priorities-title">Farmer priorities</h2></div>
              <span className="badge">You set these</span>
            </div>
            <div className="priority-presets" role="group" aria-label="Priority presets">
              {priorities.map(([key, label]) => <button key={key} onClick={() => setWeights(Object.fromEntries(priorities.map(([criterion]) => [criterion, criterion === key ? 5 : 1])))}>{label} first</button>)}
              <button onClick={() => setWeights({ income: 3, water: 3, soil: 3 })}>Reset</button>
            </div>
            <div className="priority-inputs">
              {priorities.map(([key, label]) => <label key={key}>
                <span>{label} <strong>{Math.round(comparison.weights[key] * 100)}%</strong></span>
                <input type="range" min="0" max="5" value={weights[key]} style={{ '--range-fill': `${weights[key] * 20}%` }} aria-valuetext={`${weights[key]} out of 5`}
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
              <div><div className="eyebrow">03 / EXPLORE THE TRADE-OFFS</div><h2 id="crop-title">Rotation suggestions</h2></div><span className="badge">3 possibilities</span>
            </div>
            <p>Ranked by your priorities and team estimates. Climate and soil data help you compare risks; they do not change this order.</p>
            <div className="crops" ref={cropContainer}>{comparison.ranked.map(crop => {
              const rank = comparison.ranked.findIndex(option => Math.abs(option.score - crop.score) < 1e-10) + 1
              return <article data-crop={crop.id} key={crop.id} className={rank === 1 ? 'leader' : undefined}>
                <div className="crop-head">
                  <span className="rank" aria-label={`Rank ${rank}`}>{rank}</span>
                  <span className="badge">{crop.isCurrent ? 'Current sequence' : crop.forage ? 'Forage' : 'Exploratory'}</span>
                </div>
                <CropIllustration kind={crop.id} />
                <h3>{crop.name}</h3>
                <p>{cropAdvice[crop.id]}</p>
                {crop.id === 'sorghum-bean' && <a className="source" href="https://cienciasagricolas.inifap.gob.mx/index.php/agricolas/es/article/download/2186/3423?inline=1">Regional study, Table 6</a>}
              </article>
            })}</div>
            <p className="decision-note" aria-live="polite">{irrigationAdvice[irrigation]}</p>
            <p>Review planting dates and field conditions with a local advisor.</p>
          </section>
        </div>
      </div>
      <section className="evidence" aria-labelledby="field-context-title">
        <div className="evidence-heading"><div><div className="eyebrow">04 / THE EVIDENCE</div><h2 id="field-context-title">The story beneath the surface.</h2></div><p>Explore the observations behind your field.</p></div>
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
              <li>NDVI shows plant greenness. It cannot identify the crop or diagnose its health.</li>
            </ul>
          </details>
        </div>
      </section>
      <footer className="page-footer"><strong>Xopan.</strong><span>Grounded in observations. Guided by you.</span><span>Nuevo León · NASA Space Apps 2026</span></footer>
    </main>
  </>
}
