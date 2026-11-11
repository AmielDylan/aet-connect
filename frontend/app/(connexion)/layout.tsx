import { espritFonts } from '@/lib/fonts'

// La connexion, dans le monde « Esprit de corps » (polices et surfaces de l'accueil)
export default function ConnexionLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${espritFonts} esprit font-texte`}>{children}</div>
}
