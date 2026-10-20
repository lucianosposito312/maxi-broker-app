import { Facebook, Instagram, MessageCircle } from 'lucide-react';

const Footer = () => {
    // Custom SVG for TikTok since it's not in standard Lucide (or just use basic icon)
    // Actually Lucide might have it or just SVG it
    const TikTokIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
    );

    return (
        <footer id="contact" className="bg-forest-900 text-white py-16 border-t border-gold-500/20">
            <div className="container mx-auto px-4 flex flex-col items-center text-center">

                {/* Logo */}
                <div className="mb-8">
                    <img
                        src="/assets/logoSinFondo.webp"
                        alt="Maxi Broker"
                        className="h-32" // Increased size to match Header (Option A)
                    />
                </div>

                <div className="w-full max-w-md border-t border-white/10 my-6"></div>

                <h3 className="text-xl font-serif text-gold-500 mb-8 uppercase tracking-widest">Contactanos</h3>

                <div className="flex flex-wrap justify-center gap-6">
                    {/* WhatsApp */}
                    <a
                        href="https://wa.me/+541163789186"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-3 rounded-full transition-all hover:scale-105 shadow-lg font-medium"
                    >
                        <MessageCircle size={20} fill="white" />
                        <span>WhatsApp</span>
                    </a>

                    {/* Instagram */}
                    <a
                        href="https://www.instagram.com/maximiliano_broker_inmo?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-90 text-white px-6 py-3 rounded-full transition-all hover:scale-105 shadow-lg font-medium"
                    >
                        <Instagram size={20} />
                        <span>Instagram</span>
                    </a>

                    {/* Facebook */}
                    <a
                        href="https://www.facebook.com/maximiliano.gonzalez.931707?locale=es_LA"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 bg-[#1877F2] hover:bg-[#166fe5] text-white px-6 py-3 rounded-full transition-all hover:scale-105 shadow-lg font-medium"
                    >
                        <Facebook size={20} fill="white" />
                        <span>Facebook</span>
                    </a>

                    {/* TikTok */}
                    <a
                        href="https://www.tiktok.com/@maximiliano.broke?is_from_webapp=1&sender_device=pc"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 rounded-full px-6 py-3 transition-all hover:scale-105 font-medium"
                        style={{ backgroundColor: 'black', color: 'white' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                        </svg>
                        <span>TikTok</span>
                    </a>
                </div>

                <div className="mt-12 flex flex-col items-center gap-4">
                    <div className="flex gap-4 text-sm text-gray-400">
                        <a href="/terminos-y-condiciones" className="hover:text-gold-500 transition-colors">Términos y Condiciones</a>
                        <a href="/politicas-de-privacidad" className="hover:text-gold-500 transition-colors">Políticas de Privacidad</a>
                    </div>
                    <div className="text-gray-500 text-xs">
                        © {new Date().getFullYear()} Todos los derechos reservados Maximiliano Broker.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
