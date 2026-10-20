import React from 'react';
import { Globe, BookOpen } from 'lucide-react';

const WebsiteVisitsStats = ({ stats, loading }) => {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Globe size={24} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Visitantes del Sitio Web</h3>
            <p className="text-sm text-gray-500">Home, Términos, Privacidad</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-100 rounded w-full"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.today || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Hoy</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-500">{stats.thisWeek || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Esta Semana</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-500">{stats.thisMonth || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Este Mes</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.total || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Total</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AcademyVisitsStats = ({ stats, loading }) => {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-academy-blue-50 rounded-lg">
            <BookOpen size={24} className="text-academy-blue-900" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Visitantes de Academia</h3>
            <p className="text-sm text-gray-500">Cursos, Certificados, Configuración</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-100 rounded w-full"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-academy-blue-900">{stats.today || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Hoy</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-academy-blue-700">{stats.thisWeek || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Esta Semana</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-academy-blue-700">{stats.thisMonth || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Este Mes</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-academy-blue-900">{stats.total || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Total</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { WebsiteVisitsStats, AcademyVisitsStats };
