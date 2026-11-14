import { crops, estimateNotice } from './crops.js'
import { nasaSource } from './climate.js'

const criteria = ['income', 'water', 'soil']

export function normalizeWeights(priorities = {}) {
  const values = criteria.map(key => Number.isFinite(priorities[key]) ? Math.max(0, priorities[key]) : 0)
  const total = values.reduce((sum, value) => sum + value, 0)
  return Object.fromEntries(criteria.map((key, index) => [key, total ? values[index] / total : 1 / 3]))
}

export function rankRotations(priorities, climate, scenario = 'dry') {
  const weights = normalizeWeights(priorities)
  const ranked = crops.map(crop => ({ ...crop,
    score: criteria.reduce((sum, key) => sum + weights[key] * crop[key], 0),
    bestFor: criteria.filter(key => crop[key] === Math.max(...crops.map(option => option[key]))),
  })).sort((a, b) => b.score - a.score || crops.findIndex(crop => crop.id === a.id) - crops.findIndex(crop => crop.id === b.id))
  const bestFor = Object.fromEntries(criteria.map(key => [key, ranked.filter(crop => crop.bestFor.includes(key)).map(crop => crop.id)]))
  const leader = ranked[0]
  const tied = ranked.filter(crop => Math.abs(crop.score - leader.score) < 1e-10)
  const history = climate ? { name: leader.name, year: climate.year, mm: climate.rain, url: nasaSource } : null
  const explanation = climate
    ? `${tied.length > 1 ? 'Joint leading option: ' : 'Leading option: '}${leader.name}, based on your priorities and team estimates. NASA POWER records ${climate.rain} mm in ${climate.year}, the ${scenario === 'dry' ? 'second-driest' : 'closest-to-median rainfall'} year in the evaluated period. Historical climate provides context and does not change these estimated scores. This is not a yield forecast or a planting instruction.`
    : null
  return { weights, ranked, bestFor, history, explanation, estimateNotice }
}
