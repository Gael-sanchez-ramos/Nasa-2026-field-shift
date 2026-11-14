import { useEffect, useRef, useState } from 'react'

const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
let mapsPromise

function loadMaps() {
  // Google Maps direct script loading: https://developers.google.com/maps/documentation/javascript/load-maps-js-api
  mapsPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    window.fieldShiftMapReady = () => resolve(window.google.maps)
    window.gm_authFailure = () => window.dispatchEvent(new Event('field-shift-map-error'))
    script.src = 'https://maps.googleapis.com/maps/api/js?' + new URLSearchParams({
      key, callback: 'fieldShiftMapReady', loading: 'async', language: 'en',
    })
    script.onerror = reject
    document.head.append(script)
  })
  return mapsPromise
}

export default function FieldMap({ points, drawing, onPoint, center }) {
  const element = useRef(null)
  const map = useRef(null)
  const [status, setStatus] = useState(key ? 'loading' : 'unconfigured')

  useEffect(() => {
    if (!key) return
    let active = true
    const fail = () => setStatus('error')
    window.addEventListener('field-shift-map-error', fail)
    loadMaps().then(maps => {
      if (!active) return
      map.current = new maps.Map(element.current, {
        center, zoom: 13, mapTypeId: 'satellite', gestureHandling: 'greedy',
        disableDefaultUI: true, zoomControl: true, disableDoubleClickZoom: true,
      })
      setStatus('ready')
    }).catch(() => { if (active) fail() })
    return () => {
      active = false
      window.removeEventListener('field-shift-map-error', fail)
    }
  }, [center])

  useEffect(() => {
    if (status !== 'ready' || !drawing) return
    const listener = map.current.addListener('click', event => onPoint(event.latLng.toJSON()))
    return () => listener.remove()
  }, [status, drawing, onPoint])

  useEffect(() => {
    if (status !== 'ready') return
    // Google Maps shapes: https://developers.google.com/maps/documentation/javascript/shapes
    const { Polygon, Polyline } = window.google.maps
    const Shape = drawing ? Polyline : Polygon
    const shape = new Shape({
      map: map.current, [drawing ? 'path' : 'paths']: points, clickable: false,
      strokeColor: '#d4f566', strokeWeight: 3, fillColor: '#d4f566', fillOpacity: 0.25,
    })
    return () => shape.setMap(null)
  }, [points, status, drawing])

  return <div className="map">
    <div className="map-canvas" ref={element} />
    {status !== 'ready' && <div className="map-message">
      <span className="map-pin" aria-hidden="true">◎</span>
      <strong>{status === 'loading' ? 'Loading satellite map…' : 'Satellite map unavailable'}</strong>
      <span>Explore the climate report with the sample field.</span>
    </div>}
  </div>
}
