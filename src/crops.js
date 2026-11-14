// Team estimates, 2026-11-14. Ordinal 1–5 preferences, not NASA data,
// measured water demand, profit, or a yield model. See docs/FUENTES.md §4.
export const estimateNotice = 'Team estimate, not a yield model.'

export const crops = [
  { id: 'grain-sorghum', name: 'Grain sorghum again',
    summary: 'Current sequence in the sample scenario; local practice is not verified.',
    water: 3, soil: 1, income: 5, forage: false, isCurrent: true },
  { id: 'sorghum-bean', name: 'Sorghum, then dry bean',
    summary: 'Exploratory sequence. Local suitability and planting windows need verification.',
    water: 2, soil: 5, income: 3, forage: false, isCurrent: false },
  { id: 'forage-sorghum', name: 'Sorghum, then forage sorghum',
    summary: 'Exploratory forage scenario. Local suitability is not verified.',
    water: 5, soil: 2, income: 1, forage: true, isCurrent: false },
]
