import { Figtree, Unbounded } from 'next/font/google'

// Polices du monde « Esprit de corps », servies par le site (next/font).
// Titres : Unbounded ; texte : Figtree. Les variables CSS alimentent font-titre et font-texte (globals.css).
export const titre = Unbounded({ subsets: ['latin'], variable: '--font-titre-var', display: 'swap' })
export const texte = Figtree({ subsets: ['latin'], variable: '--font-texte-var', display: 'swap' })

/** Classes à poser sur la racine d'un écran du monde « Esprit de corps » */
export const espritFonts = `${titre.variable} ${texte.variable}`
