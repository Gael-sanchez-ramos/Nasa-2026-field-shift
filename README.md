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
- [The raw sample request](https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR,T2M_MAX,T2M_MIN&community=AG&longitude=-99.24&latitude=25.70&start=20150101&end=20241231&format=JSON&time-standard=UTC) covers an illustrative field at 25.70° N, 99.24° W. The verified summary is bundled in `src/sample.json`. Drawn fields use an interior point to request the regional grid data.
- The report sums rainfall over complete calendar years from 2015 through 2024 (UTC), then picks the year closest to median rainfall and the second-driest year. Temperature values are the hottest daily maximum and coldest daily minimum of each selected year. Values describe regional historical climate.
- [INIFAP's Nuevo León study, Table 6](https://cienciasagricolas.inifap.gob.mx/index.php/agricolas/es/article/download/2186/3423?inline=1) includes a sorghum–dry bean sequence. The crop cards introduce the options. Local planting windows, soil, and irrigation demand still need validation before doing a crop-specific comparison.
