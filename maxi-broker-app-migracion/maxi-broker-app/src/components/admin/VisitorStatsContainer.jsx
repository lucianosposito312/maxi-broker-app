import React, { useState, useEffect } from 'react';
import { WebsiteVisitsStats, AcademyVisitsStats } from './VisitorStats';
import { analyticsService } from '../../lib/analyticsService';

const VisitorStatsContainer = () => {
  const [websiteStats, setWebsiteStats] = useState(null);
  const [academyStats, setAcademyStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Rutas del sitio web
      const websiteRoutes = ['/', '/terminos-y-condiciones', '/politicas-de-privacidad'];
      
      // Rutas de Academia
      const academyRoutes = ['/academia', '/academia/course/', '/academia/certificados', '/academia/configuracion'];

      // Cargar estadísticas en paralelo
      const [websiteData, academyData] = await Promise.all([
        analyticsService.getStatsByPaths(websiteRoutes),
        analyticsService.getStatsByPaths(academyRoutes)
      ]);

      setWebsiteStats(websiteData);
      setAcademyStats(academyData);
    } catch (error) {
      console.error('Error loading visitor stats:', error);
      setWebsiteStats({ today: 0, thisWeek: 0, thisMonth: 0, total: 0 });
      setAcademyStats({ today: 0, thisWeek: 0, thisMonth: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadStats();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-forest-900">Estadísticas de Visitantes</h2>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors font-medium text-sm"
        >
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WebsiteVisitsStats stats={websiteStats || { today: 0, thisWeek: 0, thisMonth: 0, total: 0 }} loading={loading} />
        <AcademyVisitsStats stats={academyStats || { today: 0, thisWeek: 0, thisMonth: 0, total: 0 }} loading={loading} />
      </div>
    </div>
  );
};

export default VisitorStatsContainer;
