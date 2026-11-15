import { useEffect, useState } from 'react'
import { findMappedSoil, soilSource } from './soil'

export default function LocalSoil({ location }) {
  const [polygons, setPolygons] = useState(null)
  const [failed, setFailed] = useState(false)
  const hasLocation = Boolean(location)

  useEffect(() => {
    if (!hasLocation) return
    const controller = new AbortController()
    fetch('/soil/linares.json', { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Soil map unavailable')
        return response.json()
      })
      .then(data => {
        if (!controller.signal.aborted) {
          setPolygons(data)
          setFailed(false)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true)
      })
    return () => controller.abort()
  }, [hasLocation])

  const soil = location && polygons ? findMappedSoil(polygons, location) : null

  const headline = !location ? 'No field yet'
    : !polygons ? (failed ? 'Map unavailable' : 'Checking…')
    : soil ? soil.texture : 'Not on this sheet'
  const caption = !location ? 'Draw a field or open the sample to see the mapped soil.'
    : !polygons ? (failed ? 'The soil map could not be loaded.' : 'Reading the soil map.')
    : soil ? 'Mapped soil, top 30 cm' : 'No mapped texture at this point.'

  return <details className="stat-card panel">
    <summary>
      <span className="stat-kicker" id="soil-title">Mapped soil</span>
      <span className="stat-poster soil">
        <strong>{headline}</strong>
        <small>{caption}</small>
      </span>
    </summary>
    <div className="stat-body" aria-live="polite">
      {soil && <>
        <p className="stat-callout">{soil.unit}</p>
        <p className="stat-read">This is the map unit for the top 30 cm. It is not a lab test of your field.</p>
      </>}
      {!soil && <p className="stat-read">{caption}</p>}
      <p className="stat-source"><a href={soilSource}>INEGI soil map</a> · Linares sheet G14-11 · 1:250,000</p>
    </div>
  </details>
}
