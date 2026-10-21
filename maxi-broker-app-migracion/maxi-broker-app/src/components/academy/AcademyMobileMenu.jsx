import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, LogOut, Award } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const AcademyMobileMenu = ({ onLogout }) => {
    const { academyUser } = useUser();
    const [isOpen, setIsOpen] = useState(false);

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return parts[0][0] + parts[1][0];
        }
        return name[0];
    };

    return (
        <>
            {/* Logo academia - solo visible en móvil */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Link to="/">
                    <img src="/assets/AcademyLogoSinFondo.webp" alt="Academia Maxi Broker" className="h-10 w-auto object-contain drop-shadow-sm" />
                </Link>
            </div>

            {/* Avatar Trigger */}
            <div className="md:hidden fixed top-4 right-4 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 text-white font-bold flex items-center justify-center shadow-lg ring-2 ring-white"
                >
                    {getInitials(academyUser?.name)}
                </button>
            </div>

            {/* Full Screen Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="md:hidden fixed inset-0 z-[100]"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="w-full h-full flex flex-col bg-white/95 backdrop-blur-2xl"
                        >
                            {/* Close Button */}
                            <div className="flex justify-end p-6">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                >
                                    <X size={24} className="text-gray-700" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col items-center justify-center px-8 pb-20">
                                {/* User Avatar */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1, type: 'spring', damping: 15 }}
                                    className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 text-white text-3xl font-bold flex items-center justify-center shadow-2xl mb-6 ring-4 ring-gold-500/20"
                                >
                                    {getInitials(academyUser?.name)}
                                </motion.div>

                                {/* User Info */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-center mb-12"
                                >
                                    <h2 className="text-2xl font-serif text-academy-blue-900 mb-2">
                                        {academyUser?.name}
                                    </h2>
                                    <p className="text-gray-600">
                                        {academyUser?.email}
                                    </p>
                                </motion.div>

                                {/* Menu Items */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="w-full max-w-sm space-y-3"
                                >
                                    <Link
                                        to="/academia/certificados"
                                        onClick={() => {
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center gap-4 px-6 py-4 rounded-xl shadow-lg transition-all bg-white hover:bg-gray-50 text-academy-blue-900"
                                    >
                                        <Award size={22} />
                                        <span className="text-lg font-medium">Mis Certificados</span>
                                    </Link>

                                    <Link
                                        to="/academia/configuracion"
                                        onClick={() => {
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center gap-4 px-6 py-4 rounded-xl shadow-lg transition-all bg-white hover:bg-gray-50 text-academy-blue-900"
                                    >
                                        <Settings size={22} />
                                        <span className="text-lg font-medium"> Configuración</span>
                                    </Link>

                                    <div className="pt-4">
                                        <button
                                            onClick={() => {
                                                onLogout();
                                                setIsOpen(false);
                                            }}
                                            className="w-full flex items-center justify-center gap-4 bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-xl shadow-lg transition-all"
                                        >
                                            <LogOut size={22} />
                                            <span className="text-lg font-medium">Cerrar Sesión</span>
                                        </button>
                                    </div>
                                </motion.div>

                                {/* Branding */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="mt-12"
                                >
                                    <p className="text-center text-sm text-gray-500">
                                        Academia <span className="text-gold-500">Maxi Broker</span>
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AcademyMobileMenu;