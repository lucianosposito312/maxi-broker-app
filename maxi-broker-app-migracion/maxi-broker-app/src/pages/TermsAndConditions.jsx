import { Shield, Lock, Eye, Database, Cookie } from 'lucide-react';
import { usePageTracking } from '../hooks/usePageTracking';

const TermsAndConditions = () => {
  usePageTracking();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-academy-blue-900 mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-gray-600">Última actualización: Febrero 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-academy-blue-900/10 rounded-full flex items-center justify-center">
                <Shield className="text-academy-blue-900" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">1. Aceptación de los Términos</h2>
            </div>
            <p className="text-gray-700 leading-relaxed ml-13">
              Al acceder y utilizar la plataforma de Academia Maxi Broker, aceptas estar sujeto a estos Términos y Condiciones. Si no estás de acuerdo con alguna parte, no deberás utilizar nuestros servicios.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-academy-blue-900/10 rounded-full flex items-center justify-center">
                <Lock className="text-academy-blue-900" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">2. Descripción del Servicio</h2>
            </div>
            <p className="text-gray-700 leading-relaxed ml-13">
              Academia Maxi Broker ofrece cursos y material educativo en formato digital. El acceso a los cursos pagos se habilitará únicamente tras la confirmación del pago a través de nuestros procesadores autorizados.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-academy-blue-900/10 rounded-full flex items-center justify-center">
                <Shield className="text-academy-blue-900" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">3. Cuentas de Usuario</h2>
            </div>
            <p className="text-gray-700 leading-relaxed ml-13 mb-4">
              Para acceder a los cursos, debes registrarte aportando información real (nombre y correo electrónico). Eres responsable de mantener la confidencialidad de tu cuenta y de todas las actividades que ocurran bajo la misma.
            </p>
            <p className="text-gray-700 leading-relaxed ml-13">
              Nos reservamos el derecho de suspender cuentas que incumplan estas normas o compartan accesos de forma indebida.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-academy-blue-900/10 rounded-full flex items-center justify-center">
                <Lock className="text-academy-blue-900" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">4. Propiedad Intelectual</h2>
            </div>
            <p className="text-gray-700 leading-relaxed ml-13">
              Todo el contenido de la plataforma (videos, textos, descargables, PDFs, etc.) es propiedad exclusiva de Academia Maxi Broker. Queda estrictamente prohibida la reproducción, distribución, reventa o uso no autorizado del material fuera de esta plataforma.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-academy-blue-900/10 rounded-full flex items-center justify-center">
                <Shield className="text-academy-blue-900" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">5. Pagos y Facturación</h2>
            </div>
            <p className="text-gray-700 leading-relaxed ml-13">
              Los pagos se procesan de forma segura a través de Mercado Pago. Academia Maxi Broker no almacena datos de tarjetas de crédito o débito.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-academy-blue-900/10 rounded-full flex items-center justify-center">
                <Shield className="text-academy-blue-900" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">6. Política de Devoluciones</h2>
            </div>
            <p className="text-gray-700 leading-relaxed ml-13">
              Conforme a la Ley de Defensa del Consumidor en Argentina, los usuarios tienen derecho a solicitar la cancelación de la compra y el reintegro del dinero dentro de los 10 días corridos desde la fecha de contratación, siempre y cuando no se haya consumido más del 20% del contenido del curso.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-academy-blue-900/10 rounded-full flex items-center justify-center">
                <Shield className="text-academy-blue-900" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">7. Modificaciones</h2>
            </div>
            <p className="text-gray-700 leading-relaxed ml-13">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigencia al ser publicados en esta página.
            </p>
          </section>

          <div className="border-t border-gray-200 pt-8 mt-8">
            <p className="text-gray-600 text-center">
              Si tenés alguna pregunta sobre estos Términos y Condiciones, contactanos a través de nuestros canales de atención.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
