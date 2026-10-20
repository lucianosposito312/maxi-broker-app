import { Shield, Lock, Eye, Database, Cookie, Mail } from 'lucide-react';
import { usePageTracking } from '../hooks/usePageTracking';

const PrivacyPolicy = () => {
  usePageTracking();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-academy-blue-900 mb-4">
            Políticas de Privacidad
          </h1>
          <p className="text-gray-600">Última actualización: Febrero 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                <Eye className="text-green-600" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">1. Información que recopilamos</h2>
            </div>
            <p className="text-gray-700 leading-relaxed ml-13">
              Recopilamos información personal que nos proporcionas directamente al registrarte, como tu nombre, dirección de correo electrónico, y datos de progreso en los cursos para poder emitir tus certificados.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                <Shield className="text-green-600" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">2. Uso de la información</h2>
            </div>
            <p className="text-gray-700 leading-relaxed ml-13 mb-4">
              Utilizamos tus datos para:
            </p>
            <ul className="ml-13 space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Proporcionarte acceso a los cursos adquiridos.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Enviarte notificaciones importantes sobre tu progreso, actualizaciones de contenido o cambios en el servicio.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Emitir certificados a tu nombre.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Brindarte soporte técnico y atención al cliente.</span>
              </li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                <Lock className="text-green-600" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">3. Protección de Datos (Ley 25.326)</h2>
            </div>
            <p className="text-gray-700 leading-relaxed ml-13 mb-4">
              En cumplimiento con la Ley N° 25.326 de Protección de Datos Personales de Argentina, te garantizamos que tu información está alojada en servidores seguros.
            </p>
            <p className="text-gray-700 leading-relaxed ml-13">
              Tienes el derecho de solicitar el acceso, rectificación, actualización o eliminación de tus datos personales en cualquier momento enviando un correo a <span className="font-semibold text-academy-blue-900">mdg.gonzalez.damian@gmail.com</span>
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                <Database className="text-green-600" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">4. Proveedores de Terceros</h2>
            </div>
            <p className="text-gray-700 leading-relaxed ml-13 mb-4">
              Compartimos información estrictamente necesaria con proveedores externos que hacen posible nuestro servicio:
            </p>
            <ul className="ml-13 space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span><strong>Mercado Pago:</strong> Para el procesamiento seguro de transacciones. No tenemos acceso a tus datos financieros.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span><strong>Supabase / Firebase:</strong> Para el alojamiento seguro de bases de datos y autenticación de usuarios.</span>
              </li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                <Cookie className="text-green-600" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">5. Cookies</h2>
            </div>
            <p className="text-gray-700 leading-relaxed ml-13">
              Nuestra plataforma puede utilizar cookies para mejorar la experiencia del usuario, mantener la sesión iniciada y analizar el tráfico del sitio.
            </p>
          </section>

          <div className="border-t border-gray-200 pt-8 mt-8">
            <div className="bg-green-50 rounded-xl p-6 flex items-start gap-4">
              <Mail className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">¿Tenés alguna pregunta?</h3>
                <p className="text-gray-700">
                  Si tenés alguna consulta sobre estas Políticas de Privacidad, no dudes en contactarnos a través de nuestros canales de atención o escribinos a <span className="font-semibold text-academy-blue-900">mdg.gonzalez.damian@gmail.com</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
