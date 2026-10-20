import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X } from 'lucide-react';
import { academiaAuth } from '../../lib/academiaAuth';
import { useUser } from '../../context/UserContext';

const BirthDateModal = ({ user, onComplete }) => {
    const { isDarkMode } = useUser();
    const [birthDate, setBirthDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        console.log('Saving birth date:', { userId: user.id, birthDate });

        const result = await academiaAuth.updateBirthDate(user.id, birthDate);

        console.log('Result:', result);

        if (result.success) {
            onComplete(birthDate);
        } else {
            setError(result.error || 'Error al guardar');
        }

        setLoading(false);
    };

    // Don't show modal if user already has birth_date
    if (user.birth_date) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200"
                >
                    {/* Header */}
                    <div className="p-6 text-center bg-white">
                        <div className="w-16 h-16 bg-[#C5A059] rounded-full flex items-center justify-center mx-auto mb-3">
                            <Calendar size={32} className="text-white" />
                        </div>
                        <h3 className="text-2xl font-serif text-[#C5A059] mb-2">
                            ¡Un último paso!
                        </h3>
                        <p className="text-gray-600 text-sm">
                            Para personalizar tu experiencia, necesitamos saber tu fecha de nacimiento
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8">
                        {error && (
                            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="mb-6">
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                }`}>
                                Fecha de Nacimiento
                            </label>
                            <input
                                type="date"
                                required
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                style={{ backgroundColor: 'white', color: '#1f2937' }}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all ${isDarkMode
                                        ? 'border-[#262626] bg-[#0a0a0a] text-white [color-scheme:dark]'
                                        : 'border-gray-200 bg-white text-gray-900'
                                    }`}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1B365D] hover:bg-[#152a4a] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            {loading ? 'Guardando...' : 'Continuar'}
                        </button>

                        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                            Esta información nos ayuda a ofrecerte contenido relevante
                        </p>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default BirthDateModal;
