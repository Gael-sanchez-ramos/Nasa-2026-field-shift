import cache from './sample-smap.json'

const source = 'https://power.larc.nasa.gov/docs/methodology/data/sources_hydrology/#smap'
const percent = value => (value * 100).toFixed(1) + '%'

function moistureColor(amount) {
  const t = Math.min(1, Math.max(0, amount))
  const from = [214, 186, 128]
  const to = [20, 112, 145]
  const rgb = from.map((channel, index) => Math.round(channel + (to[index] - channel) * t))
  return `rgb(${rgb.join(',')})`
}

export default function RootZoneMoisture({ location, year }) {
  const samePoint = cache.location.lat === location.lat && cache.location.lng === location.lng
  const series = samePoint ? cache.years[year] : null
  if (!series) return null

  const peak = Math.max(...Object.values(cache.years).flatMap(data => data.weeks.map(week => week.mean)))
  const ceiling = Math.max(0.05, Math.ceil(peak * 20) / 20)
  const driestWeek = series.weeks.reduce((lowest, week) => week.mean < lowest.mean ? week : lowest)
  const weekLabel = new Date(driestWeek.date + 'T00:00:00Z').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', timeZone: 'UTC',
  })

  return <details className="stat-card panel">
    <summary>
      <span className="stat-kicker">Water in the soil</span>
      <span className="stat-poster wet">
        <strong>{percent(series.mean)}</strong>
        <small>of the soil was water in {year}</small>
      </span>
    </summary>
    <div className="stat-body">
      <p className="stat-read">Each bar is one week. Taller and bluer means more water in the top meter of soil.</p>
      <div className="big-bars" key={year} role="group" aria-label={`Weekly soil moisture in ${year}`}>
        {series.weeks.map(({ date, mean }) => <span key={date} tabIndex={0} role="img" aria-label={`${date}: ${percent(mean)}`} data-tooltip={`${date} · ${percent(mean)}`}
          style={{ height: `${mean / ceiling * 100}%`, background: moistureColor(mean / ceiling) }} />)}
      </div>
      <div className="big-axis" aria-hidden="true"><span>Jan</span><span>Dec</span></div>
      <p className="stat-callout">Driest week · {percent(driestWeek.mean)} · {weekLabel}</p>
      <p className="stat-source"><a href={source}>NASA POWER / SMAP</a> · a cell about 9 km across, not a probe in the field.</p>
    </div>
  </details>
}
