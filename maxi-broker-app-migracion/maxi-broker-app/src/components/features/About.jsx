import { motion } from 'framer-motion';

const About = () => {
    return (
        <section id="about" className="py-24 bg-beige-100 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                    {/* Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-full md:w-1/2"
                    >
                        <div className="relative max-w-[320px] mx-auto md:max-w-md">
                            <div className="absolute inset-0 border-2 border-gold-500 translate-x-4 translate-y-4 md:translate-x-6 md:translate-y-6 -z-10" />
                            <img
                                src="/assets/maxi-portrait.webp"
                                alt="Maximiliano González"
                                className="w-full h-auto object-cover shadow-xl grayscale-[20%] hover:grayscale-0 transition-all duration-500"
                            />
                        </div>
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full md:w-1/2 text-center md:text-left"
                    >
                        <h2 className="text-gold-500 font-medium tracking-widest uppercase mb-2">Conoce al Experto</h2>
                        <h3 className="text-4xl md:text-5xl font-serif text-forest-900 mb-8">Quién es Maximiliano</h3>

                        <div className="space-y-6 text-gray-600 text-lg leading-relaxed font-light text-left">
                            <p>
                                Soy Maximiliano González y hace más de tres años descubrí mi pasión: ayudar a las personas a encontrar el lugar donde construir sus sueños.
                            </p>
                            <p>
                                Comencé vendiendo lotes para una desarrolladora en Quilmes, y fue una etapa de mucho aprendizaje. Pero algo dentro mío me pedía más.
                            </p>
                            <p>
                                Así nació este emprendimiento, desde el deseo profundo de acompañar a cada familia en un momento tan importante como elegir su lugar en el mundo.
                            </p>
                            <p>
                                Hoy trabajo de forma independiente, ofreciendo terrenos con trato directo, transparente y humano.
                            </p>
                            <p className="font-medium text-forest-900 italic pt-4">
                                "Lo que más me mueve es eso: ser parte de ese primer paso hacia un nuevo comienzo, hacia un hogar lleno de vida y proyectos."
                            </p>
                        </div>

                        <div className="mt-10">
                            {/* Decorative element since no signature image */}
                            <div className="h-0.5 w-24 bg-gold-500 mx-auto md:mx-0"></div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default About;
