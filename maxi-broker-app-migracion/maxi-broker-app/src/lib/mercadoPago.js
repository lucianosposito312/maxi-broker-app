const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const mercadoPagoService = {
  async createPaymentPreference(course, user) {
    try {
      const baseUrl = window.location.origin;
      const returnUrl = `${baseUrl}/academia/payment/success?course_id=${course.id}`;

      const payload = {
        courseId: String(course.id),
        courseTitle: String(course.title),
        price: Number(course.price),
        userId: String(user.id),
        userEmail: String(user.email),
        returnUrl: String(returnUrl)
      };

      if (!payload.price || payload.price <= 0) {
        throw new Error('El precio del curso es inválido');
      }

      console.log('[MercadoPago] Creating preference for:', payload);

      const response = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/create-payment-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[MercadoPago] Edge Function Error:', data);
        throw new Error(data.error || `Error al crear preferencia: ${response.status}`);
      }

      console.log('[MercadoPago] Preference created:', data);

      if (!data.id) {
        throw new Error('No se recibió el ID de preferencia de Mercado Pago');
      }

      return {
        id: data.id,
        init_point: data.init_point
      };
    } catch (error) {
      console.error('[MercadoPago] Error:', error);
      throw error;
    }
  }
};
