import { supabase } from '../config/database.js'

export class DashboardService {
  /**
   * Récupère les statistiques du dashboard pour un utilisateur
   */
  async getDashboardStats(userId: string) {
    try {
      // Récupérer les infos de l'utilisateur
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('school_id, entry_year')
        .eq('id', userId)
        .single()

      if (userError || !user) {
        throw new Error('Utilisateur non trouvé')
      }

      // Stat 1 : Membres de ma promotion (même école + même année)
      const { count: myPromoCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', user.school_id)
        .eq('entry_year', user.entry_year)

      // Stat 2 : Anciens de mon école (toutes promotions)
      const { count: mySchoolCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', user.school_id)

      // Stat 3 : Total réseau (tous utilisateurs)
      const { count: totalNetworkCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      return {
        myPromoCount: myPromoCount || 0,
        mySchoolCount: mySchoolCount || 0,
        totalNetworkCount: totalNetworkCount || 0,
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  }

  /**
   * Récupère les 5 nouveaux membres de ma promotion
   */
  async getRecentMembers(userId: string) {
    try {
      // Récupérer les infos de l'utilisateur
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('school_id, entry_year')
        .eq('id', userId)
        .single()

      if (userError || !user) {
        throw new Error('Utilisateur non trouvé')
      }

      // Récupérer les 5 derniers inscrits de ma promo
      const { data: recentMembers, error: membersError } = await supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          created_at
        `)
        .eq('school_id', user.school_id)
        .eq('entry_year', user.entry_year)
        .neq('id', userId) // Exclure l'utilisateur actuel
        .order('created_at', { ascending: false })
        .limit(5)

      if (membersError) {
        throw membersError
      }

      return recentMembers || []
    } catch (error) {
      console.error('Error fetching recent members:', error)
      throw error
    }
  }
}

export const dashboardService = new DashboardService()



