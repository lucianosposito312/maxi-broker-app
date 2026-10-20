import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { X, Clock, Users, Award, CheckCircle, GraduationCap, CreditCard, Sparkles } from 'lucide-react';

const CourseModal = ({ course, isOpen, onClose, onAccess, userId }) => {
  const [acceptTerms, setAcceptTerms] = useState(false);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !course) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handlePurchase = () => {
    if (!userId) {
      return;
    }
    if (course.price && course.price > 0 && !acceptTerms) {
      return;
    }
    onAccess(course);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            {course.thumbnail_url ? (
              <img 
                src={course.thumbnail_url} 
                alt={course.title}
                className="w-full aspect-video object-cover object-center bg-slate-100"
              />
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-academy-blue-900 to-[#12243d] flex items-center justify-center">
                <span className="text-white text-6xl font-bold">{course.title?.charAt(0)?.toUpperCase() || 'C'}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors z-10"
            >
              <X size={24} className="text-white" />
            </button>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold text-white ${
                course.level === 'principiante' ? 'bg-green-500' :
                course.level === 'intermedio' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}>
                {course.level === 'principiante' ? 'Principiante' :
                 course.level === 'intermedio' ? 'Intermedio' :
                 course.level === 'avanzado' ? 'Avanzado' : course.level}
              </span>
              {course.has_certificate && (
                <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white flex items-center gap-1">
                  <Award size={14} />
                  Con certificado
                </span>
              )}
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {course.title}
            </h2>
            
            <div className="flex flex-wrap items-center gap-6 mb-6 text-sm text-gray-600">
              {course.duration_hours && (
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-academy-blue-900" />
                  <span>{course.duration_hours} horas de contenido</span>
                </div>
              )}
              {course.modules?.length && (
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-academy-blue-900" />
                  <span>{course.modules.length} módulos</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users size={18} className="text-academy-blue-900" />
                <span>{course.student_count ? `${course.student_count} estudiantes` : '+0 estudiantes'}</span>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">
              {course.description}
            </p>

            {course.learning_outcomes && course.learning_outcomes.length > 0 && (
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-5 mb-6 border border-slate-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="text-gold-500" size={20} />
                  Lo que aprenderás
                </h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  {course.learning_outcomes.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {userId && (
              <div className="space-y-4">
                {course.price && course.price > 0 && (
                  <div className="flex items-center justify-between bg-academy-blue-900/5 rounded-xl p-4 border border-academy-blue-900/10">
                    <div>
                      <p className="text-sm text-gray-600">Precio del curso</p>
                      <p className="text-3xl font-bold text-academy-blue-900">
                        {formatPrice(course.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Pago único</p>
                      <p className="text-sm text-green-600 font-medium">Acceso permanente</p>
                    </div>
                  </div>
                )}

                {course.price && course.price > 0 && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 text-academy-blue-900 border-gray-300 rounded focus:ring-academy-blue-900"
                    />
                    <label htmlFor="acceptTerms" className="leading-tight">
                      Al continuar, acepto los{' '}
                      <a href="/terminos-y-condiciones" target="_blank" className="text-gold-500 hover:underline font-medium">Términos y Condiciones</a>
                      {' '}y{' '}
                      <a href="/politicas-de-privacidad" target="_blank" className="text-gold-500 hover:underline font-medium">Políticas de Privacidad</a>
                    </label>
                  </div>
                )}

                <button
                  onClick={handlePurchase}
                  disabled={course.price && course.price > 0 && !acceptTerms}
                  className="w-full py-4 rounded-xl font-bold text-lg bg-academy-blue-900 hover:bg-gold-500 text-white transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <CreditCard size={24} />
                  <span>{course.price && course.price > 0 ? 'Proceder al pago' : 'Inscribirse gratis'}</span>
                </button>

                <p className="text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                  <GraduationCap size={16} />
                  {course.price && course.price > 0 
                    ? 'Accede a todo el contenido después del pago'
                    : 'Accede a todo el contenido inmediatamente'}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CourseModal;
