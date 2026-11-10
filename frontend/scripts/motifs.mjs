// Génère les motifs d'AET Connect (dessins originaux, aucune image tierce reprise) :
//  - public/motifs/topo-*.svg : une trame de courbes de niveau en larges bandes, raccordable sans couture
//    (le relief est une somme de sinus de fréquences entières sur la tuile, donc périodique) ;
//  - lib/soleil.ts : le soleil aux neuf pétales, un par école, pour la marque et les grands aplats.
// Usage : node scripts/motifs.mjs
import { writeFileSync } from 'fs'
import { contours } from 'd3-contour'

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ── Trame topographique ─────────────────────────────────────────────
const TILE = 1200
const STEP = 4 // un point de relief tous les 4 px
const N = TILE / STEP
const r = rng(1962)
const waves = Array.from({ length: 9 }, (_, k) => {
  const m = Math.floor(r() * 3) + 1, n = Math.floor(r() * 3) + 1
  return { m: r() > 0.5 ? m : -m, n, a: 1 / (1 + k * 0.35), p: r() * Math.PI * 2 }
})
// N + 1 points par côté : la grille couvre toute la tuile, bords compris (raccord sans couture)
const M = N + 1
const values = new Float64Array(M * M)
for (let j = 0; j < M; j++) {
  for (let i = 0; i < M; i++) {
    const x = i / N, y = j / N
    let v = 0
    for (const w of waves) v += w.a * Math.sin(2 * Math.PI * (w.m * x + w.n * y) + w.p)
    values[j * M + i] = v
  }
}
let min = Infinity, max = -Infinity
for (const v of values) { if (v < min) min = v; if (v > max) max = v }
const LEVELS = 13
const thresholds = Array.from({ length: LEVELS }, (_, k) => min + ((k + 0.5) * (max - min)) / LEVELS)
const polys = contours().size([M, M]).thresholds(thresholds)(Array.from(values))

// Courbe lissée par les milieux de segments (courbes quadratiques), à l'échelle de la tuile
const fmt = (n) => +(n * STEP).toFixed(1)
function ring(points) {
  const pts = points.slice(0, -1)
  if (pts.length < 3) return ''
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  let d = `M${fmt(mid(pts[pts.length - 1], pts[0])[0])} ${fmt(mid(pts[pts.length - 1], pts[0])[1])}`
  for (let k = 0; k < pts.length; k++) {
    const p = pts[k], m = mid(p, pts[(k + 1) % pts.length])
    d += `Q${fmt(p[0])} ${fmt(p[1])} ${fmt(m[0])} ${fmt(m[1])}`
  }
  return d + 'Z'
}
// Pair/impair : chaque seuil emboîté dans le précédent dessine une bande sur deux
const topoPath = polys.map((c) => c.coordinates.map((poly) => poly.map(ring).join('')).join('')).join('')

for (const [name, color] of [['vert', '#1D3B2A'], ['creme', '#F4EEE2']]) {
  writeFileSync(
    new URL(`../public/motifs/topo-${name}.svg`, import.meta.url),
    `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}" viewBox="0 0 ${TILE} ${TILE}"><path fill="${color}" fill-rule="evenodd" d="${topoPath}"/></svg>`,
  )
}

// ── Le soleil aux neuf pétales ──────────────────────────────────────
// Chaque pétale part du cœur, s'élargit et ondule (courbe en S), bout arrondi.
const s = rng(9)
const C = 100 // centre du viewBox 200 × 200
const PETALS = 9
const f1 = (n) => +n.toFixed(2)
function petal(angle) {
  // Pétale symétrique : il s'élargit vers l'extérieur et ondule, sans courbure d'ensemble
  // (pas de rotation commune aux pétales : le soleil ne doit pas évoquer une roue tournante).
  const r0 = 30, r1 = 92
  const phase = s() * Math.PI * 2, sway = 0.035 + s() * 0.025, wave = 0.025 + s() * 0.015
  const left = [], right = []
  const STEPS = 18
  for (let k = 0; k <= STEPS; k++) {
    const t = k / STEPS
    const rad = r0 + (r1 - r0) * t
    const width = 0.05 + 0.2 * Math.sin((Math.PI / 2) * Math.min(1, t * 1.05)) + wave * Math.sin(t * Math.PI * 4 + phase)
    const a = angle + sway * Math.sin(t * Math.PI * 2 + phase) * t // l'ondulation grandit vers le bout
    left.push([C + rad * Math.cos(a - width), C + rad * Math.sin(a - width)])
    right.push([C + rad * Math.cos(a + width), C + rad * Math.sin(a + width)])
  }
  const tip = [C + (r1 + 5) * Math.cos(angle), C + (r1 + 5) * Math.sin(angle)]
  const pts = [...left, tip, ...right.reverse()]
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`
  for (let k = 1; k < pts.length - 1; k++) {
    const m = [(pts[k][0] + pts[k + 1][0]) / 2, (pts[k][1] + pts[k + 1][1]) / 2]
    d += `Q${f1(pts[k][0])} ${f1(pts[k][1])} ${f1(m[0])} ${f1(m[1])}`
  }
  return d + 'Z'
}
const petals = Array.from({ length: PETALS }, (_, k) => petal(-Math.PI / 2 + (k * 2 * Math.PI) / PETALS)).join('')
// Cœur légèrement irrégulier, comme découpé aux ciseaux
let heart = ''
for (let k = 0; k <= 36; k++) {
  const a = (k / 36) * 2 * Math.PI
  const rad = 21 + 1.6 * Math.sin(a * 3 + 0.7) + 0.9 * Math.sin(a * 5)
  heart += `${k === 0 ? 'M' : 'L'}${f1(C + rad * Math.cos(a))} ${f1(C + rad * Math.sin(a))}`
}
heart += 'Z'

writeFileSync(
  new URL('../lib/soleil.ts', import.meta.url),
  `// Généré par scripts/motifs.mjs : le soleil aux neuf pétales (un par école), viewBox 0 0 200 200.\n` +
    `export const SOLEIL_PETALES = '${petals}'\nexport const SOLEIL_COEUR = '${heart}'\n`,
)
console.log('topo', topoPath.length, 'car. ; soleil', petals.length, 'car.')
