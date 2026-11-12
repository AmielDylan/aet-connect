import { supabase } from '@/config/database'
import { SchoolFilters, SchoolWithStats, SchoolStatistics } from '@/models/school.model'

/** Toutes les lignes d'une requête, par pages de 1000 (la limite de lignes de l'API de la base) */
async function toutesLesLignes<T>(page: (de: number, a: number) => PromiseLike<{ data: unknown; error: unknown }>): Promise<T[]> {
  const lignes: T[] = []
  for (let de = 0; ; de += 1000) {
    const { data, error } = await page(de, de + 999)
    if (error) throw error
    const lot = (data ?? []) as T[]
    lignes.push(...lot)
    if (lot.length < 1000) return lignes
  }
}

export class SchoolsService {
  
  // Liste écoles avec stats agrégées
  async getSchools(filters: SchoolFilters): Promise<SchoolWithStats[]> {
    let query = supabase
      .from('schools')
      .select('*')
    
    if (filters.country) {
      query = query.eq('country', filters.country)
    }
    
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    
    query = query.order('name_fr', { ascending: true })
    
    const { data: schools, error } = await query
    
    if (error) throw error
    
    // Statistiques de toutes les écoles en trois requêtes (et non quatre par école) : les membres, puis les
    // événements actifs, comptés en mémoire
    const membres = await toutesLesLignes<{ id: string; school_id: string | null; is_active: boolean; is_ambassador: boolean }>((de, a) =>
      supabase.from('users').select('id, school_id, is_active, is_ambassador').order('id').range(de, a)
    )
    const evenements = await toutesLesLignes<{ created_by_user_id: string | null }>((de, a) =>
      supabase.from('events').select('created_by_user_id').eq('is_active', true).order('id').range(de, a)
    )

    const parEcole = new Map<string, { total_members: number; total_ambassadors: number; total_events: number }>()
    const stats = (id: string) => {
      if (!parEcole.has(id)) parEcole.set(id, { total_members: 0, total_ambassadors: 0, total_events: 0 })
      return parEcole.get(id)!
    }
    const ecoleDe = new Map<string, string>()
    for (const m of membres) {
      if (!m.school_id) continue
      ecoleDe.set(m.id, m.school_id)
      if (!m.is_active) continue
      stats(m.school_id).total_members++
      if (m.is_ambassador) stats(m.school_id).total_ambassadors++
    }
    for (const e of evenements) {
      const ecole = e.created_by_user_id ? ecoleDe.get(e.created_by_user_id) : undefined
      if (ecole) stats(ecole).total_events++
    }

    const schoolsWithStats = schools.map((school) => ({
      ...school,
      ...(parEcole.get(school.id) ?? { total_members: 0, total_ambassadors: 0, total_events: 0 }),
    }))

    return schoolsWithStats
  }
  
  // Détails école avec stats
  async getSchoolById(school_id: string): Promise<SchoolWithStats> {
    const { data: school, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', school_id)
      .single()
    
    if (error || !school) {
      throw new Error('École non trouvée')
    }
    
    // Stats agrégées
    const { count: memberCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', school_id)
      .eq('is_active', true)
    
    const { count: ambassadorCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', school_id)
      .eq('is_ambassador', true)
      .eq('is_active', true)
    
    const { data: userIds } = await supabase
      .from('users')
      .select('id')
      .eq('school_id', school_id)
    
    const ids = userIds?.map(u => u.id) || []
    
    const { count: eventCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .in('created_by_user_id', ids)
      .eq('is_active', true)
    
    return {
      ...school,
      total_members: memberCount || 0,
      total_ambassadors: ambassadorCount || 0,
      total_events: eventCount || 0
    }
  }
  
  // Statistiques détaillées
  async getSchoolStats(school_id: string): Promise<SchoolStatistics> {
    const { data: school, error } = await supabase
      .from('schools')
      .select('id, name_fr')
      .eq('id', school_id)
      .single()
    
    if (error || !school) {
      throw new Error('École non trouvée')
    }
    
    // Membres actifs
    const { data: users } = await supabase
      .from('users')
      .select('entry_year, current_country, created_at')
      .eq('school_id', school_id)
      .eq('is_active', true)
    
    const { count: ambassadorCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', school_id)
      .eq('is_ambassador', true)
      .eq('is_active', true)
    
    // Événements organisés
    const { data: userIds } = await supabase
      .from('users')
      .select('id')
      .eq('school_id', school_id)
    
    const ids = userIds?.map(u => u.id) || []
    
    const { count: eventCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .in('created_by_user_id', ids)
    
    // Codes générés
    const { count: codeCount } = await supabase
      .from('invitation_codes')
      .select('*', { count: 'exact', head: true })
      .in('created_by_user_id', ids)
    
    // Agrégation par année
    const byYear: { [key: string]: number } = {}
    users?.forEach(u => {
      if (u.entry_year) {
        byYear[u.entry_year] = (byYear[u.entry_year] || 0) + 1
      }
    })
    
    const by_entry_year = Object.entries(byYear)
      .map(([year, count]) => ({ year, count: count as number }))
      .sort((a, b) => a.year.localeCompare(b.year))
    
    // Agrégation par pays actuel
    const byCountry: { [key: string]: number } = {}
    users?.forEach(u => {
      if (u.current_country) {
        byCountry[u.current_country] = (byCountry[u.current_country] || 0) + 1
      }
    })
    
    const by_current_country = Object.entries(byCountry)
      .map(([country, count]) => ({ country, count: count as number }))
      .sort((a, b) => b.count - a.count)
    
    // Tendance de croissance (6 derniers mois)
    const growthTrend = this.calculateGrowthTrend(users || [])
    
    return {
      school_id: school.id,
      school_name: school.name_fr,
      statistics: {
        total_members: users?.length || 0,
        total_ambassadors: ambassadorCount || 0,
        total_events_organized: eventCount || 0,
        total_codes_generated: codeCount || 0,
        by_entry_year,
        by_current_country,
        growth_trend: growthTrend
      }
    }
  }
  
  // Calculer tendance croissance
  private calculateGrowthTrend(users: any[]) {
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)
    
    const monthCounts: { [key: string]: number } = {}
    
    users.forEach(u => {
      const created = new Date(u.created_at)
      if (created >= sixMonthsAgo) {
        const monthKey = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`
        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1
      }
    })
    
    return Object.entries(monthCounts)
      .map(([month, new_members]) => ({ month, new_members: new_members as number }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }
}

export const schoolsService = new SchoolsService()

