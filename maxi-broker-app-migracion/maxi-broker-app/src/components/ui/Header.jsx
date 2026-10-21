import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [secretCount, setSecretCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [mobileMenuOpen]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Do not render Header on Academy pages
    if (location.pathname.startsWith('/academia')) return null;

    const handleLogoClick = () => {
        const newCount = secretCount + 1;
        setSecretCount(newCount);
        
        if (newCount === 5) {
            navigate('/admin-login');
            setSecretCount(0);
        } else {
            setTimeout(() => setSecretCount(0), 2000);
        }
    };

    const navLinks = [
        { name: 'Inicio', href: '#hero', type: 'section' },
        { name: 'Quién soy', href: '#about', type: 'section' },
        { name: 'Proyectos', href: '#projects', type: 'section' },
        { name: 'Ebook', href: '#ebook', type: 'section' },
        { name: 'Academia', href: '/academia', type: 'route' },
        { name: 'Contacto', href: '#contact', type: 'section' },
    ];

    const scrollToSection = (e, href) => {
        e.preventDefault();
        // If we are on academia page, we should go home first
        if (window.location.pathname !== '/') {
            navigate('/' + href);
            return;
        }
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleMouseEnter = (href, type) => {
        if (type !== 'section' || window.location.pathname !== '/') return;
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || mobileMenuOpen ? 'bg-white shadow-sm py-2' : 'bg-transparent py-4'}`}
        >
            <div className="container mx-auto px-4 flex justify-between items-center">
                {/* Logo */}
                <div
                    onClick={handleLogoClick}
                    className="cursor-pointer relative z-50 select-none"
                >
                    <img
                        src="/assets/logoSinFondo.svg?v=3"
                        alt="Maxi Broker Logo"
                        className={`transition-all duration-300 ${isScrolled ? 'md:h-32 h-24' : 'md:h-36 h-28'}`} // Option B desktop, Option A mobile
                    />
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex space-x-8 items-center">
                    {navLinks.map((link) => (
                        link.type === 'section' ? (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={(e) => scrollToSection(e, link.href)}
                                onMouseEnter={() => handleMouseEnter(link.href, link.type)}
                                className="text-sm font-medium tracking-wide text-forest-900 hover:text-gold-500 transition-colors"
                            >
                                {link.name.toUpperCase()}
                            </a>
                        ) : (
                            <Link
                                key={link.name}
                                to={link.href}
                                className="text-sm font-medium tracking-wide text-forest-900 hover:text-gold-500 transition-colors"
                            >
                                {link.name.toUpperCase()}
                            </Link>
                        )
                    ))}
                    <a
                        href="#scheduler"
                        onClick={(e) => scrollToSection(e, '#scheduler')}
                        className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-2 rounded-full transition-colors duration-300 font-medium tracking-wider text-sm shadow-lg hover:shadow-xl"
                    >
                        AGENDAR CITA
                    </a>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden z-50 text-gold-500"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={32} /> : <Menu size={32} className="text-forest-900" />}
                </button>

                {/* Mobile Nav Overlay */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: '100%' }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: '100%' }}
                            transition={{ type: "tween" }}
                            className="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center space-y-8"
                        >
                            {navLinks.map((link) => (
                                link.type === 'section' ? (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        onClick={(e) => {
                                            scrollToSection(e, link.href);
                                            setMobileMenuOpen(false);
                                        }}
                                        className="text-2xl font-serif text-forest-900 hover:text-gold-500 transition-colors"
                                    >
                                        {link.name}
                                    </a>
                                ) : (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-2xl font-serif text-forest-900 hover:text-gold-500 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                )
                            ))}
                            <a
                                href="#scheduler"
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    const element = document.querySelector('#scheduler');
                                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="mt-4 bg-gold-500 text-white px-8 py-3 font-medium tracking-wider rounded-full shadow-lg"
                            >
                                AGENDAR CITA
                            </a>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
};

export default Header;
