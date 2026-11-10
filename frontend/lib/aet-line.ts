// Plan schématique de « la ligne AET » : les écoles en stations, une seule ligne qui les relie.
// Positions schématiques (pas géographiques au mètre près) : la ligne ne fait que des segments
// à 0°, 45° et 90°, comme un plan de réseau. La ligne ne représente qu'un fait vrai :
// AET Connect réunit ces écoles dans un même réseau. Elle n'invente aucune liaison entre elles.

export const VIEWBOX = { width: 1000, height: 660 } as const

export type Station = {
  /** Clé de rapprochement avec l'école en base : ville normalisée */
  cityKey: string
  x: number
  y: number
  /** Côté où l'étiquette se place pour ne pas couvrir la ligne */
  label: 'left' | 'right' | 'above' | 'below'
}

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '')

// Ordre de la ligne : d'ouest en est par le Sahel, descente vers le golfe de Guinée, puis le Gabon.
export const STATIONS: Station[] = [
  { cityKey: normalize('Saint-Louis'), x: 90, y: 110, label: 'right' },
  { cityKey: normalize('Kati'), x: 250, y: 190, label: 'below' },
  { cityKey: normalize('Kamboincè'), x: 420, y: 190, label: 'below' },
  { cityKey: normalize('Niamey'), x: 600, y: 110, label: 'right' },
  { cityKey: normalize('Bembéréké'), x: 640, y: 270, label: 'right' },
  { cityKey: normalize('Natitingou'), x: 520, y: 310, label: 'left' },
  { cityKey: normalize('Tchitchao'), x: 480, y: 410, label: 'right' },
  { cityKey: normalize('Bingerville'), x: 290, y: 470, label: 'left' },
  { cityKey: normalize('Libreville'), x: 860, y: 590, label: 'left' },
]

// Tracé de la ligne : chaque segment est horizontal, vertical ou à 45°.
// Les sommets intermédiaires sont les coudes du plan.
export const LINE_POINTS: Array<[number, number]> = [
  [90, 110],
  [170, 190],
  [250, 190],
  [420, 190],
  [500, 110],
  [600, 110],
  [640, 150],
  [640, 270],
  [600, 310],
  [520, 310],
  [480, 350],
  [480, 410],
  [420, 470],
  [290, 470],
  [350, 530],
  [800, 530],
  [860, 590],
]

export const linePath = LINE_POINTS.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ')

/** Longueur de la ligne jusqu'à chaque station, pour faire avancer le tracé jusqu'à elle */
export function lengthUntil(x: number, y: number): number {
  let total = 0
  for (let i = 1; i < LINE_POINTS.length; i++) {
    const [ax, ay] = LINE_POINTS[i - 1]
    const [bx, by] = LINE_POINTS[i]
    total += Math.hypot(bx - ax, by - ay)
    if (bx === x && by === y) return total
  }
  return total
}

export const LINE_LENGTH = lengthUntil(Number.NaN, Number.NaN)

/** L'école en base correspondant à chaque station, dans l'ordre de la ligne ; les autres écoles à part */
export function placeSchools<T extends { city: string }>(schools: T[]) {
  const placed = STATIONS.map((station) => ({
    station,
    school: schools.find((s) => normalize(s.city) === station.cityKey) ?? null,
  })).filter((p): p is { station: Station; school: T } => p.school !== null)
  const others = schools.filter((s) => !STATIONS.some((st) => st.cityKey === normalize(s.city)))
  return { placed, others }
}
