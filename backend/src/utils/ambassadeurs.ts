import type { SupabaseClient } from '@supabase/supabase-js'

// Un seul ambassadeur par promo (école + année d'entrée) : la base le garantit
// (index users_un_ambassadeur_par_promo) ; ceci permet de refuser avec un message clair.

/** L'ambassadeur de la promo, s'il y en a un (autre que le membre `sauf`) */
export async function ambassadeurDeLaPromo(
  db: SupabaseClient,
  promo: { schoolId: string; entryYear: string },
  sauf?: string
): Promise<{ first_name: string | null; last_name: string | null } | null> {
  let query = db
    .from('users')
    .select('id, first_name, last_name')
    .eq('is_ambassador', true)
    .eq('school_id', promo.schoolId)
    .eq('entry_year', promo.entryYear)
  if (sauf) query = query.neq('id', sauf)
  const { data, error } = await query.limit(1)
  if (error) throw error
  return data?.[0] ?? null
}

export const nomComplet = (m: { first_name: string | null; last_name: string | null }) =>
  [m.first_name, m.last_name].filter(Boolean).join(' ')
