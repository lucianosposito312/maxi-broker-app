import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, User, ArrowRight, Loader2, Lock, Eye, EyeOff, Info, Calendar, BookOpen, ChevronDown } from 'lucide-react';
import { academiaAuth } from '../../lib/academiaAuth';

const AcademiaLoginRegister = ({ onSuccess, compact = false }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!isLogin && formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        try {
            let result;

            if (isLogin) {
                result = await academiaAuth.login(
                    formData.email.trim(),
                    formData.password
                );
            } else {
                if (formData.password.length < 6) {
                    setError('La contraseña debe tener al menos 6 caracteres');
                    setLoading(false);
                    return;
                }
                result = await academiaAuth.register(
                    formData.name.trim(),
                    formData.email.trim(),
                    formData.phone.trim(),
                    formData.password
                );
            }

            if (result.success) {
                onSuccess(result.user);
            } else {
                setError(result.error);
            }
        } catch {
            setError('Error inesperado. Por favor intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    };

    const headerPadding = compact ? "p-3 md:p-6" : "p-4 md:p-6";
    const contentPadding = compact ? "p-3 md:p-6" : "p-4 md:p-8";
    const titleSize = compact ? "text-lg md:text-xl" : "text-xl md:text-2xl lg:text-3xl";
    const subtitleSize = compact ? "text-[10px] md:text-xs" : "text-xs md:text-sm";
    const logoSize = compact ? "h-8 md:h-10" : "h-10 md:h-12";
    const inputPadding = compact ? "py-2 pl-9 pr-3 text-sm" : "py-2.5 md:py-3 pl-10 md:pl-11 pr-3 md:pr-4 text-sm";
    const buttonPadding = compact ? "py-2 text-sm" : "py-2.5 md:py-3 px-4 md:px-6 text-sm md:text-base";
    const fieldSpacing = compact ? "space-y-3" : "space-y-4 md:space-y-5";
    const toggleMargin = compact ? "mt-3" : "mt-4 md:mt-6";

    return (
        <div className={`${compact ? 'w-full' : 'w-full'} max-w-md mx-auto`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 ${compact ? 'shadow-xl' : ''}`}
            >
                {/* Header azul - responsive */}
                <div className={`${headerPadding} text-center bg-gradient-to-r from-academy-blue-900 to-[#12243d]`}>
                    <div className="flex justify-center mb-2">
                        <img 
                            src="/assets/AcademyLogoSinFondo.webp" 
                            alt="Academia Maxi Broker" 
                            className={`${logoSize} object-contain`}
                        />
                    </div>
                    <h2 className={`${titleSize} font-serif text-gold-500 mb-1`}>
                        Academia Maxi Broker
                    </h2>
                    <p className={`${subtitleSize} text-white/80`}>
                        {isLogin ? 'Ingresa a tu cuenta' : 'Crea tu cuenta'}
                    </p>
                </div>

                <div className={`${contentPadding} relative`}>
                    {/* Recuadro info - solo en login */}
                    {isLogin && (
                        <div className="mb-4 relative">
                            <button
                                type="button"
                                onClick={() => setShowInfo(!showInfo)}
                                onMouseEnter={() => setShowInfo(true)}
                                onMouseLeave={() => setShowInfo(false)}
                                className={`w-full ${compact ? 'p-2 text-[10px]' : 'p-3 md:p-4 text-xs md:text-sm'} bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:from-blue-100 hover:to-indigo-100 transition-all group relative z-10`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`${compact ? 'w-5 h-5' : 'w-6 h-6 md:w-8 md:h-8'} rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0`}>
                                            <Info size={compact ? 10 : 12} className="text-blue-600" />
                                        </div>
                                        <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-medium text-blue-800`}>
                                            ¿Ya has interactuado con nosotros?
                                        </span>
                                    </div>
                                    <ChevronDown 
                                        size={compact ? 12 : 14} 
                                        className={`text-blue-500 transition-transform duration-200 ${showInfo ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </button>
                            
                            <AnimatePresence>
                                {showInfo && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute left-0 right-0 top-full mt-1 p-2 md:p-3 bg-white rounded-xl shadow-lg border border-blue-100 z-50"
                                    >
                                        <ul className={`space-y-1 ${compact ? 'text-[9px]' : 'text-xs md:text-sm'} text-blue-700 text-left`}>
                                            <li className="flex items-center gap-1">
                                                <Calendar size={compact ? 10 : 12} className="text-blue-500 flex-shrink-0" />
                                                <span>Si agendaste una <strong>cita</strong> previamente</span>
                                            </li>
                                            <li className="flex items-center gap-1">
                                                <BookOpen size={compact ? 10 : 12} className="text-blue-500 flex-shrink-0" />
                                                <span>O descargaste un <strong>ebook</strong></span>
                                            </li>
                                        </ul>
                                        <p className={`mt-1 text-blue-600 text-left`}>
                                            <strong>Ingresa con Email y tu Celular como contraseña</strong>
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={fieldSpacing}>
                        {error && (
                            <div className={`${compact ? 'p-2 text-xs' : 'px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm'} bg-red-50 border border-red-200 text-red-700 rounded-lg`}>
                                {error}
                            </div>
                        )}

                        {isLogin ? (
                            /* LOGIN: Email + Contraseña */
                            <>
                                <div className="relative">
                                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={`w-full ${inputPadding} border border-slate-200 bg-white text-gray-900 placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all`}
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Contraseña"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className={`w-full ${inputPadding} border border-slate-200 bg-white text-gray-900 placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all pr-10`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                    >
                                        {showPassword ? <EyeOff size={compact ? 14 : 16} /> : <Eye size={compact ? 14 : 16} />}
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* REGISTRO: Nombre + Email + Celular + Contraseña */
                            <>
                                <div className="relative">
                                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
                                    <input
                                        type="text"
                                        placeholder="Nombre completo"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={`w-full ${inputPadding} border border-slate-200 bg-white text-gray-900 placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all`}
                                    />
                                </div>
                                <div className="relative">
                                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={`w-full ${inputPadding} border border-slate-200 bg-white text-gray-900 placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all`}
                                    />
                                </div>
                                <div className="relative">
                                    <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
                                    <input
                                        type="tel"
                                        placeholder="Celular"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className={`w-full ${inputPadding} border border-slate-200 bg-white text-gray-900 placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all`}
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Contraseña"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className={`w-full ${inputPadding} border border-slate-200 bg-white text-gray-900 placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all pr-10`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                    >
                                        {showPassword ? <EyeOff size={compact ? 14 : 16} /> : <Eye size={compact ? 14 : 16} />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Confirmar contraseña"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className={`w-full ${inputPadding} border border-slate-200 bg-white text-gray-900 placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all`}
                                    />
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-500 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${buttonPadding} ${compact ? 'shadow-md' : 'shadow-lg hover:shadow-xl'}`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={compact ? 14 : 18} />
                                    <span>Procesando...</span>
                                </>
                            ) : (
                                <>
                                    <span>{isLogin ? 'Ingresar' : 'Registrarse'}</span>
                                    <ArrowRight size={compact ? 14 : 18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className={`${toggleMargin} text-center`}>
                        <button
                            type="button"
                            onClick={toggleMode}
                            className={`${compact ? 'text-[10px]' : 'text-xs md:text-sm'} text-slate-600 hover:text-gold-600 transition-colors`}
                        >
                            {isLogin ? (
                                <>
                                    ¿No tienes cuenta? <span className="font-semibold">Regístrate</span>
                                </>
                            ) : (
                                <>
                                    ¿Ya tienes cuenta? <span className="font-semibold">Ingresa</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AcademiaLoginRegister;
