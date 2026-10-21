import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, XCircle, ArrowLeft, Clock } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { academiaAuth } from '../lib/academiaAuth';
import { mercadoPagoService } from '../lib/mercadoPago';
import AcademyNavBar from '../components/academy/AcademyNavBar';
import AcademyMobileMenu from '../components/academy/AcademyMobileMenu';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { academyUser, logoutAcademy } = useUser();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Estamos consultando a Mercado Pago para confirmar la operación.');
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
  const courseId = searchParams.get('course_id');
  const statusParam = (searchParams.get('status') || searchParams.get('collection_status') || '').toLowerCase();
  const currentUser = academyUser || academiaAuth.getSession();

  useEffect(() => {
    let active = true;
    const processPayment = async () => {
      if (!currentUser?.id) {
        setStatus('failed');
        setMessage('Tu sesión no está disponible. Iniciá sesión en la Academia y revisá el estado de tu compra.');
        return;
      }
      if (statusParam === 'failure' || statusParam === 'rejected') {
        setStatus('failed');
        setMessage('Mercado Pago informó que el pago no se completó. Podés volver a intentarlo desde el curso.');
        return;
      }
      if (!courseId) {
        setStatus('failed');
        setMessage('No recibimos el curso correspondiente a esta compra. No se habilitó ningún acceso.');
        return;
      }
      if (!paymentId) {
        if (statusParam === 'pending' || statusParam === 'in_process') {
          setStatus('pending');
          setMessage('Mercado Pago todavía no envió un identificador de pago para verificar. No se habilitó el curso.');
        } else {
          setStatus('failed');
          setMessage('No recibimos el identificador de la operación para verificarla. Por seguridad, el curso no se habilitó. Si ya pagaste, contactá al soporte con tu comprobante.');
        }
        return;
      }

      try {
        setStatus('processing');
        const result = await mercadoPagoService.verifyPayment(paymentId, courseId, currentUser);
        if (!active) return;
        if (result.status === 'approved' && result.success === true) {
          setStatus('success');
          setMessage('Mercado Pago confirmó el pago y tu inscripción quedó habilitada.');
        } else if (['pending', 'in_process', 'authorized'].includes(result.status)) {
          setStatus('pending');
          setMessage('Mercado Pago todavía está procesando el pago. El curso se habilitará cuando la operación figure como aprobada.');
        } else {
          setStatus('failed');
          setMessage('Mercado Pago no confirmó un pago aprobado. No se habilitó el curso. Podés revisar la operación o volver a intentarlo.');
        }
      } catch (err) {
        console.error('Payment verification failed:', err?.message || 'unknown error');
        if (!active) return;
        setStatus('failed');
        setMessage(err.message || 'No pudimos verificar el pago. El curso no se habilitó; contactá al soporte si el dinero ya fue debitado.');
      }
    };
    processPayment();
    return () => { active = false; };
  }, [paymentId, courseId, statusParam, currentUser?.id]);

  const handleLogout = () => {
    logoutAcademy();
    navigate('/academia');
  };

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-4">
          <Loader2 className="w-16 h-16 text-gold-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verificando tu pago...</h2>
          <p className="text-gray-600">{message}</p>
        </motion.div>
      </div>
    );
  }

  const isPending = status === 'pending';
  const isSuccess = status === 'success';
  const Icon = isSuccess ? CheckCircle : isPending ? Clock : XCircle;
  const iconClass = isSuccess ? 'text-green-500' : isPending ? 'text-yellow-500' : 'text-red-500';
  const title = isSuccess ? '¡Pago confirmado!' : isPending ? 'Pago en proceso' : 'No pudimos confirmar el pago';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <AcademyNavBar onLogout={handleLogout} />
      <AcademyMobileMenu onLogout={handleLogout} />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-md mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Icon className={`w-16 h-16 ${iconClass} mx-auto mb-4`} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              {isSuccess && courseId && (
                <Link to={`/academia/course/${courseId}`} className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all">
                  Ir al Curso
                </Link>
              )}
              <Link to="/academia" className="inline-flex items-center justify-center gap-2 w-full bg-academy-blue-900 hover:bg-gold-500 text-white font-semibold py-3 px-6 rounded-lg transition-all">
                <ArrowLeft size={20} />
                Volver a la Academia
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
