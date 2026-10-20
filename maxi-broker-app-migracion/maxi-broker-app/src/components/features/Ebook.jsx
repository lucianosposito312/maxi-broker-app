import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Download, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Ebook = ({ pendingAppointment, onLeadSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: ''
    });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = '/assets/Rompiendo mitos sobre comprar tu lote.pdf';
        link.download = 'Rompiendo mitos sobre comprar tu lote.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            if (onLeadSubmit) {
                await onLeadSubmit(formData);
            }

            setStatus('success');
            setTimeout(handleDownload, 1000);
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <section id="ebook" className="py-24 bg-forest-900 text-white overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">

                    {/* Content & Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-full lg:w-1/2"
                    >
                        <h2 className="text-gold-500 font-medium tracking-widest uppercase mb-2">Recurso Exclusivo</h2>
                        <h3 className="text-4xl md:text-5xl font-serif mb-6 leading-tight text-gold-500">
                            Rompiendo mitos sobre comprar tu lote
                        </h3>
                        <p className="text-gray-300 text-lg mb-8 leading-relaxed font-light">
                            Este regalo es para vos. En esta guía descubrirás los mitos más comunes que impiden a muchas personas comprar su propio lote y cómo superarlos para tomar la mejor decisión de inversión.
                        </p>

                        {status === 'success' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-forest-800/50 p-8 rounded-lg border border-gold-500/30 text-center"
                            >
                                <CheckCircle className="w-16 h-16 text-gold-500 mx-auto mb-4" />
                                <h4 className="text-2xl font-serif mb-2">¡Bienvenido nuevamente!</h4>
                                <p className="text-gray-300 mb-6">Su descarga comenzará automáticamente o puede usar el botón debajo.</p>
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center justify-center space-x-2 mx-auto text-gold-500 hover:text-white transition-colors border-b border-gold-500 pb-1"
                                >
                                    <Download size={20} />
                                    <span>Descargar Ebook</span>
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4 bg-white/5 p-8 rounded-lg backdrop-blur-sm border border-white/10">
                                {pendingAppointment && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-gold-500/20 border border-gold-500 text-gold-100 p-4 rounded mb-6"
                                    >
                                        <p className="text-sm font-medium">
                                            Estás a un paso de confirmar tu visita. Por favor completa tus datos para finalizar la reserva y descargar el ebook.
                                        </p>
                                    </motion.div>
                                )}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nombre Completo</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-forest-800 border-none rounded py-3 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-gold-500 transition-all font-light"
                                        placeholder="Ingrese su nombre"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-forest-800 border-none rounded py-3 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-gold-500 transition-all font-light"
                                        placeholder="+54 9 11..."
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-forest-800 border-none rounded py-3 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-gold-500 transition-all font-light"
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={status === 'submitting' || status === 'success'}
                                    className={`w-full font-medium tracking-wider py-4 rounded transition-all duration-300 shadow-lg flex items-center justify-center space-x-2 mt-4 
                                        ${(!formData.name || !formData.email || !formData.phone)
                                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-80'
                                            : 'bg-gold-500 hover:bg-gold-600 text-white shadow-gold-900/20'
                                        }`}
                                >
                                    {status === 'submitting' ? (
                                        <>
                                            <Loader2 className="animate-spin" />
                                            <span>PROCESANDO...</span>
                                        </>
                                    ) : (
                                        <>
                                            {(!formData.name || !formData.email || !formData.phone) ? <span className="mr-2">🔒</span> : <Download size={20} />}
                                            <span>{(!formData.name || !formData.email || !formData.phone) ? "DESBLOQUEAR EBOOK" : "DESCARGAR GUÍA AHORA"}</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </motion.div>

                    {/* Image/Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-full lg:w-1/2 relative flex justify-center"
                    >
                        <div className="relative w-3/4 max-w-sm">
                            <div className="absolute inset-0 bg-gold-500/20 blur-3xl rounded-full -z-10 transform scale-110"></div>
                            <img
                                src="/assets/ebook.webp"
                                alt="Ebook Rompiendo mitos sobre comprar tu lote"
                                className="w-full h-auto drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute -bottom-4 -right-4 bg-gold-500 text-white font-bold px-4 py-2 rounded-lg shadow-lg transform rotate-3 z-20 border-2 border-white">
                                GRATUITO
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default Ebook;
