import cache from './sample-smap.json'

const source = 'https://power.larc.nasa.gov/docs/methodology/data/sources_hydrology/#smap'
const percent = value => (value * 100).toFixed(1) + '%'

export default function RootZoneMoisture({ location, year }) {
  const samePoint = cache.location.lat === location.lat && cache.location.lng === location.lng
  const series = samePoint ? cache.years[year] : null
  if (!series) return null

  // Keep one scale across both scenarios so the bars are directly comparable.
  const peak = Math.max(...Object.values(cache.years).flatMap(data => data.weeks.map(week => week.mean)))
  const ceiling = Math.max(0.05, Math.ceil(peak * 20) / 20)

  const driestWeek = series.weeks.reduce((lowest, week) => week.mean < lowest.mean ? week : lowest)
  const weekLabel = new Date(driestWeek.date + 'T00:00:00Z').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', timeZone: 'UTC',
  })

  return <section className="moisture-history" aria-labelledby="moisture-title">
    <h4 id="moisture-title">Water in the soil</h4>
    <p><strong>{percent(series.mean)} by volume</strong> · {year} annual average · 0–100 cm depth</p>
    <figure>
      <figcaption>Weekly averages · bar scale 0–{percent(ceiling)}</figcaption>
      <div className="moisture-bars" aria-hidden="true">
        {series.weeks.map(({ date, mean }) => <span key={date}
          style={{ height: `${mean / ceiling * 100}%` }} title={`${date}: ${percent(mean)}`} />)}
      </div>
      <div className="moisture-axis" aria-hidden="true"><span>Jan</span><span>Dec</span></div>
    </figure>
    <p>Lower bars mean less water in the soil. The lowest weekly average was <strong>{percent(driestWeek.mean)}</strong> in the week starting <strong>{weekLabel}</strong>.</p>
    <p>If that time falls in your growing season, check how moist the soil is in your field.</p>
    <details>
      <summary>See weekly values</summary>
      <ul className="moisture-values">
        {series.weeks.map(({ date, mean }) => <li key={date}><time dateTime={date}>{date}</time> {percent(mean)}</li>)}
      </ul>
    </details>
    <p className="source">This is a regional estimate for an area about 9 km across. It shows total water in the soil. How much plants can use depends on local soil and roots.</p>
    <a className="source" href={source}>NASA POWER / SMAP Level 4 · RZMC</a>
  </section>
}
