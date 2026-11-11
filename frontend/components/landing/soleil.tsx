import { SOLEIL_COEUR, SOLEIL_PETALES } from '@/lib/soleil'

// Le soleil aux neuf pétales, un par école : la marque d'AET Connect et son grand motif.
// Les couleurs passent par des classes de remplissage (fill-*), le dessin par lib/soleil.ts.
// Le cœur est toujours brun-roux ; les pétales sont verts sur fond beige, crème sur fond vert.
export function Soleil({
  className = 'size-10',
  petales = 'fill-vert',
  coeur = 'fill-terre',
}: {
  className?: string
  petales?: string
  coeur?: string
}) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={className}>
      <path d={SOLEIL_PETALES} className={petales} />
      <path d={SOLEIL_COEUR} className={coeur} />
    </svg>
  )
}
