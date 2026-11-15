"""Build regional IMERG rainfall or MERRA-2 temperature overlays.

Requires NumPy and numcodecs. Run from a checkout using Python 3.
"""
from argparse import ArgumentParser
from datetime import date, timedelta
import json
from pathlib import Path
import struct
from urllib.request import urlopen
import zlib

from numcodecs import get_codec
import numpy as np

# https://power.larc.nasa.gov/docs/methodology/data/sources_meteorology/
ARCHIVE = 'https://nasa-power.s3.amazonaws.com/imerg/spatial/power_imerg_monthly_spatial_utc.zarr'
TEMPERATURE_ARCHIVE = 'https://nasa-power.s3.amazonaws.com/merra2/spatial/power_merra2_monthly_spatial_utc.zarr'
ROOT = Path(__file__).resolve().parents[1]
BOUNDS = {'north': 28, 'south': 23, 'west': -102, 'east': -97}
# Use one scale for all years. Values are monthly means in mm/day.
SCALE = [(0, '#eff7fb'), (0.5, '#c6dbef'), (1, '#9ecae1'),
         (2, '#6baed6'), (3, '#3182bd'), (4, '#08519c'), (5, '#08306b')]
TEMPERATURE_SCALE = [(None, '#4575b4'), (22, '#91bfdb'), (25, '#fee090'),
                     (28, '#fc8d59'), (31, '#d73027')]
SIZE = 400


def fetch(archive, path):
    with urlopen(f'{archive}/{path}', timeout=45) as response:
        return response.read()


def png(values):
    def block(kind, contents):
        return (struct.pack('>I', len(contents)) + kind + contents
                + struct.pack('>I', zlib.crc32(kind + contents)))

    data = b''.join(b'\0' + row.tobytes() for row in values)
    header = struct.pack('>IIBBBBB', SIZE, SIZE, 8, 6, 0, 0, 0)
    return b'\x89PNG\r\n\x1a\n' + block(b'IHDR', header) + block(b'IDAT', zlib.compress(data)) + block(b'IEND', b'')


def cache(archive, parameter, units, folder, scale, display_factor=1):
    meta = json.loads(fetch(archive, '.zmetadata'))['metadata']
    attributes = meta[f'{parameter}/.zattrs']
    if attributes['units'] != units:
        raise ValueError(f'Unexpected units for {parameter}: {attributes["units"]}.')

    def chunk(name, key='0'):
        config = meta[f'{name}/.zarray']
        result = get_codec(config['compressor']).decode(fetch(archive, f'{name}/{key}'))
        for layer in reversed(config['filters'] or []):
            result = get_codec(layer).decode(result)
        return np.frombuffer(result, dtype=config['dtype']).reshape(config['chunks'])

    sample = json.loads((ROOT / 'src/sample.json').read_text())
    years = sorted({sample['typical']['year'], sample['dry']['year']})
    origin = date.fromisoformat(meta['time/.zattrs']['units'].split()[2])
    months = [origin + timedelta(days=int(offset)) for offset in chunk('time')]
    lat, lng = chunk('lat'), chunk('lon')
    centers = (np.arange(SIZE) + 0.5) / SIZE
    x = BOUNDS['west'] + centers * (BOUNDS['east'] - BOUNDS['west'])
    north, south = np.arcsinh(np.tan(np.deg2rad([BOUNDS['north'], BOUNDS['south']])))
    y = np.rad2deg(np.arctan(np.sinh(north + centers * (south - north))))
    cols = abs(lng[:, None] - x).argmin(axis=0)
    rows = abs(lat[:, None] - y).argmin(axis=0)
    palette = np.array([list(bytes.fromhex(color[1:])) + [255] for _, color in scale], dtype=np.uint8)
    out = ROOT / 'public' / folder
    out.mkdir(parents=True, exist_ok=True)
    for year in years:
        index = next(i for i, month in enumerate(months) if month.year == year and month.month == 8)
        field = chunk(parameter, f'{index}.0.0')[0]
        region = field[np.ix_(rows, cols)]
        valid = np.isfinite(region) & (region >= attributes['valid_min']) & (region <= attributes['valid_max'])
        if not valid.any():
            raise ValueError(f'No valid regional data for August {year}.')
        display = region if display_factor == 1 else np.round(region.astype(np.float64) * display_factor, 4)
        pixels = palette[np.digitize(display, [value for value, _ in scale[1:]])]
        pixels[~valid] = 0
        (out / f'august-{year}.png').write_bytes(png(pixels))
        print(year, f'range ({units}; display factor {display_factor})',
              round(float(display[valid].min()), 2), round(float(display[valid].max()), 2),
              'colors', len(np.unique(pixels[valid], axis=0)))
    info = {'bounds': BOUNDS, 'years': years, 'scale': scale}
    (ROOT / 'src' / f'{folder}-map.json').write_text(json.dumps(info, indent=2) + '\n')


if __name__ == '__main__':
    parser = ArgumentParser(description=__doc__)
    parser.add_argument('--temperature', action='store_true', help='Cache MERRA-2 air temperature instead of IMERG rainfall')
    if parser.parse_args().temperature:
        cache(TEMPERATURE_ARCHIVE, 'T2M', 'C', 'temperature', TEMPERATURE_SCALE)
    else:
        cache(ARCHIVE, 'IMERG_PRECTOT', 'mm/day', 'imerg', SCALE)
