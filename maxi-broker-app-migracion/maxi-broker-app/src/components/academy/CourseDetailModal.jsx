import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { X, Clock, Users, Award, CheckCircle, GraduationCap, CreditCard, Sparkles, BookOpen, Loader2 } from 'lucide-react';
import { enrollmentsService } from '../../lib/coursesService';
import MercadoPagoPayment from '../payment/MercadoPagoPayment';

const CourseDetailModal = ({ course, isOpen, onClose, onAccess, userId, user }) => {
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Debug logs
  useEffect(() => {
    if (isOpen) {
      console.log('[CourseDetailModal] Modal opened with:', {
        courseId: course?.id,
        courseTitle: course?.title,
        coursePrice: course?.price,
        userId: userId,
        userEmail: user?.email,
        hasUser: !!user
      });
    }
  }, [isOpen, course, userId, user]);

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

  useEffect(() => {
    if (!isOpen) {
      setShowPayment(false);
    }
  }, [isOpen]);

  if (!isOpen || !course) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'principiante': return 'bg-green-500';
      case 'intermedio': return 'bg-yellow-500';
      case 'avanzado': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const getLevelLabel = (level) => {
    switch (level) {
      case 'principiante': return 'Principiante';
      case 'intermedio': return 'Intermedio';
      case 'avanzado': return 'Avanzado';
      default: return level;
    }
  };

  const handlePurchase = async () => {
    console.log('[CourseDetailModal] handlePurchase called:', {
      userId,
      user,
      coursePrice: course?.price,
      showPayment
    });

    if (!userId) {
      console.error('[CourseDetailModal] No userId provided');
      alert('Debes estar logueado para comprar un curso');
      return;
    }

    if (!user) {
      console.error('[CourseDetailModal] No user data provided');
      alert('Error: datos de usuario no disponibles. Por favor recarga la página.');
      return;
    }

    try {
      const alreadyEnrolled = await enrollmentsService.isUserEnrolled(userId, course.id);
      
      if (alreadyEnrolled) {
        console.log('[CourseDetailModal] User already enrolled');
        onAccess(course);
        return;
      }
    } catch (error) {
      console.error('Error al verificar inscripción:', error);
    }

    if (!course.price || course.price === 0) {
      try {
        setLoading(true);
        console.log('[CourseDetailModal] Creating free enrollment');
        await enrollmentsService.createEnrollment({
          user_id: userId,
          course_id: course.id,
          payment_status: 'paid',
          payment_id: 'free-' + Date.now(),
          paid_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
        onAccess(course);
        return;
      } catch (error) {
        console.error('Error al crear inscripción gratis:', error);
        setLoading(false);
      }
    }

    console.log('[CourseDetailModal] Showing payment for course:', { id: course.id, price: course.price });
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentResult) => {
    setShowPayment(false);
    onAccess(course);
  };

  const handlePaymentError = (errorMessage) => {
    alert('Error en el pago: ' + errorMessage);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
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
          <div className="bg-gradient-to-r from-academy-blue-900 to-[#12243d] p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-3 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors z-10"
            >
              <X size={24} className="text-gray-800" />
            </button>

            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-3 ${getLevelColor(course.level)}`}>
              {getLevelLabel(course.level)}
            </span>
            {course.has_certificate && (
              <span className="inline-block ml-2 px-3 py-1 rounded-full text-xs font-semibold bg-gold-500 text-white">
                <Award size={12} className="inline mr-1" />
                Con certificado
              </span>
            )}
            <h2 className="text-2xl font-bold text-white mt-2">
              {course.title}
            </h2>
          </div>

          <div className="p-6 md:p-8">
            {showPayment ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Completá tu pago
                </h3>
                <MercadoPagoPayment
                  course={course}
                  user={user}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                  onCancel={handlePaymentCancel}
                />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6 text-sm text-gray-600">
                  {course.duration_hours && (
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-academy-blue-900" />
                      <span>{course.duration_hours} horas de contenido</span>
                    </div>
                  )}
                  {course.modules?.length && (
                    <div className="flex items-center gap-2">
                      <BookOpen size={18} className="text-academy-blue-900" />
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

                <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-5 mb-6 border border-slate-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles className="text-gold-500" size={20} />
                    Lo que aprenderás
                  </h3>
                  {course.learning_outcomes && course.learning_outcomes.length > 0 ? (
                    <ul className="grid md:grid-cols-2 gap-3">
                      {course.learning_outcomes.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">Próimamente se publicarán los temas del curso.</p>
                  )}
                </div>

                {userId ? (
                  <div className="space-y-4">
                    {course.price && course.price > 0 ? (
                      <>
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

                        <button
                          onClick={handlePurchase}
                          disabled={loading}
                          className="w-full py-4 rounded-xl font-bold text-lg bg-academy-blue-900 hover:bg-gold-500 text-white transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <Loader2 size={24} className="animate-spin" />
                              <span>Procesando...</span>
                            </>
                          ) : (
                            <>
                              <CreditCard size={24} />
                              <span>Proceder al pago</span>
                            </>
                          )}
                        </button>

                        <p className="text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                          <GraduationCap size={16} />
                          Accede a todo el contenido después del pago
                        </p>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handlePurchase}
                          disabled={loading}
                          className="w-full py-4 rounded-xl font-bold text-lg bg-green-600 hover:bg-green-700 text-white transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <Loader2 size={24} className="animate-spin" />
                              <span>Procesando...</span>
                            </>
                          ) : (
                            <>
                              <GraduationCap size={24} />
                              <span>Inscribirse gratis</span>
                            </>
                          )}
                        </button>

                        <p className="text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                          <CheckCircle size={16} className="text-green-600" />
                          Accede a todo el contenido inmediatamente
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                    <p className="text-yellow-800 font-medium">Debes estar logueado para comprar este curso</p>
                    <p className="text-sm text-yellow-700 mt-1">Inicia sesión en tu cuenta de Academia</p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CourseDetailModal;
