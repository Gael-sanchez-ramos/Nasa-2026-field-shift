# Field Shift

A crop rotation decision tool for farmers in Nuevo León. The first version shows regional historical climate for a sample field or a field outlined on a satellite map.

## Team

Read [docs/README.md](docs/README.md) before opening an AI chat or adding a screen.

Do not add yourself as a collaborator on this repository. Do not add team members on the NASA Space Apps site. Do not add `Co-authored-by` trailers for an AI or for anyone outside the six-person team. If you cannot push, send the file in the team chat and Gael commits it. The team is closed: Ross, Gael, Mau, Edson, Salva, Axel.

## Run locally

```sh
npm ci
npm run dev
```

Select **Use sample field** to open the report. To enable satellite drawing, copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. Enable Maps JavaScript API and restrict the browser key to your local and deployed origins. See [Google Maps setup](https://developers.google.com/maps/documentation/javascript/get-api-key).

## Deploy to Vercel

Import the repository and select the **Next.js** framework preset. Set
`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in the deployment environment before building.
The Maps key is included in the browser bundle. Restrict a standard key to the
Maps JavaScript API and the origins where the app runs.

## Data sources and method

- [NASA POWER Daily Point API](https://power.larc.nasa.gov/docs/services/api/temporal/daily/) provides corrected precipitation (`PRECTOTCORR`, mm/day), daily maximum air temperature (`T2M_MAX`, °C), and daily minimum air temperature (`T2M_MIN`, °C). See the [parameter dictionary](https://power.larc.nasa.gov/docs/tutorials/parameters/).
- The demo point is 24°53′30.9″ N, 99°32′35.1″ W. The displayed boundary is illustrative. The [NASA POWER request](https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR,T2M_MAX,T2M_MIN&community=AG&longitude=-99.5430833&latitude=24.8919167&start=20150101&end=20241231&format=JSON&time-standard=UTC) is cached in `src/sample.json`. Refresh the NDVI cache for this point using the script below. Drawn fields use an interior point to request the regional grid data.
- The report sums rainfall over complete calendar years from 2015 through 2024 (UTC), then picks the year closest to median rainfall and the second-driest year. Temperature values are the hottest daily maximum and coldest daily minimum of each selected year. Values describe regional historical climate.
- [INIFAP's Nuevo León study, Table 6](https://cienciasagricolas.inifap.gob.mx/index.php/agricolas/es/article/download/2186/3423?inline=1) includes a sorghum–dry bean sequence. The crop cards introduce the options. Local planting windows, soil, and irrigation demand still need validation before doing a crop-specific comparison.

## Cache vegetation history for the demo

Run `python3 scripts/fetch_ndvi.py` in a terminal. Sign in to
[NASA AppEEARS](https://appeears.earthdatacloud.nasa.gov/) with your Earthdata
account first to authorize the service. The script prompts for credentials,
submits a point extraction for the cached dry year and waits for the CSV.
It saves valid daily values to `src/sample-ndvi.json`. Reload the local app
and select **Use sample field**. The JSON contains observations and provenance
only. The hosted application reads that cache at build time.

The [AppEEARS API](https://appeears.earthdatacloud.nasa.gov/api/) supplies
NDVI from [HLS Sentinel-2 Vegetation Indices v2.0](https://data.nasa.gov/dataset/hls-sentinel-2-multi-spectral-instrument-vegetation-indices-daily-global-30-m-v2-0-90ed0)
at 30 m for the demo point. The [HLS VI user guide](https://lpdaac.usgs.gov/documents/2088/HLS_VI_User_Guide_V2.pdf)
describes the product cloud mask. The script excludes missing and out-of-range
values and takes the median when multiple values share a date.

## Local soil map

The app looks up the demo point or a point inside a finished field outline in
the bundled [INEGI Edaphology Series II, Linares G14-11 sheet](https://www.inegi.org.mx/app/biblioteca/ficha.html?upc=702825236120)
at 1:250,000. The lookup runs in the browser. The map unit uses `CLAVE_WRB`
and the dominant surface texture uses `CLASE_TEXT`, interpreted using the
[INEGI Series II guide](https://www.inegi.org.mx/contenidos/productos/prod_serv/contenidos/espanol/bvinegi/productos/nueva_estruc/702825231606.pdf).
The demo point intersects unit `VRmzpe+KScco/3`, with fine mapped texture.
Outside the Linares sheet or where a texture is missing, the app reports
that mapped texture is unavailable.

To regenerate the bundled layer, download the SHP ZIP from the INEGI sheet
and run `python3 scripts/prepare_soil.py path/to/download.zip public/soil/linares.json`
with `pyshp` and `pyproj` installed.

## Regional root-zone moisture

The sample field shows weekly and annual volumetric water content for its
typical and dry rainfall years using [NASA POWER / SMAP Level 4](https://power.larc.nasa.gov/docs/methodology/data/sources_hydrology/#smap).
The `RZMC` field describes the regional 0–100 cm soil column. The bundled data
uses the closest cell in the POWER daily UTC SMAP Zarr archive. Weekly means
use seven-day bins starting January 1, with a shorter final bin as needed.
Both charts share a scale. These values describe total modeled soil water
content and require local soil and crop information to estimate plant-available water.

Regenerate the demo cache with `python3 scripts/cache_smap.py` with NumPy and
numcodecs installed. The script requires a complete series for each demo year
and writes `src/sample-smap.json`.
