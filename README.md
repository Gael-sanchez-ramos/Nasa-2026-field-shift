# Xopan

Xopan helps rainfed farmers in Nuevo León, Mexico, compare what to plant after sorghum. It brings NASA climate and satellite data, local soil mapping, and farmer priorities into one field report. We built it for the NASA Space Apps Challenge 2026 challenge [Field Shift: Adapting Farms with NASA Data](https://www.spaceappschallenge.org/2026/challenges/field-shift-adapting-farms-with-nasa-data/).

**[Try the live app](https://field-shift-eosin.vercel.app/)** and select **Use sample field**.

## Try the pilot

1. **Find a field.** Outline a field on the satellite map, or use the sample field near Linares. The sample boundary is illustrative.
2. **Compare conditions.** Switch between **Typical year** and **Dry year**. At the sample location, NASA POWER estimates **711 mm of rain in 2017** and **623 mm in 2023**. Use **Map view** to explore rainfall, air temperature, vegetation greenness, soil moisture, and soil water retention.
3. **Explore rotations.** Compare grain sorghum again, sorghum followed by dry beans, or sorghum followed by forage sorghum. Set your priorities for income, water saving, and soil health, then open **Why this position?** to see how each score was calculated.

The ranking weights the team's ratings by the farmer's priorities. Historical climate and mapped soil provide context for the comparison; they do not change the score. Irrigation availability changes the guidance in the report. Xopan helps farmers decide what to investigate before planting. It does not predict yield, profit, or how much irrigation a field needs.

## Data sources and coverage

| Source | How Xopan uses it |
| --- | --- |
| [NASA POWER Daily Point API](https://power.larc.nasa.gov/docs/services/api/temporal/daily/) | Regional daily corrected precipitation (`PRECTOTCORR`) and maximum and minimum air temperature (`T2M_MAX`, `T2M_MIN`), from 2015–2024 UTC. The app sums rainfall by calendar year, selects the year nearest the median as typical, and uses the second-driest complete year as dry. Drawn fields query an interior point; the sample report uses bundled data. |
| [NASA GPM IMERG](https://power.larc.nasa.gov/docs/methodology/data/sources_meteorology/#imerg) | Regional average daily rainfall maps for August 2017 and 2023. |
| [NASA MERRA-2](https://power.larc.nasa.gov/docs/methodology/data/sources_meteorology/#merra-2) and [NASA GIBS](https://nasa-gibs.github.io/gibs-api-docs/access-basics/) | Monthly air temperature at 2 m: global GIBS tiles and regional August maps for the sample years. GIBS also supplies the monthly MODIS Terra NDVI map layer. |
| [NASA POWER / SMAP Level 4](https://power.larc.nasa.gov/docs/methodology/data/sources_hydrology/#smap) | Estimated moisture in the top meter of soil. The sample report shows weekly and annual values; the regional map shows August of each sample year. The source grid is about 9 km. |
| [NASA HLS Sentinel-2 Vegetation Indices v2.0](https://data.nasa.gov/dataset/hls-sentinel-2-multi-spectral-instrument-vegetation-indices-daily-global-30-m-v2-0-90ed0) via [AppEEARS](https://appeears.earthdatacloud.nasa.gov/api/) | NDVI history at the sample point at 30 m. The report shows the 2023 record for either climate scenario. NDVI describes vegetation greenness, not crop type, yield, or crop health on its own. |
| [INEGI Edaphology Series II, Linares G14-11](https://www.inegi.org.mx/app/biblioteca/ficha.html?upc=702825236120) | Mapped topsoil texture at 1:250,000. The sample point falls in unit `VRmzpe+KScco/3`, displayed as **Clayey soil**. The [INEGI guide](https://www.inegi.org.mx/contenidos/productos/prod_serv/contenidos/espanol/bvinegi/productos/nueva_estruc/702825231606.pdf) defines the texture classes. This is not a field lab result. |
| [ISRIC SoilGrids](https://maps.isric.org/generated/soilgrids/wv0033.html) | Static estimate of soil water retention at 33 kPa and 15–30 cm depth around Linares, from the 250 m source product. It does not show how wet the soil was in a given year. |
| [INIFAP's Nuevo León rotation study, Table 6](https://cienciasagricolas.inifap.gob.mx/index.php/agricolas/es/article/download/2186/3423?inline=1) | Regional reference for the sorghum–dry bean sequence. It does not validate the numerical ratings used in the pilot. |

The sample point is **24.8919167° N, 99.5430833° W**. The regional map layers and the INEGI lookup have limited coverage. Open **Data sources and method** for the sources and periods behind the report. Expanding the pilot would require locally validated crop options, planting calendars, and soil data.

## Run locally

Use Node.js **20.9 or later** and npm.

```sh
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The sample report works without a Maps key. To enable the satellite map and drawing, copy [`.env.example`](.env.example) to `.env.local` and set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. Use a [Google Maps browser key](https://developers.google.com/maps/documentation/javascript/get-api-key) restricted to the Maps JavaScript API and the sites that use it. Keep `.env.local` out of Git. For Vercel, add the variable in the project settings before building.

```sh
npm run lint
npm run build
```

## Refresh the bundled data

The demo caches are already included. Run these scripts from the repository root only if you need to regenerate them.

| Data | Command and requirements |
| --- | --- |
| HLS vegetation history | `python3 scripts/fetch_ndvi.py`. Sign in to AppEEARS with an Earthdata account first; the script prompts for credentials. |
| Weekly and annual SMAP values | `python3 scripts/cache_smap.py` with NumPy and numcodecs. |
| Regional rainfall and air temperature maps | `python3 scripts/cache_imerg.py` and `python3 scripts/cache_imerg.py --temperature` with NumPy and numcodecs. |
| Regional SMAP moisture and SoilGrids retention maps | `python3 scripts/cache_moisture_maps.py` with NumPy, numcodecs, Pillow, tifffile, and imagecodecs. |
| INEGI soil lookup | Download the Linares shapefile ZIP and run `python3 scripts/prepare_soil.py path/to/download.zip public/soil/linares.json` with pyshp and pyproj. |

## Credits

Xopan uses Next.js, React, Google Maps, Google Fonts (DM Sans and Instrument Serif), Python, and Vercel. The team used OpenAI Codex, Claude Code, Grok, and Kimi as development aids, including for application code, data preparation scripts, interface text, and documentation. The environmental data come from the sources listed above. The running app uses a weighted calculation, with no generative AI model in the ranking.
