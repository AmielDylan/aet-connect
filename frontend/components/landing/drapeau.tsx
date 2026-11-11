// Les drapeaux des pays des écoles, dessinés en SVG (3:2) : les emoji de drapeau ne s'affichent pas sous Windows.
// Le drapeau porte le nom du pays pour les lecteurs d'écran.

/** Étoile à cinq branches, pointe en haut */
function etoile(cx: number, cy: number, r: number) {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rayon = i % 2 === 0 ? r : r * 0.382
    const a = (Math.PI / 5) * i - Math.PI / 2
    pts.push(`${(cx + rayon * Math.cos(a)).toFixed(2)},${(cy + rayon * Math.sin(a)).toFixed(2)}`)
  }
  return pts.join(' ')
}

const verticales = (a: string, b: string, c: string) => (
  <>
    <rect width="10" height="20" fill={a} />
    <rect x="10" width="10" height="20" fill={b} />
    <rect x="20" width="10" height="20" fill={c} />
  </>
)
const horizontales = (a: string, b: string, c: string) => (
  <>
    <rect width="30" height="6.67" fill={a} />
    <rect y="6.67" width="30" height="6.67" fill={b} />
    <rect y="13.33" width="30" height="6.67" fill={c} />
  </>
)

const DRAPEAUX: Record<string, React.ReactNode> = {
  'Côte d’Ivoire': verticales('#F77F00', '#FFFFFF', '#009E60'),
  Mali: verticales('#14B53A', '#FCD116', '#CE1126'),
  Gabon: horizontales('#009E60', '#FCD116', '#3A75C4'),
  Sénégal: (
    <>
      {verticales('#00853F', '#FDEF42', '#E31B23')}
      <polygon points={etoile(15, 10, 3.6)} fill="#00853F" />
    </>
  ),
  Niger: (
    <>
      {horizontales('#E05206', '#FFFFFF', '#0DB02B')}
      <circle cx="15" cy="10" r="2.4" fill="#E05206" />
    </>
  ),
  Bénin: (
    <>
      <rect width="30" height="10" fill="#FCD116" />
      <rect y="10" width="30" height="10" fill="#E8112D" />
      <rect width="12" height="20" fill="#008751" />
    </>
  ),
  'Burkina Faso': (
    <>
      <rect width="30" height="10" fill="#EF2B2D" />
      <rect y="10" width="30" height="10" fill="#009E49" />
      <polygon points={etoile(15, 10, 3.8)} fill="#FCD116" />
    </>
  ),
  Togo: (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} y={i * 4} width="30" height="4" fill={i % 2 === 0 ? '#006A4E' : '#FFCE00'} />
      ))}
      <rect width="12" height="12" fill="#D21034" />
      <polygon points={etoile(6, 6, 4)} fill="#FFFFFF" />
    </>
  ),
}

// La base écrit « Côte d'Ivoire » avec une apostrophe droite
const cle = (pays: string) => pays.replace(/'/g, '’').trim()

export function Drapeau({ pays, className = 'h-[0.75em] w-auto' }: { pays: string; className?: string }) {
  const dessin = DRAPEAUX[cle(pays)]
  if (!dessin) return null
  return (
    <svg viewBox="0 0 30 20" role="img" aria-label={pays} className={`inline-block shrink-0 overflow-hidden rounded-[2px] ${className}`}>
      {dessin}
    </svg>
  )
}
