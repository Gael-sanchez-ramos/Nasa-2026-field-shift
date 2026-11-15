"""Cache demo-year root-zone moisture. Requires numpy and numcodecs."""

from datetime import date, timedelta
from functools import lru_cache
import json
from pathlib import Path
from urllib.request import urlopen

import numpy as np
from numcodecs import get_codec

# NASA POWER SMAP L4 archive and processing:
# https://power.larc.nasa.gov/docs/methodology/data/sources_hydrology/#smap
ARCHIVE = 'https://nasa-power-smap.s3.amazonaws.com/smap/temporal/power_smap_daily_temporal_utc.zarr'
ROOT = Path(__file__).resolve().parents[1]


def download(path):
    with urlopen(f'{ARCHIVE}/{path}', timeout=30) as response:
        return response.read()


def make_cache(sample):
    metadata = json.loads(download('.zmetadata'))['metadata']

    @lru_cache(maxsize=6)
    def chunk(name, key):
        config = metadata[f'{name}/.zarray']
        codecs = config['filters'] or []
        decoded = get_codec(config['compressor']).decode(download(f'{name}/{key}'))
        for codec in reversed(codecs):
            decoded = get_codec(codec).decode(decoded)
        return np.frombuffer(decoded, dtype=config['dtype']).reshape(config['chunks'])

    point = sample['location']
    latitudes, longitudes = (chunk(axis, '0') for axis in ('lat', 'lon'))
    lat = int(np.argmin(abs(latitudes - point['lat'])))
    lng = int(np.argmin(abs(longitudes - point['lng'])))
    if max(abs(latitudes[lat] - point['lat']), abs(longitudes[lng] - point['lng'])) > 0.1:
        raise ValueError('The demo point is outside the archive grid.')
    origin = date.fromisoformat(metadata['time/.zattrs']['units'].split()[2])
    days = [origin + timedelta(days=int(offset)) for offset in chunk('time', '0')]
    nt, ny, nx = metadata['RZMC/.zarray']['chunks']
    series = {}
    for year in sorted({sample['typical']['year'], sample['dry']['year']}):
        start = date(year, 1, 1)
        weeks = {}
        daily = []
        for index, day in enumerate(days):
            if day.year != year:
                continue
            tile = chunk('RZMC', f'{index // nt}.{lat // ny}.{lng // nx}')
            value = float(tile[index % nt, lat % ny, lng % nx])
            if 0 <= value <= 0.9:
                weeks.setdefault((day - start).days // 7, []).append(value)
                daily.append(value)
        expected = (date(year + 1, 1, 1) - start).days
        if len(daily) != expected:
            raise ValueError(f'{year}: expected {expected} valid days, received {len(daily)}.')
        series[year] = {
            'mean': round(sum(daily) / len(daily), 4),
            'days': len(daily),
            'weeks': [
                {'date': (start + timedelta(days=7 * week)).isoformat(),
                 'mean': round(sum(values) / len(values), 4)}
                for week, values in sorted(weeks.items())
            ],
        }
    return {
        'location': point,
        'gridCenter': {'lat': float(latitudes[lat]), 'lng': float(longitudes[lng])},
        'archive': ARCHIVE,
        'parameter': 'RZMC',
        'years': series,
    }


if __name__ == '__main__':
    sample = json.loads((ROOT / 'src/sample.json').read_text())
    cache = make_cache(sample)
    (ROOT / 'src/sample-smap.json').write_text(json.dumps(cache, indent=2) + '\n')
    for year, data in cache['years'].items():
        print(f'{year}: {data["days"]} days; mean {data["mean"]:.1%}')
