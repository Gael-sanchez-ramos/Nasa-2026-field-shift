"""Cache the demo point's NDVI using NASA AppEEARS. Python 3 standard library only."""

import base64
import csv
from datetime import date
from getpass import getpass
import io
import json
from pathlib import Path
from statistics import median
from time import monotonic, sleep
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

# https://appeears.earthdatacloud.nasa.gov/api/
# https://lpdaac.usgs.gov/documents/2088/HLS_VI_User_Guide_V2.pdf
API = 'https://appeears.earthdatacloud.nasa.gov/api'
PRODUCT = 'HLSS30_VI.020'
ROOT = Path(__file__).resolve().parents[1]


def request(path, authorization=None, method='GET', payload=None):
    headers = {'Authorization': authorization} if authorization else {}
    body = None
    if payload is not None:
        headers['Content-Type'] = 'application/json'
        body = json.dumps(payload).encode()
    elif method == 'POST':
        body = b''
    query = Request(API + path, data=body, headers=headers, method=method)
    try:
        with urlopen(query, timeout=45) as response:
            return response.read()
    except HTTPError as error:
        raise RuntimeError(f'AppEEARS returned HTTP {error.code} for {path}.') from None


def observations(contents, year):
    values = {}
    for contents_csv in contents:
        rows = csv.DictReader(io.StringIO(contents_csv.decode('utf-8-sig')))
        column = next((name for name in rows.fieldnames or []
                       if name == 'NDVI' or name.upper().endswith('_NDVI')), None)
        if not column:
            continue
        for row in rows:
            try:
                day = date.fromisoformat(row['Date'][:10])
                value = float(row[column])
            except (KeyError, TypeError, ValueError):
                continue
            # AppEEARS point output reports scaled values. HLS VI masks cloudy pixels.
            if day.year == year and -1 <= value <= 1:
                values.setdefault(day.isoformat(), []).append(value)
    return [{'date': day, 'ndvi': round(median(values[day]), 4)} for day in sorted(values)]


def main():
    sample = json.loads((ROOT / 'src/sample.json').read_text())
    location = sample['location']
    if not sample.get('dry'):
        raise RuntimeError('Cache the demo climate from NASA POWER first to select its dry year.')
    year = sample['dry']['year']
    print(f'Requesting {year} NDVI at the Field Shift demo point from NASA AppEEARS.')
    username = input('Earthdata username: ').strip()
    password = getpass('Earthdata password: ')
    if not username or not password:
        raise RuntimeError('Earthdata username and password are required.')
    basic = base64.b64encode(f'{username}:{password}'.encode()).decode()
    token = json.loads(request('/login', f'Basic {basic}', 'POST'))['token']
    auth = f'Bearer {token}'
    task = json.loads(request('/task', auth, 'POST', {
        'task_name': f'Field Shift demo NDVI {year}',
        'task_type': 'point',
        'params': {
            'dates': [{'startDate': f'01-01-{year}', 'endDate': f'12-31-{year}'}],
            'layers': [{'product': PRODUCT, 'layer': 'NDVI'}],
            'coordinates': [{'latitude': location['lat'], 'longitude': location['lng']}],
        },
    }))
    task_id = task['task_id']
    print(f'AppEEARS task: {task_id}')
    deadline = monotonic() + 1800
    while monotonic() < deadline:
        status = json.loads(request(f'/task/{task_id}', auth))['status']
        if status == 'done':
            break
        if status in {'error', 'failed', 'cancelled', 'canceled'}:
            raise RuntimeError(f'AppEEARS task ended with status: {status}.')
        sleep(15)
    else:
        raise RuntimeError('AppEEARS is still processing. Check the task in AppEEARS.')
    bundle = json.loads(request(f'/bundle/{task_id}', auth))
    files = [request(f'/bundle/{task_id}/{file["file_id"]}', auth)
             for file in bundle['files'] if file['file_name'].lower().endswith('.csv')]
    series = observations(files, year)
    if not series:
        raise RuntimeError('No valid NDVI observations were found. The existing cache was preserved.')
    output = ROOT / 'src/sample-ndvi.json'
    temporary = output.with_suffix('.json.tmp')
    temporary.write_text(json.dumps({
        'product': PRODUCT, 'location': location, 'year': year, 'observations': series,
    }, indent=2) + '\n')
    temporary.replace(output)
    print(f'Saved {len(series)} observations to {output.relative_to(ROOT)}.')


if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, URLError, TimeoutError) as error:
        raise SystemExit(str(error)) from None
