// Médaillon de motif d'une école, au centre de sa station.
// MOTIFS PROVISOIRES : des géométries simples, une seule encre, en attendant les motifs
// fournis par le client (un par école). Pour les remplacer, changer le dessin de l'index voulu.

type Props = { index: number; size?: number; ink?: string; className?: string }

const R = 20 // rayon utile dans une boîte de 48

function Motif({ index, ink }: { index: number; ink: string }) {
  switch (index % 9) {
    case 0: // bandes horizontales
      return <g fill={ink}>{[-12, -4, 4, 12].map((y) => <rect key={y} x={-R} y={y - 2} width={R * 2} height={4} />)}</g>
    case 1: // chevrons
      return <g fill="none" stroke={ink} strokeWidth={3}>{[-10, 0, 10].map((y) => <path key={y} d={`M-16 ${y + 6} L0 ${y - 4} L16 ${y + 6}`} />)}</g>
    case 2: // cercles concentriques
      return <g fill="none" stroke={ink} strokeWidth={3}>{[5, 11, 17].map((r) => <circle key={r} r={r} />)}</g>
    case 3: // damier
      return <g fill={ink}>{[-16, -8, 0, 8].flatMap((x, i) => [-16, -8, 0, 8].filter((_, j) => (i + j) % 2 === 0).map((y) => <rect key={`${x}${y}`} x={x} y={y} width={8} height={8} />))}</g>
    case 4: // losanges
      return <g fill={ink}>{[[-9, -9], [9, -9], [-9, 9], [9, 9], [0, 0]].map(([x, y]) => <path key={`${x}${y}`} d={`M${x} ${y - 6} L${x + 6} ${y} L${x} ${y + 6} L${x - 6} ${y} Z`} />)}</g>
    case 5: // trame de points
      return <g fill={ink}>{[-12, -4, 4, 12].flatMap((x) => [-12, -4, 4, 12].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r={2.5} />))}</g>
    case 6: // zigzag
      return <path d="M-18 -8 L-9 4 L0 -8 L9 4 L18 -8 M-18 6 L-9 18 L0 6 L9 18 L18 6" fill="none" stroke={ink} strokeWidth={3} />
    case 7: // triangles
      return <g fill={ink}>{[-12, 0, 12].map((x) => <path key={x} d={`M${x} -12 L${x + 6} 0 L${x - 6} 0 Z M${x} 2 L${x + 6} 14 L${x - 6} 14 Z`} />)}</g>
    default: // barres verticales
      return <g fill={ink}>{[-14, -6, 2, 10].map((x) => <rect key={x} x={x} y={-R} width={4} height={R * 2} />)}</g>
  }
}

export function SchoolMotif({ index, size = 48, ink = 'currentColor', className }: Props) {
  const clip = `motif-clip-${index}`
  return (
    <svg viewBox="-24 -24 48 48" width={size} height={size} className={className} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clip}>
          <circle r={R} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <Motif index={index} ink={ink} />
      </g>
    </svg>
  )
}
