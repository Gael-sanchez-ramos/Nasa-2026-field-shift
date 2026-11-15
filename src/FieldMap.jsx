import { useEffect, useRef, useState } from 'react'

const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
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

export default function FieldMap({ points, drawing, onPoint, center, recenterRequest, overlay, compact, children }) {
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
        center, zoom: compact ? 15 : 13, mapTypeId: 'satellite', gestureHandling: 'greedy',
        disableDefaultUI: true, zoomControl: true, disableDoubleClickZoom: true,
      })
      setStatus('ready')
    }).catch(() => { if (active) fail() })
    return () => {
      active = false
      window.removeEventListener('field-shift-map-error', fail)
    }
  }, [center, compact])

  useEffect(() => {
    if (status !== 'ready' || !recenterRequest) return
    map.current.setCenter(center)
    map.current.setZoom(15)
  }, [center, recenterRequest, status])

  // NASA GIBS raster tiles over the satellite base map. GIBS needs no key.
  // Past the layer's own zoom level, getTile crops the right piece of the
  // coarse tile with CSS instead of letting Maps repeat it at 256 px.
  const overlayId = overlay?.id
  const overlayDate = overlay?.date
  const overlayLevel = overlay?.level
  useEffect(() => {
    if (status !== 'ready' || !overlayId) return
    const maps = window.google.maps
    const url = (zoom, row, col) =>
      `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${overlayId}/default/${overlayDate}/GoogleMapsCompatible_Level${overlayLevel}/${zoom}/${row}/${col}.png`
    const layer = {
      tileSize: new maps.Size(256, 256),
      name: overlayId,
      credit: 'NASA GIBS',
      getTile(coord, zoom, ownerDocument) {
        const div = ownerDocument.createElement('div')
        div.style.cssText = 'width:256px;height:256px;overflow:hidden;position:relative;opacity:0.55'
        const img = ownerDocument.createElement('img')
        img.alt = ''
        if (zoom <= overlayLevel) {
          img.src = url(zoom, coord.y, coord.x)
          img.style.cssText = 'width:256px;height:256px'
        } else {
          const scale = 2 ** (zoom - overlayLevel)
          img.src = url(overlayLevel, Math.floor(coord.y / scale), Math.floor(coord.x / scale))
          img.style.cssText = `position:absolute;width:${256 * scale}px;height:${256 * scale}px;left:${-(coord.x % scale) * 256}px;top:${-(coord.y % scale) * 256}px;max-width:none`
        }
        div.append(img)
        return div
      },
      releaseTile(div) {
        div.replaceChildren()
      },
    }
    map.current.overlayMapTypes.push(layer)
    return () => map.current.overlayMapTypes.removeAt(map.current.overlayMapTypes.getLength() - 1)
  }, [overlayId, overlayDate, overlayLevel, status])

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

  return <div className={compact ? 'map map-small' : 'map'}>
    <div className="map-canvas" ref={element} />
    {status !== 'ready' && <div className="map-message">
      <span className="map-pin" aria-hidden="true">◎</span>
      <strong>{status === 'loading' ? 'Loading satellite map…' : 'Satellite map unavailable'}</strong>
      <span>{compact ? 'The field outline is illustrative.' : 'Explore the climate report with the sample field.'}</span>
    </div>}
    {status === 'ready' && overlay?.label && <div className="map-legend">{overlay.label}</div>}
    {status === 'ready' && children}
  </div>
}
