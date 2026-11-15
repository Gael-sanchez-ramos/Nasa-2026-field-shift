"""Cache regional SMAP and SoilGrids map images for the demo.

Requires numpy, numcodecs, tifffile, imagecodecs, and pillow.
"""
import io
import json
import math
from urllib.parse import urlencode
from urllib.request import urlopen

import numpy as np
from PIL import Image
from tifffile import TiffFile

from cache_imerg import ROOT, cache

# https://power.larc.nasa.gov/docs/methodology/data/sources_hydrology/#smap
SMAP_ARCHIVE = 'https://nasa-power-smap.s3.amazonaws.com/smap/spatial/power_smap_monthly_spatial_utc.zarr'
SMAP_SCALE = [(None, '#a6611a'), (10, '#dfc27d'), (15, '#f5f5e8'),
              (20, '#80cdc1'), (25, '#018571')]

# https://maps.isric.org/generated/soilgrids/wv0033.html
# https://docs.isric.org/globaldata/soilgrids/SoilGrids_faqs_01.html
SOIL_WCS = 'https://maps.isric.org/mapserv/wv0033'
SOIL_LAYER = 'wv0033_15-30cm_mean'
SOIL_BOUNDS = {'north': 25.4, 'south': 24.4, 'west': -100.05, 'east': -99.05}
SOIL_SCALE = [(None, '#a6611a'), (22, '#dfc27d'), (26, '#f5f5e8'),
              (29, '#80cdc1'), (32, '#018571')]


def cache_soil():
    # WCS returns the original numeric values reprojected to Web Mercator.
    radius = 6378137
    x = lambda lng: radius * math.radians(lng)
    y = lambda lat: radius * math.asinh(math.tan(math.radians(lat)))
    west, south, east, north = (x(SOIL_BOUNDS['west']), y(SOIL_BOUNDS['south']),
                                x(SOIL_BOUNDS['east']), y(SOIL_BOUNDS['north']))
    width, height = 440, 490
    query = urlencode({
        'SERVICE': 'WCS', 'VERSION': '1.0.0', 'REQUEST': 'GetCoverage',
        'COVERAGE': SOIL_LAYER, 'CRS': 'EPSG:3857', 'RESPONSE_CRS': 'EPSG:3857',
        'BBOX': ','.join(map(str, (west, south, east, north))),
        'WIDTH': width, 'HEIGHT': height, 'FORMAT': 'GEOTIFF_INT16',
    })
    with urlopen(f'{SOIL_WCS}?{query}', timeout=60) as response:
        raw = response.read()
    with TiffFile(io.BytesIO(raw)) as tif:
        page = tif.pages[0]
        if tif.geotiff_metadata['ProjectedCSTypeGeoKey'] != 3857:
            raise ValueError('SoilGrids raster is not in Web Mercator.')
        *_, origin_x, origin_y, _ = page.tags[33922].value
        dx, dy, _ = page.tags[33550].value
        raster_bounds = (origin_x, origin_y - height * dy, origin_x + width * dx, origin_y)
        if not np.allclose(raster_bounds, (west, south, east, north), rtol=0, atol=0.1):
            raise ValueError('SoilGrids raster bounds do not match the map.')
        nodata = int(page.tags[42113].value)
        data = page.asarray()
    if data.shape != (height, width):
        raise ValueError('Unexpected SoilGrids raster size.')
    valid = (data != nodata) & (data >= 0) & (data <= 1000)
    if not valid.any():
        raise ValueError('SoilGrids returned no valid values.')
    # SoilGrids stores each percent by volume as ten integer units.
    percent = data / 10
    palette = np.array([list(bytes.fromhex(color[1:])) + [255] for _, color in SOIL_SCALE], dtype=np.uint8)
    pixels = palette[np.digitize(percent, [value for value, _ in SOIL_SCALE[1:]])]
    pixels[~valid] = 0
    out = ROOT / 'public' / 'soilgrids'
    out.mkdir(parents=True, exist_ok=True)
    Image.fromarray(pixels).save(out / 'water-retention.png', optimize=True)
    metadata = {'bounds': SOIL_BOUNDS, 'scale': SOIL_SCALE}
    (ROOT / 'src' / 'soilgrids-map.json').write_text(json.dumps(metadata, indent=2) + '\n')
    print('SoilGrids range (%)', percent[valid].min(), percent[valid].max(),
          'colors', len(np.unique(pixels[valid], axis=0)))


if __name__ == '__main__':
    cache(SMAP_ARCHIVE, 'RZMC', 'm3 m-3', 'smap', SMAP_SCALE, display_factor=100)
    cache_soil()
