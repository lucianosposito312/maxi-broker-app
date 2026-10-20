import { useState, useEffect } from 'react';
import { mercadoPagoService } from '../../lib/mercadoPago';
import { Loader2, ExternalLink, ShieldCheck } from 'lucide-react';

const MercadoPagoPayment = ({ course, user, onPaymentSuccess, onPaymentError, onCancel }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirectUrl, setRedirectUrl] = useState(null);

  useEffect(() => {
    console.log('[Payment] Component mounted with:', {
      courseId: course?.id,
      coursePrice: course?.price,
      courseTitle: course?.title,
      userEmail: user?.email,
      hasUser: !!user
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initPayment = async () => {
      if (!course || !user) return;

      try {
        setLoading(true);
        setError(null);

        console.log('[Payment] Creating payment preference for course:', course.title);

        const preference = await mercadoPagoService.createPaymentPreference(course, user);

        if (preference && preference.init_point && isMounted) {
          console.log('[Payment] Preference created, redirect URL:', preference.init_point);
          setRedirectUrl(preference.init_point);
          setLoading(false);
        } else {
          throw new Error('No se pudo obtener el URL de pago');
        }
      } catch (err) {
        console.error('[Payment] Error creating preference:', err);
        if (isMounted) {
          setError(err.message || 'Error al conectar con Mercado Pago');
          if (onPaymentError) onPaymentError(err.message);
          setLoading(false);
        }
      }
    };

    initPayment();

    return () => {
      isMounted = false;
    };
  }, [course?.id, user?.id, course, user, onPaymentError]);

  const handlePayNow = () => {
    if (redirectUrl) {
      console.log('[Payment] Redirecting to Mercado Pago checkout:', redirectUrl);
      window.open(redirectUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B365D] mb-4" />
        <p className="text-gray-600">Preparando pasarela de pago...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          ❌
        </div>
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-[#1B365D] text-white rounded-lg hover:bg-[#152a4a] transition-colors"
        >
          Volver e intentar de nuevo
        </button>
      </div>
    );
  }

  if (!redirectUrl) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
        <p className="text-gray-600 mb-4">No se pudo cargar la pasarela de pago</p>
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-[#1B365D] text-white rounded-lg hover:bg-[#152a4a] transition-colors"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
      <div className="mb-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 text-sm">Total a pagar</span>
          <span className="text-2xl font-bold text-[#1B365D]">
            {new Intl.NumberFormat('es-AR', {
              style: 'currency',
              currency: 'ARS',
              minimumFractionDigits: 0
            }).format(course.price)}
          </span>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <p className="text-gray-700 font-medium mb-3">Pasarela de Pago Segura</p>
        <p className="text-sm text-gray-600 mb-4">
          Serás redirigido a Mercado Pago en una ventana segura donde completarás el pago. Luego serás redirigido automáticamente a tu cuenta de Academia.
        </p>
        <div className="flex items-center gap-2 text-sm text-blue-700 font-medium">
          <ShieldCheck size={18} />
          <span>Pago 100% seguro con Mercado Pago</span>
        </div>
      </div>

      <button
        onClick={handlePayNow}
        className="w-full py-4 rounded-xl font-bold text-lg bg-[#009ee3] hover:bg-[#0078d4] text-white transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
      >
        <ExternalLink size={24} />
        <span>Ir a Pagar con Mercado Pago</span>
      </button>

      <button
        onClick={onCancel}
        className="w-full px-4 py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
      >
        Cancelar y volver
      </button>

      <p className="text-xs text-gray-500 text-center">
        Se abrirá una nueva ventana. Asegúrate de permitir pop-ups en tu navegador.
      </p>
    </div>
  );
};

export default MercadoPagoPayment;
