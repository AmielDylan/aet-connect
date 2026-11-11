import { espritFonts } from '@/lib/fonts'

// Les écrans d'accès (mot de passe oublié, nouveau mot de passe), dans le monde « Esprit de corps »
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${espritFonts} esprit font-texte`}>{children}</div>
}
