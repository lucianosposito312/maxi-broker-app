import { supabase } from './supabase';

export const analyticsService = {
  /**
   * Registrar una visualización de página
   * @param {string} email - Email del usuario (o 'anonymous')
   * @param {string} path - Ruta de la página (/academia, /curso-study, etc)
   * @param {string} referrer - De dónde vino (opcional)
   */
  async trackPageView(email, path, referrer = null) {
    try {
      // Excluir al admin
      if (email === 'mdg.gonzalez.damian@gmail.com') {
        console.log('[Analytics] Admin detected, skipping tracking');
        return;
      }

      const { error } = await supabase
        .from('page_views')
        .insert([{
          email: email || 'anonymous',
          path,
          referrer: referrer || document.referrer,
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('[Analytics] Error tracking page view:', error);
      } else {
        console.log(`[Analytics] Page view tracked: ${path} by ${email || 'anonymous'}`);
      }
    } catch (err) {
      console.error('[Analytics] Unexpected error:', err);
    }
  },

  /**
   * Obtener estadísticas de page views
   * @param {Date} startDate - Fecha de inicio
   * @param {Date} endDate - Fecha de fin
   * @returns {Object} { totalViews, uniqueVisitors, viewsByPath }
   */
  async getPageViewStats(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('page_views')
        .select('email, path, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .neq('email', 'mdg.gonzalez.damian@gmail.com');

      if (error) throw error;

      const totalViews = data?.length || 0;
      
      // Contar visitantes únicos (excluyendo anonymous)
      const uniqueEmails = new Set(
        data
          ?.filter(d => d.email !== 'anonymous')
          .map(d => d.email) || []
      );
      const uniqueVisitors = uniqueEmails.size;

      // Agrupar por ruta
      const viewsByPath = {};
      data?.forEach(view => {
        viewsByPath[view.path] = (viewsByPath[view.path] || 0) + 1;
      });

      return {
        totalViews,
        uniqueVisitors,
        viewsByPath,
        anonymousViews: data?.filter(d => d.email === 'anonymous').length || 0
      };
    } catch (error) {
      console.error('[Analytics] Error fetching stats:', error);
      return {
        totalViews: 0,
        uniqueVisitors: 0,
        viewsByPath: {},
        anonymousViews: 0
      };
    }
  },

  /**
   * Obtener estadísticas rápidas para el dashboard
   * @returns {Object} { today, thisWeek, thisMonth, total }
   */
  async getDashboardStats() {
    try {
      const now = new Date();
      
      // Hoy
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
      
      // Esta semana (últimos 7 días)
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      weekStart.setHours(0, 0, 0, 0);
      
      // Este mes
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Todo el tiempo
      const allStart = new Date('2020-01-01');

      const [todayStats, weekStats, monthStats, totalStats] = await Promise.all([
        this.getPageViewStats(todayStart, todayEnd),
        this.getPageViewStats(weekStart, now),
        this.getPageViewStats(monthStart, now),
        this.getPageViewStats(allStart, now)
      ]);

      return {
        today: todayStats.totalViews,
        thisWeek: weekStats.totalViews,
        thisMonth: monthStats.totalViews,
        total: totalStats.totalViews,
        todayUnique: todayStats.uniqueVisitors,
        weekUnique: weekStats.uniqueVisitors,
        monthUnique: monthStats.uniqueVisitors,
        totalUnique: totalStats.uniqueVisitors
      };
    } catch (error) {
      console.error('[Analytics] Error fetching dashboard stats:', error);
      return {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        total: 0,
        todayUnique: 0,
        weekUnique: 0,
        monthUnique: 0,
        totalUnique: 0
      };
    }
  },

  /**
   * Obtener estadísticas específicas por sección (sitio web o academia)
   * @param {string[]} paths - Array de rutas a incluir
   * @returns {Object} { today, thisWeek, thisMonth, total }
   */
  async getStatsByPaths(paths) {
    try {
      const now = new Date();
      
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      weekStart.setHours(0, 0, 0, 0);
      
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const allStart = new Date('2020-01-01');

      // Función auxiliar para contar views en paths específicos
      const countViewsInPaths = async (startDate, endDate) => {
        const { data, error } = await supabase
          .from('page_views')
          .select('path')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .neq('email', 'mdg.gonzalez.damian@gmail.com');

        if (error) throw error;

        return data?.filter(v => 
          paths.some(p => v.path.startsWith(p))
        ).length || 0;
      };

      const [todayCount, weekCount, monthCount, totalCount] = await Promise.all([
        countViewsInPaths(todayStart, todayEnd),
        countViewsInPaths(weekStart, now),
        countViewsInPaths(monthStart, now),
        countViewsInPaths(allStart, now)
      ]);

      return {
        today: todayCount,
        thisWeek: weekCount,
        thisMonth: monthCount,
        total: totalCount
      };
    } catch (error) {
      console.error('[Analytics] Error fetching stats by paths:', error);
      return {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        total: 0
      };
    }
  }
};
