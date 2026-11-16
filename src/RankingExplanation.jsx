const criteria = [['income', 'Income'], ['water', 'Water saving'], ['soil', 'Soil health']]

export default function RankingExplanation({ crop, weights }) {
  return <details className="fold ranking-explanation">
    <summary>Why this position?</summary>
    <p>Each rating is an illustrative team estimate from 1 to 5. Higher means a better assumed fit for that priority.</p>
    <div className="score-table-wrap"><table>
      <caption>Score breakdown for {crop.name}</caption>
      <thead><tr><th scope="col">Priority</th><th scope="col">Rating</th><th scope="col">Weight</th><th scope="col">Contribution</th></tr></thead>
      <tbody>{criteria.map(([key, label]) => <tr key={key}>
        <th scope="row">{label}</th><td>{crop[key]} / 5</td><td>{(weights[key] * 100).toFixed(1)}%</td><td>{(crop[key] * weights[key]).toFixed(2)}</td>
      </tr>)}</tbody>
      <tfoot><tr><th scope="row" colSpan={3}>Weighted score / 5</th><td>{crop.score.toFixed(2)}</td></tr></tfoot>
    </table></div>
    <p>Score = sum of rating × normalized weight. Displayed values are rounded; ranking uses full precision. Equal scores share a rank.</p>
    <p>These ratings are not measured water savings, profit, soil improvement, or a yield forecast. Climate, mapped soil and irrigation availability do not change this score.</p>
  </details>
}
