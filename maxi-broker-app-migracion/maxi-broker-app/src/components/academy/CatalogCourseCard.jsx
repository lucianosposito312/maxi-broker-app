import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, CheckCircle } from 'lucide-react';

const CatalogCourseCard = ({ course, index, onSelectCourse, enlarged = false, progress = null, isEnrolled = false }) => {
  const navigate = useNavigate();
  
  const containerClass = enlarged 
    ? "relative rounded-xl overflow-hidden shadow-lg bg-white border border-slate-200 hover:border-gold-500/50 transition-all duration-300 hover:shadow-xl flex flex-col"
    : "relative rounded-xl overflow-hidden shadow-md bg-white border border-slate-200 hover:border-gold-500/50 transition-all duration-300 hover:shadow-lg flex flex-col";
  
  const imageClass = enlarged
    ? "w-full h-48 flex-shrink-0 overflow-hidden bg-slate-100"
    : "w-full h-40 flex-shrink-0 overflow-hidden bg-slate-100";
  
  const paddingClass = enlarged ? "p-4" : "p-3";

  const getLevelColor = (level) => {
    switch(level) {
      case 'principiante': return 'bg-green-500';
      case 'intermedio': return 'bg-yellow-500';
      case 'avanzado': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const getLevelLabel = (level) => {
    switch(level) {
      case 'principiante': return 'Principiante';
      case 'intermedio': return 'Intermedio';
      case 'avanzado': return 'Avanzado';
      default: return level;
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectCourse(course);
  };

  const isEven = index % 2 === 0;
  const cardWidth = enlarged ? 'w-full' : 'w-[88%]';
  const progressPercentage = progress?.progressPercentage || 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -15 : 15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`${cardWidth} ${isEven ? 'self-start' : 'self-end'} mb-4`}
    >
      <div
        onClick={handleClick}
        className="group cursor-pointer h-full"
      >
        <div className={containerClass}>
          {/* Imagen arriba */}
          <div className={imageClass}>
            <img 
              src={course.thumbnail_url} 
              alt={course.title}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          
          {/* Contenido abajo */}
          <div className={`flex-1 ${paddingClass}`}>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {course.is_free ? (
                <span className="px-2.5 py-1 rounded text-[10px] font-semibold bg-green-500 text-white flex items-center gap-1">
                  <span className="text-[8px]">★</span>
                  ¡GRATIS!
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded text-[10px] font-semibold bg-[#1B365D] text-white">
                  ${Number(course.price || 0).toLocaleString('es-AR')}
                </span>
              )}
              <span className={`px-2.5 py-1 rounded text-[10px] font-semibold text-white ${getLevelColor(course.level)}`}>
                {getLevelLabel(course.level)}
              </span>
              {isEnrolled && (
                <span className="px-2 py-1 rounded text-[10px] font-semibold bg-green-500 text-white flex items-center gap-1">
                  <CheckCircle size={10} />
                  Activo
                </span>
              )}
            </div>
            
            <h3 className={`font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-academy-blue-900 transition-colors ${enlarged ? 'text-base' : 'text-sm'}`}>
              {course.title}
            </h3>

            {course.short_description && (
              <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                {course.short_description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-xs text-slate-500">
              {course.duration_hours && (
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {course.duration_hours}h
                </span>
              )}
              {course.modules?.length && (
                <span className="flex items-center gap-1">
                  <BookOpen size={12} />
                  {course.modules.length} módulos
                </span>
              )}
            </div>

            {/* Barra de progreso */}
            {isEnrolled && progress !== null && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Progreso</span>
                  <span className="text-xs font-bold text-green-600">{progressPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CatalogCourseCard;
