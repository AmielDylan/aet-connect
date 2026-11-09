/**
 * Texte de recherche saisi par un utilisateur, rendu inoffensif pour les filtres PostgREST :
 * plus de virgule ni de parenthèse (qui ajouteraient des conditions dans un or()),
 * plus de joker (% _ *), plus de guillemet ni d'antislash.
 */
export function plainSearchTerm(input: unknown, maxLength = 100): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/[,()"'\\%_*:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

/** « Kérékou » → « kerekou » : même normalisation que la colonne directory_entries.search_text. */
export function accentFree(input: string): string {
  return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}
