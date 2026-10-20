import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, XCircle, ArrowLeft, Clock } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { enrollmentsService } from '../lib/coursesService';
import AcademyNavBar from '../components/academy/AcademyNavBar';
import AcademyMobileMenu from '../components/academy/AcademyMobileMenu';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { academyUser, logoutAcademy } = useUser();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);


  // Mercado Pago sends back: payment_id (or collection_id), status, course_id (from our back_urls)
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
  const courseId = searchParams.get('course_id');
  const statusParam = searchParams.get('status') || searchParams.get('collection_status');

  useEffect(() => {
    if (!academyUser) {
      navigate('/academia');
      return;
    }

    const processPayment = async () => {
      if (statusParam === 'failure' || statusParam === 'rejected' || statusParam === 'null') {
        setStatus('failed');
        setError('El pago fue rechazado. Por favor intenta nuevamente.');
        return;
      }

      if (statusParam === 'pending' || statusParam === 'in_process') {
        // Still create enrollment with pending status
        if (courseId) {
          try {
            const isEnrolled = await enrollmentsService.isUserEnrolled(academyUser.id, courseId);
            if (!isEnrolled) {
              await enrollmentsService.createEnrollment({
                user_id: academyUser.id,
                course_id: courseId,
                payment_status: 'pending',
                payment_id: paymentId || `mp-pending-${Date.now()}`,
                created_at: new Date().toISOString()
              });
            }
          } catch (err) {
            console.error('Error creating pending enrollment:', err);
          }
        }
        setStatus('pending');
        setError('El pago está siendo procesado. Te notificaremos cuando sea confirmado.');
        return;
      }

      if (!courseId) {
        setStatus('failed');
        setError('Información de pago inválida. No se recibió el ID del curso.');
        return;
      }

      // Status is approved (or not explicitly set, assume success if we have course_id)
      const resolvedPaymentId = paymentId || `mp-${Date.now()}`;

      try {
        setStatus('processing');

        const isEnrolled = await enrollmentsService.isUserEnrolled(academyUser.id, courseId);

        if (isEnrolled) {
          setStatus('success');
          return;
        }

        await enrollmentsService.createEnrollment({
          user_id: academyUser.id,
          course_id: courseId,
          payment_status: 'paid',
          payment_id: resolvedPaymentId,
          paid_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        });

        setStatus('success');
      } catch (err) {
        console.error('Error processing payment:', err);
        setStatus('failed');
        setError('Hubo un error al procesar tu inscripción. Contacta al soporte.');
      }
    };

    processPayment();
  }, [paymentId, courseId, statusParam, academyUser, navigate]);

  useEffect(() => {
    if (status !== 'pending') return;

    // For pending payments, periodically check if webhook confirmed it
    const checkEnrollment = async () => {
      try {
        const isEnrolled = await enrollmentsService.isUserEnrolled(academyUser.id, courseId);
        if (isEnrolled) {
          setStatus('success');
        }
      } catch (err) {
        console.error('Error checking enrollment:', err);
      }
    };

    const interval = setInterval(checkEnrollment, 5000);
    return () => clearInterval(interval);
  }, [status, academyUser, courseId]);

  const handleLogout = () => {
    logoutAcademy();
    navigate('/academia');
  };

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-4"
        >
          <Loader2 className="w-16 h-16 text-gold-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Procesando pago...</h2>
          <p className="text-gray-600">Por favor espera mientras confirmamos tu pago</p>
        </motion.div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <AcademyNavBar onLogout={handleLogout} />
        <AcademyMobileMenu onLogout={handleLogout} />
        <div className="pt-24 pb-12 px-4">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl p-8 text-center"
            >
              <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pago en proceso</h2>
              <p className="text-gray-600 mb-6">
                Tu pago está siendo procesado. En breve recibirás un email de confirmación o te contactaremos.
              </p>
              <Link
                to="/academia"
                className="inline-flex items-center gap-2 bg-academy-blue-900 hover:bg-gold-500 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                <ArrowLeft size={20} />
                Volver a la Academia
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <AcademyNavBar onLogout={handleLogout} />
        <AcademyMobileMenu onLogout={handleLogout} />
        <div className="pt-24 pb-12 px-4">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl p-8 text-center"
            >
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pago fallido</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link
                to="/academia"
                className="inline-flex items-center gap-2 bg-academy-blue-900 hover:bg-gold-500 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                <ArrowLeft size={20} />
                Volver a la Academia
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <AcademyNavBar onLogout={handleLogout} />
      <AcademyMobileMenu onLogout={handleLogout} />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Pago exitoso!</h2>
            <p className="text-gray-600 mb-6">Ya puedes acceder a tu curso</p>
            <div className="space-y-3">
              <Link
                to="/academia"
                className="block w-full bg-academy-blue-900 hover:bg-gold-500 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Ir a la Academia
              </Link>
              {courseId && (
                <Link
                  to={`/academia/course/${courseId}`}
                  className="block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                >
                  Ir al Curso
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
