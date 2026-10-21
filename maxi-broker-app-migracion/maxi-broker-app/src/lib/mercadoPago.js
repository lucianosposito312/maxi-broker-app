const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const parseResponse = async (response) => {
  const body = await response.text();
  if (!body) return {};
  try { return JSON.parse(body); }
  catch { throw new Error('El servidor devolvió una respuesta inválida.'); }
};

const invokeFunction = async (functionName, payload) => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('La conexión con la Academia no está configurada. Contactá al administrador.');
  }

  let response;
  try {
    response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('No pudimos conectar con el servicio de pagos. Revisá tu conexión e intentá nuevamente.');
    }
    throw error;
  }

  const data = await parseResponse(response);
  if (!response.ok) {
    throw new Error(data.error || data.message || `Error de conexión (${response.status}).`);
  }
  return data;
};

export const mercadoPagoService = {
  async createPaymentPreference(course, user) {
    if (!course?.id || !user?.id || !user?.email) {
      throw new Error('Faltan datos de la cuenta o del curso para iniciar el pago.');
    }

    const returnUrl = `${window.location.origin}/academia/payment/success?course_id=${encodeURIComponent(course.id)}`;
    const data = await invokeFunction('create-payment-preference', {
      courseId: String(course.id),
      userId: String(user.id),
      userEmail: String(user.email).trim().toLowerCase(),
      returnUrl
    });

    if (!data.id || !data.init_point) {
      throw new Error('Mercado Pago no devolvió el enlace de pago. Intentá nuevamente.');
    }

    let checkoutUrl;
    try { checkoutUrl = new URL(data.init_point); }
    catch { throw new Error('Mercado Pago devolvió un enlace de pago inválido.'); }
    if (
      checkoutUrl.protocol !== 'https:' ||
      !/(^|\.)mercadopago\.com$|(^|\.)mercadopago\.com\.ar$/.test(checkoutUrl.hostname)
    ) {
      throw new Error('El enlace recibido no pertenece al sitio seguro de Mercado Pago.');
    }

    return { id: data.id, init_point: checkoutUrl.href };
  },

  async verifyPayment(paymentId, courseId, user) {
    if (!paymentId || !courseId || !user?.id) {
      throw new Error('Faltan datos para verificar el pago. No habilitamos el curso hasta confirmarlo.');
    }
    return invokeFunction('verify-payment', {
      paymentId: String(paymentId),
      courseId: String(courseId),
      userId: String(user.id)
    });
  }
};
