import { useState, useEffect } from 'react';
import { Users, BookOpen, TrendingUp, Award, ToggleLeft, ToggleRight, Clock } from 'lucide-react';
import { academyStatsService } from '../../lib/coursesService';
import { motion } from 'framer-motion';

const AcademyStats = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    activeEnrollments: 0,
    completedCourses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await academyStatsService.getGeneralStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error loading academy stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);


  const statCards = [
    {
      title: 'Total Estudiantes',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Cursos Activos',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Inscripciones Activas',
      value: stats.activeEnrollments,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Cursos Completados',
      value: stats.completedCourses,
      icon: Award,
      color: 'text-gold-600',
      bgColor: 'bg-gold-50'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-forest-900 mb-6">Estadísticas Generales</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Gráficos y estadísticas adicionales */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-gold-500" />
            Rendimiento del Mes
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Nuevos alumnos</span>
              <span className="font-bold text-forest-900">+{stats.totalStudents > 2 ? '2' : stats.totalStudents}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Certificados emitidos</span>
              <span className="font-bold text-forest-900">{stats.completedCourses}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento de Cursos</h3>
          <p className="text-gray-600">
            Los gráficos detallados estarán disponibles próximamente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AcademyStats;