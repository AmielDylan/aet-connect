import { EspaceMembre } from '@/components/espace/cadre'

// Le profil d'un membre fait partie de l'espace membre : même cadre, même accès réservé
export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <EspaceMembre>{children}</EspaceMembre>
}
