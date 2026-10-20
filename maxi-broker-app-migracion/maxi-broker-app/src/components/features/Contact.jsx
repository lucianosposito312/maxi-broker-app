import { useEffect } from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://assets.calendly.com/assets/external/widget.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            // Cleanup script if needed, but usually fine to leave it in body
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        }
    }, []);

    return (
        <section id="contact" className="py-24 bg-forest-900 text-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-forest-800/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-gold-500 font-medium tracking-widest uppercase mb-2">Hablemos de negocios</h2>
                    <h3 className="text-4xl md:text-5xl font-serif mb-6">Agendar una Reunión</h3>
                    <p className="max-w-xl mx-auto text-gray-300 font-light">
                        Seleccione el horario que mejor se adapte a su agenda para una consulta personalizada sobre sus próximas inversiones.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-white rounded-lg overflow-hidden shadow-2xl max-w-4xl mx-auto"
                >
                    {/* Calendly Widget */}
                    <div
                        className="calendly-inline-widget"
                        data-url="https://calendly.com/es/pricing" // Placeholder URL, user needs to update
                        style={{ minWidth: '320px', height: '700px' }}
                    ></div>
                </motion.div>
            </div>
        </section>
    );
};

export default Contact;
