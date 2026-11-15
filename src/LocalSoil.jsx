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

  return <section className="panel pad" aria-labelledby="soil-title">
    <div className="section-head">
      <h3 id="soil-title">Local soil</h3>
      {(!soil) && <span className="badge badge-warn">Not verified</span>}
    </div>
    <div aria-live="polite">
      {!location && <p>Finish drawing a field or load the sample field to check the soil map.</p>}
      {location && !polygons && <p>{failed ? 'The soil map could not be loaded.' : 'Checking the soil map…'}</p>}
      {location && polygons && !soil && <p>No mapped soil texture at this point in the Linares sheet.</p>}
      {soil && <>
        <p>Mapped surface texture: <strong>{soil.texture}</strong></p>
        <p>Soil map unit: <strong>{soil.unit}</strong></p>
        <p>Regional map estimate for the upper 30 cm at the selected point.</p>
      </>}
    </div>
    <a className="source" href={soilSource}>INEGI soil map · Linares G14-11 · 1:250,000</a>
  </section>
}
