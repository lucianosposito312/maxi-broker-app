import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Award, BookOpen, Bell, LogOut, Save, Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { usePageTracking } from '../hooks/usePageTracking';
import AcademyNavBar from '../components/academy/AcademyNavBar';
import AcademyMobileMenu from '../components/academy/AcademyMobileMenu';
import { academiaAuth } from '../lib/academiaAuth';

const Settings = () => {
  usePageTracking();
  const { academyUser, logoutAcademy, updateAcademyUser } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');
  const [formData, setFormData] = useState({
    name: academyUser?.name || '',
    email: academyUser?.email || '',
    phone: academyUser?.phone || ''
  });

  // Guardar datos originales para comparar
  const originalData = {
    name: academyUser?.name || '',
    phone: academyUser?.phone || ''
  };

  if (!academyUser) {
    navigate('/academia');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage(null);
  };

  const hasChanges = () => {
    return formData.name !== originalData.name || formData.phone !== originalData.phone;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Verificar si hay cambios
    if (!hasChanges()) {
      setMessageType('info');
      setMessage('Los datos ya están actualizados.');
      setLoading(false);
      return;
    }

    try {
      const result = await academiaAuth.updateProfile(academyUser.id, {
        name: formData.name,
        phone: formData.phone
      });

      if (result.success) {
        updateAcademyUser({ name: formData.name, phone: formData.phone });
        setMessageType('success');
        setMessage('¡Perfil actualizado correctamente!');
      } else {
        setMessageType('error');
        setMessage(result.error || 'Error al actualizar el perfil.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessageType('error');
      setMessage('Error al actualizar el perfil. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutAcademy();
    navigate('/academia');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <AcademyNavBar onLogout={handleLogout} />
      <AcademyMobileMenu onLogout={handleLogout} />

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/academia"
            className="inline-flex items-center gap-2 text-academy-blue-900 hover:text-gold-600 transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span>Volver a la Academia</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-academy-blue-900 to-[#12243d] p-6">
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <User size={28} className="text-gold-500" />
                Configuración de Cuenta
              </h1>
              <p className="text-white/70 mt-1">Gestiona tu información personal</p>
            </div>

            <div className="p-6 space-y-8">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        value={academyUser?.email || ''}
                        disabled
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">El correo no se puede cambiar</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        placeholder="Tu número de teléfono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-academy-blue-900 hover:bg-gold-500 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Guardar Cambios
                      </>
                    )}
                  </button>

                  {message && (
                    <div className={`px-4 py-3 rounded-lg flex items-center gap-2 ${
                      messageType === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
                      messageType === 'error' ? 'bg-red-50 border border-red-200 text-red-700' :
                      'bg-blue-50 border border-blue-200 text-blue-700'
                    }`}>
                      {messageType === 'success' && <CheckCircle size={20} />}
                      {messageType === 'error' && <AlertCircle size={20} />}
                      {messageType === 'info' && <Award size={20} />}
                      {message}
                    </div>
                  )}
                </div>
              </form>

              <div className="border-t border-gray-200 pt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-academy-blue-900" />
                  Mi Actividad
                </h2>
                <div className="space-y-3">
                  <Link
                    to="/academia/certificados"
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Award size={20} className="text-gold-500" />
                      <span className="font-medium text-gray-700">Mis Certificados</span>
                    </div>
                    <ArrowLeft className="rotate-180 text-gray-400" size={16} />
                  </Link>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Bell size={20} className="text-academy-blue-900" />
                  Notificaciones
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail size={20} className="text-gray-400" />
                      <span className="font-medium text-gray-700">Notificaciones por email</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                >
                  <LogOut size={20} />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
