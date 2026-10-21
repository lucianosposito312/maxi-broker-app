import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings, LogOut, Award } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const AcademyNavBar = ({ onLogout }) => {
    const { academyUser } = useUser();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showBackButton, setShowBackButton] = useState(false);

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return parts[0][0] + parts[1][0];
        }
        return name[0];
    };

    return (
        <nav className="hidden md:block fixed top-0 left-0 right-0 z-40 pt-4 px-4">
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 20 }}
                className="max-w-6xl mx-auto bg-white/50 border-gold-500/10 backdrop-blur-xl rounded-3xl shadow-2xl border relative overflow-visible"
                style={{ height: '60px' }}
            >
                <div className="flex items-center justify-between h-full px-4 relative">
                    {/* Left: Hover-reveal Back Button */}
                    <div
                        className="absolute left-0 top-0 bottom-0 flex items-center pointer-events-none"
                        onMouseEnter={() => setShowBackButton(true)}
                        onMouseLeave={() => setShowBackButton(false)}
                    >
                        <Link
                            to="/"
                            className={`h-full flex items-center relative overflow-hidden rounded-l-3xl transition-all duration-300 pointer-events-auto ${showBackButton ? 'w-52' : 'w-1'
                                }`}
                        >
                            {/* Green border that expands */}
                            <div className={`h-1/2 bg-academy-blue-900 transition-all duration-300 flex-shrink-0 rounded-full ${showBackButton ? 'w-1.5' : 'w-1'
                                }`}></div>

                            {/* Expanded content */}
                            <AnimatePresence>
                                {showBackButton && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center gap-2 px-4 whitespace-nowrap text-academy-blue-900"
                                    >
                                        <ArrowLeft size={18} />
                                        <span className="font-medium text-sm">Volver a MG Broker</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Link>
                    </div>

                    {/* Center: Logo */}
                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
                        <img src="/assets/logoSinFondo.webp" alt="Logo" className="h-16 w-auto object-contain" />
                        <h1 className="text-2xl font-serif text-academy-blue-900">
                            Academia <span className="text-gold-500">Maxi Broker</span>
                        </h1>
                    </div>

                    {/* Right: Profile */}
                    <div className="ml-auto relative">
                        <button
                            onMouseEnter={() => setShowDropdown(true)}
                            onMouseLeave={() => setShowDropdown(false)}
                            className="w-11 h-11 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 text-white font-bold flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 ring-2 ring-gold-500/20"
                        >
                            {getInitials(academyUser?.name)}
                        </button>

                        <AnimatePresence>
                            {showDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    onMouseEnter={() => setShowDropdown(true)}
                                    onMouseLeave={() => setShowDropdown(false)}
                                    className="absolute right-0 top-full mt-2 w-64 rounded-2xl shadow-2xl overflow-hidden bg-white/90 border-gray-100/50 backdrop-blur-xl border"
                                >
                                    {/* Gold top border */}
                                    <div className="h-1 bg-gold-500"></div>

                                    {/* User Info */}
                                    <div className="p-4 bg-gray-50/50">
                                        <p className="font-semibold truncate text-academy-blue-900">
                                            {academyUser?.name}
                                        </p>
                                        <p className="text-xs truncate text-gray-600">
                                            {academyUser?.email}
                                        </p>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2">
                                        <Link
                                            to="/academia/certificados"
                                            onClick={() => setShowDropdown(false)}
                                            className="w-full px-4 py-2.5 flex items-center gap-3 transition-colors text-left hover:bg-gray-50 text-gray-700"
                                        >
                                            <Award size={18} />
                                            <span>Mis Certificados</span>
                                        </Link>

                                        <Link
                                            to="/academia/configuracion"
                                            onClick={() => setShowDropdown(false)}
                                            className="w-full px-4 py-2.5 flex items-center gap-3 transition-colors text-left hover:bg-gray-50 text-gray-700"
                                        >
                                            <Settings size={18} />
                                            <span>Configuración</span>
                                        </Link>

                                        <div className="my-1 border-t border-gray-100"></div>

                                        <button
                                            onClick={() => {
                                                onLogout();
                                                setShowDropdown(false);
                                            }}
                                            className="w-full px-4 py-2.5 flex items-center gap-3 transition-colors text-left hover:bg-red-50 text-red-600"
                                        >
                                            <LogOut size={18} />
                                            <span>Cerrar Sesión</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </nav>
    );
};

export default AcademyNavBar;

