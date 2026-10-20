import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const Hero = () => {
    return (
        <section id="hero" className="min-h-screen w-full relative pt-32 pb-20 overflow-hidden bg-white">
            <div className="container mx-auto px-4 lg:px-8 h-full flex flex-col md:flex-row items-center">

                {/* Left: Text Content */}
                <div className="w-full md:w-1/2 z-20 md:pr-12 text-center md:text-left mb-16 md:mb-0">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Removed Luxury Living tag */}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-5xl lg:text-7xl font-serif text-forest-900 leading-tight mb-8"
                    >
                        Una inversión que <br />
                        <span className="italic font-light">te va a encantar</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-gray-600 text-lg leading-relaxed mb-10 max-w-lg mx-auto md:mx-0 font-light"
                    >
                        Mira todos los proyectos disponibles y descubrí cuál se adapte más a vos
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <a
                            href="#projects"
                            className="inline-block bg-gold-500 hover:bg-gold-600 text-white px-8 py-3 rounded-md font-medium tracking-wide shadow-lg transition-all hover:scale-105"
                        >
                            Ver Proyectos
                        </a>
                    </motion.div>
                </div>

                {/* Right: Visual Box with Video/Images */}
                <div className="w-full md:w-1/2 relative h-[500px] md:h-[600px] flex items-center justify-center">

                    {/* Main Video Box Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="relative w-[45%] aspect-[9/16] bg-gray-100 rounded-[30px] overflow-hidden shadow-2xl z-10"
                    >
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            poster="https://veumbiuduznfnrumkukf.supabase.co/storage/v1/object/public/Proyectos%20(MG%20Broker)/1769811642651-vboycxa5jkm.jpeg"
                            className="w-full h-full object-cover"
                        >
                            <source src="/assets/backgroundVideo.mp4" type="video/mp4" />
                        </video>
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-forest-900/20 to-transparent pointer-events-none"></div>
                    </motion.div>

                    {/* Decorative/Interactive Floating Cards */}

                    {/* Card 1: Top Left */}
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-10 left-0 -left-4 bg-white p-2 rounded-lg shadow-lg z-20 max-w-[120px] md:max-w-[260px] transform -rotate-3 cursor-pointer hover:scale-105 transition-transform md:p-4 md:rounded-xl"
                    >
                        <img src="https://veumbiuduznfnrumkukf.supabase.co/storage/v1/object/public/Proyectos%20(MG%20Broker)/1769811642651-vboycxa5jkm.jpeg" alt="Nuevos Horizontes 2" className="rounded-lg h-20 w-full object-cover md:h-44" />
                    </motion.div>

                    {/* Card 2: Bottom Right */}
                    <motion.div
                        animate={{ y: [0, 20, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-20 right-0 right-2 bg-white p-2 rounded-lg shadow-lg z-20 max-w-[140px] md:max-w-[280px] transform rotate-2 cursor-pointer hover:scale-105 transition-transform md:p-4 md:rounded-xl md:-right-4"
                    >
                        <img src="https://veumbiuduznfnrumkukf.supabase.co/storage/v1/object/public/Proyectos%20(MG%20Broker)/1769811674290-9kk5mbk7p16.jpeg" alt="Fincas San Pedro 2" className="rounded-lg h-24 w-full object-cover md:h-48" />
                    </motion.div>

                    {/* Background Blur Blob */}
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full blur-3xl opacity-50 -z-10 scale-90"></div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
