// INEGI Edaphology Series II, Linares G14-11, 1:250,000.
// Interpretation guide: https://www.inegi.org.mx/contenidos/productos/prod_serv/contenidos/espanol/bvinegi/productos/nueva_estruc/702825231606.pdf
export const soilSource = 'https://www.inegi.org.mx/app/biblioteca/ficha.html?upc=702825236120'
const textures = { 1: 'Coarse', 2: 'Medium', 3: 'Fine' }

export function findMappedSoil(polygons, { lat, lng }) {
  for (const [[west, south, east, north], unit, texture, rings] of polygons) {
    if (lng < west || lng > east || lat < south || lat > north) continue
    let inside = false
    for (const ring of rings) {
      for (let i = 0, previous = ring.length - 1; i < ring.length; previous = i++) {
        const [x1, y1] = ring[previous]
        const [x2, y2] = ring[i]
        if ((y1 > lat) !== (y2 > lat) && lng < x1 + (lat - y1) * (x2 - x1) / (y2 - y1)) {
          inside = !inside
        }
      }
    }
    if (inside && textures[texture]) return { unit, texture: textures[texture] }
  }
  return null
}
