// Supabase renvoie au plus 1 000 lignes par requête : on lit la table par lots jusqu'au dernier.
export async function toutesLesLignes<T>(page: (de: number, a: number) => PromiseLike<{ data: unknown; error: unknown }>): Promise<T[]> {
  const lignes: T[] = []
  for (let de = 0; ; de += 1000) {
    const { data, error } = await page(de, de + 999)
    if (error) throw error
    const lot = (data ?? []) as T[]
    lignes.push(...lot)
    if (lot.length < 1000) return lignes
  }
}
