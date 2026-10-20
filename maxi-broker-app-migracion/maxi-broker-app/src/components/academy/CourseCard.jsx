import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';

const CourseCard = ({ course, onEnroll, isEnrolled, isPublic = false }) => {
  const navigate = useNavigate();

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
    
    if (isPublic) {
      navigate(`/academia?courseId=${course.id}`);
    } else {
      onEnroll(course);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, shadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-2xl overflow-hidden bg-white shadow-lg cursor-pointer transition-all duration-300 border border-slate-200 hover:border-gold-500/50"
      onClick={handleClick}
    >
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <img 
          src={course.thumbnail_url} 
          alt={course.title}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute top-4 left-4">
          <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg ${getLevelColor(course.level)}`}>
            {getLevelLabel(course.level)}
          </span>
        </div>

        {isEnrolled && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            Inscrito
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-academy-blue-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1, opacity: 1 }}
            className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 flex items-center gap-2 text-white font-semibold"
          >
            <Eye size={18} />
            <span>Ver curso</span>
          </motion.div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-900 line-clamp-2 mb-3 group-hover:text-academy-blue-900 transition-colors">
          {course.title}
        </h3>
        
        {course.short_description && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-4">
            {course.short_description}
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            {course.duration_hours && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {course.duration_hours} horas
              </span>
            )}
            {course.modules?.length && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {course.modules.length} módulos
              </span>
            )}
          </div>
          
          <button className="text-sm font-semibold text-academy-blue-900 group-hover:text-gold-600 transition-colors flex items-center gap-1">
            Ver más
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
