import { useId } from 'react'

// Motifs en traits, dessinés pour AET Connect dans l'esprit du bogolan : zigzags, échelles,
// points, chevrons et spirales carrées. Trait rond, épaisseur constante, une seule couleur.

const STROKE = { fill: 'none', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

/** Une frise : la tuile se répète horizontalement */
export function BogolanBand({ className = '', color = 'currentColor' }: { className?: string; color?: string }) {
  const id = useId()
  return (
    <svg aria-hidden="true" className={`block h-8 w-full ${className}`} preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="168" height="32" patternUnits="userSpaceOnUse">
          <g stroke={color} {...STROKE}>
            <path d="M4 26 12 6l8 20 8-20 8 20" />
            <path d="M48 6v20M55 6v20M62 6v20M48 16h14" />
            <path d="M100 6l10 10-10 10M112 6l10 10-10 10" />
            <path d="M134 26V6h22v16h-14v-9h8v5" />
          </g>
          <g fill={color}>
            <circle cx="76" cy="16" r="2.5" />
            <circle cx="85" cy="16" r="2.5" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

/** Un panneau couvert de motifs, en rangées décalées comme une étoffe */
export function BogolanPanel({ className = '', color = 'currentColor' }: { className?: string; color?: string }) {
  const id = useId()
  return (
    <svg aria-hidden="true" className={`block size-full ${className}`}>
      <defs>
        <pattern id={id} width="192" height="192" patternUnits="userSpaceOnUse">
          <g stroke={color} {...STROKE}>
            {/* rangée 1 : zigzag et échelle */}
            <path d="M8 40 20 12l12 28 12-28 12 28 12-28 12 28" />
            <path d="M104 12v28M114 12v28M124 12v28M134 12v28M104 26h30" />
            <path d="M152 12h32M152 22h32M152 32h32" />
            {/* rangée 2 : chevrons et spirale carrée */}
            <path d="M8 60l14 14-14 14M24 60l14 14-14 14M40 60l14 14-14 14" />
            <path d="M72 88V60h34v24H84V70h12v6" />
            <path d="M124 74h60M136 64v20M150 64v20M164 64v20M178 64v20" />
            {/* rangée 3 : losanges et peigne */}
            <path d="M24 108l14 14-14 14-14-14zM62 108l14 14-14 14-14-14z" />
            <path d="M96 136v-28h80M108 136v-20M120 136v-20M132 136v-20M144 136v-20M156 136v-20M168 136v-20" />
            {/* rangée 4 : vagues et traits */}
            <path d="M8 172c8-16 16-16 24 0s16 16 24 0 16-16 24 0" />
            <path d="M104 156v28M112 156v28M128 160l20 20M148 160l-20 20M164 156v28M172 156v28" />
          </g>
          <g fill={color}>
            <circle cx="62" cy="122" r="3" />
            <circle cx="24" cy="122" r="3" />
            <circle cx="96" cy="164" r="2.5" />
            <circle cx="96" cy="176" r="2.5" />
            <circle cx="186" cy="164" r="2.5" />
            <circle cx="186" cy="176" r="2.5" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

const GLYPHS = {
  galon: <path d="M5 12l7-6 7 6M5 19l7-6 7 6" />,
  chevrons: <path d="M4 4l6 8-6 8M12 4l6 8-6 8" />,
  spirale: <path d="M4 20V4h16v12H9V9h6v3" />,
  echelle: <path d="M6 3v18M12 3v18M18 3v18M6 12h12" />,
  losange: <path d="M12 3l8 9-8 9-8-9z" />,
} as const

/** Un signe isolé : séparateur, puce, repère */
export function Glyph({ name, className = 'size-5' }: { name: keyof typeof GLYPHS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} stroke="currentColor" {...STROKE} strokeWidth={2.4}>
      {GLYPHS[name]}
    </svg>
  )
}
