import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { academiaAuth } from '../lib/academiaAuth';
import AcademiaLoginRegister from '../components/academy/AcademiaLoginRegister';
import BirthDateModal from '../components/academy/BirthDateModal';
import AcademyNavBar from '../components/academy/AcademyNavBar';
import AcademyMobileMenu from '../components/academy/AcademyMobileMenu';
import WelcomeSection from '../components/academy/WelcomeSection';
import CoursesGrid from '../components/academy/CoursesGrid';
import CatalogCourseCard from '../components/academy/CatalogCourseCard';
import CourseModal from '../components/academy/CourseModal';
import { coursesService, academyStatsService } from '../lib/coursesService';
import { usePageTracking } from '../hooks/usePageTracking';
import { Clock, BookOpen, Star, Rocket, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';

const Academy = () => {
    usePageTracking();
    const { academyUser, loginAcademy, logoutAcademy, updateAcademyUser } = useUser();
    const [showBirthDateModal, setShowBirthDateModal] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [showLogin, setShowLogin] = useState(false);
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [userStats, setUserStats] = useState({ completedCourses: 0 });
    const [loadingStats, setLoadingStats] = useState(false);

    const pendingCourseId = searchParams.get('courseId');

    useEffect(() => {
        const session = academiaAuth.getSession();
        if (session && !academyUser) {
            loginAcademy(session);
        }
    }, [academyUser, loginAcademy]);

    useEffect(() => {
        if (academyUser && !academyUser.birth_date) {
            setShowBirthDateModal(true);
        }
    }, [academyUser]);

    useEffect(() => {
        const loadAcademyData = async () => {
            setLoadingCourses(true);
            try {
                const data = await coursesService.getAllActiveCourses();
                setCourses(data);
            } catch (error) {
                console.error('Error fetching academy data:', error);
            } finally {
                setLoadingCourses(false);
            }
        };
        loadAcademyData();
    }, []);

    // Recargar cursos cuando se regresa de PaymentSuccess
    useEffect(() => {
        const loadAcademyData = async () => {
            try {
                const data = await coursesService.getAllActiveCourses();
                setCourses(data);
            } catch (error) {
                console.error('Error fetching academy data:', error);
            }
        };
        loadAcademyData();
    }, [academyUser]);

    useEffect(() => {
        const loadUserStats = async () => {
            if (academyUser) {
                setLoadingStats(true);
                try {
                    const stats = await academyStatsService.getUserStats(academyUser.id);
                    setUserStats(stats);
                } catch (error) {
                    console.error('Error loading user stats:', error);
                } finally {
                    setLoadingStats(false);
                }
            }
        };
        loadUserStats();
    }, [academyUser]);

    const handleSelectCourse = (course) => {
        setSelectedCourse(course);
        setShowLogin(true);
    };

    const handleLoginSuccess = (user) => {
        loginAcademy(user);

        if (selectedCourse) {
            setShowCourseModal(true);
        }
    };

    const handleAccessCourse = async (course) => {
        if (!academyUser) {
            setShowLogin(true);
            return;
        }

        const DEMO_USER_EMAIL = 'lucianodavidsposito@gmail.com';
        const isDemoUser = academyUser.email === DEMO_USER_EMAIL;

        if (!isDemoUser) {
            setShowCourseModal(true);
            return;
        }

        try {
            const { enrollmentsService } = await import('../lib/coursesService');
            const alreadyEnrolled = await enrollmentsService.isUserEnrolled(academyUser.id, course.id);

            if (!alreadyEnrolled) {
                await enrollmentsService.createEnrollment({
                    user_id: academyUser.id,
                    course_id: course.id,
                    payment_status: 'paid',
                    payment_id: 'demo-access-' + Date.now(),
                    paid_at: new Date().toISOString(),
                    created_at: new Date().toISOString()
                });
            }

            navigate(`/academia/course/${course.id}`);
        } catch (error) {
            console.error('Error:', error);
            navigate(`/academia/course/${course.id}`);
        }
    };

    const handleCloseCourseModal = () => {
        setShowCourseModal(false);
        setSelectedCourse(null);
        setShowLogin(false);
    };

    const handleBirthDateComplete = (birthDate) => {
        updateAcademyUser({ birth_date: birthDate });
        setShowBirthDateModal(false);
    };

    const handleLogout = () => {
        logoutAcademy();
    };

    if (!academyUser) {
        return (
            <div className="min-h-screen md:h-screen md:overflow-hidden bg-white flex flex-col md:flex-row">
                {/* Left Side: Branding & Info - Original Size */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full md:w-1/2 p-8 md:p-12 lg:p-20 flex flex-col justify-center bg-gradient-to-br from-academy-blue-900 to-[#12243d] text-white relative overflow-hidden"
                >
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                    </div>

                    <div className="relative z-10">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="mb-8"
                        >
                            <img
                                src="/assets/AcademyLogoSinFondo.webp"
                                alt="Academia Maxi Broker"
                                className="w-48 md:w-64 h-auto drop-shadow-2xl rounded-full"
                            />
                        </motion.div>

                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif mb-6 leading-tight text-white">
                            Academia <br />
                            <span className="text-gold-500">Maxi Broker</span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-300 max-w-lg leading-relaxed mb-8">
                            Transforma tu carrera con formación de élite.
                            Accede a cursos exclusivos, mentoría y herramientas para el éxito.
                        </p>

                        <div className="flex gap-4 text-sm font-medium text-gold-400">
                            <span className="flex items-center gap-2">✓ Formación Experta</span>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side: Catalog or Login */}
                <div className="w-full md:w-1/2 p-4 md:p-6 flex flex-col bg-gray-50 relative overflow-y-auto md:overflow-hidden">
                    <AnimatePresence mode="wait">
                        {!showLogin ? (
                            <motion.div
                                key="catalog"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }}
                                transition={{ duration: 0.5 }}
                                className="flex-1 flex flex-col overflow-y-auto md:overflow-hidden"
                            >
                                {loadingCourses ? (
                                    <div className="flex-1 flex items-center justify-center p-4">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
                                    </div>
                                ) : courses.length === 0 ? (
                                    <div className="flex-1 flex items-center justify-center p-4">
                                        <div className="max-w-md w-full text-center space-y-6">
                                            <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                                <Clock className="w-10 h-10 text-gold-500 animate-pulse" />
                                            </div>
                                            <h3 className="text-2xl font-serif text-academy-blue-900">
                                                Próximamente
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Estamos preparando cursos exclusivos para potenciar tu carrera.
                                                ¡Vuelve pronto para ver el catálogo completo!
                                            </p>
                                            <button
                                                onClick={() => setShowLogin(true)}
                                                className="w-full bg-academy-blue-900 hover:bg-gold-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
                                            >
                                                Ingresar a mi cuenta
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto pr-2 pb-2">
                                        <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-50 py-2">
                                            <h2 className="text-lg md:text-xl font-bold text-academy-blue-900">
                                                Selecciona un curso
                                            </h2>
                                            <button
                                                onClick={() => setShowLogin(true)}
                                                className="bg-academy-blue-900 hover:bg-gold-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                                            >
                                                Ingresar
                                            </button>
                                        </div>
                                        <div className="flex flex-col w-full max-w-md mx-auto">
                                            {courses.map((course, index) => (
                                                <CatalogCourseCard
                                                    key={course.id}
                                                    course={course}
                                                    index={index}
                                                    onSelectCourse={handleSelectCourse}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="login"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }}
                                transition={{ duration: 0.5 }}
                                className="w-full max-w-md mx-auto"
                            >
                                {selectedCourse && (
                                    <div className="mb-4 p-3 bg-gradient-to-r from-academy-blue-900/10 to-academy-blue-800/10 rounded-xl border border-academy-blue-900/20">
                                        <p className="text-sm text-academy-blue-900 font-medium">
                                            Has seleccionado: <strong>{selectedCourse.title}</strong>
                                        </p>
                                        <p className="text-xs text-slate-600 mt-1">
                                            Inicia sesión para acceder al curso
                                        </p>
                                    </div>
                                )}
                                <AcademiaLoginRegister onSuccess={handleLoginSuccess} />
                                <button
                                    onClick={() => {
                                        setShowLogin(false);
                                        setSelectedCourse(null);
                                    }}
                                    className="mt-3 w-full py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors text-center"
                                >
                                    ← Cambiar de curso
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="text-center text-sm text-gray-400 py-2">
                        &copy; {new Date().getFullYear()} Maximiliano Gonzalez.
                    </div>
                </div>

                {/* Floating Back Button */}
                <Link
                    to="/"
                    className="absolute top-4 right-4 md:left-4 md:right-auto z-50 p-2 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 transition-all flex items-center gap-1 group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                    <span className="text-xs font-medium hidden group-hover:block">Volver</span>
                </Link>

                {/* Course Modal - Show after login with selected course */}
                {showCourseModal && selectedCourse && (
                    <CourseModal
                        course={selectedCourse}
                        isOpen={showCourseModal}
                        onClose={handleCloseCourseModal}
                        onAccess={handleAccessCourse}
                        userId={academyUser?.id}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            <AcademyNavBar onLogout={handleLogout} />
            <AcademyMobileMenu onLogout={handleLogout} />

            {showBirthDateModal && (
                <BirthDateModal user={academyUser} onComplete={handleBirthDateComplete} />
            )}

            <div className="pt-20 pb-12 px-4">
                <div className="max-w-7xl mx-auto space-y-8">
                    <WelcomeSection userName={academyUser.name} />

                    {courses.length > 0 && (
                        <OpportunityPanel stats={userStats} user={academyUser} />
                    )}

                    {courses.length === 0 ? (
                        <ComingSoonSection />
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <CoursesGrid
                                userId={academyUser.id}
                            />
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

const OpportunityPanel = ({ stats, user }) => {
    const minCompleted = 3;
    const progress = Math.min((stats.completedCourses / minCompleted) * 100, 100);
    const isEligible = stats.completedCourses >= minCompleted;

    const handleClaimOpportunity = () => {
        const message = `Hola!! soy ${user.name} y termine tres cursos de tu academia. Me gustaria trabajar con ustedes.`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/5491136585642?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden group mb-8"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-academy-blue-900 to-[#1e3a5f] rounded-3xl shadow-xl transition-all duration-500 group-hover:shadow-academy-blue-900/20 group-hover:shadow-2xl"></div>

            {/* Background elements */}
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Star className="w-32 h-32 text-gold-500 animate-spin-slow" />
            </div>

            <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gold-500/20 rounded-lg">
                            <Rocket className="w-6 h-6 text-gold-500" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-serif text-white">
                            Tu Oportunidad Profesional
                        </h3>
                    </div>

                    <p className="text-gray-300 text-sm md:text-base max-w-2xl leading-relaxed">
                        En la Academia Maxi Broker premiamos tu compromiso.
                        Completa **{minCompleted} cursos** y habilita una reunión directa con Maximiliano Gonzalez para formar parte de nuestro equipo de élite.
                    </p>

                    <div className="space-y-2">
                        <div className="flex justify-between items-end text-sm">
                            <span className="text-gold-400 font-medium">Progreso hacia la meta</span>
                            <span className="text-white font-bold">{stats.completedCourses} / {minCompleted} Cursos</span>
                        </div>
                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-gold-600 to-gold-400 shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-auto">
                    {isEligible ? (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleClaimOpportunity}
                            className="w-full md:w-auto px-8 py-4 bg-gold-500 hover:bg-gold-400 text-academy-blue-900 font-bold rounded-2xl shadow-[0_8px_20px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-3 group/btn"
                        >
                            <Sparkles className="w-5 h-5 animate-pulse" />
                            <span>Reclamar mi Oportunidad</span>
                            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                        </motion.button>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <button
                                disabled
                                className="w-full md:w-auto px-8 py-4 bg-white/5 border border-white/10 text-gray-500 font-medium rounded-2xl cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                <Clock size={20} />
                                <span>Faltan {minCompleted - stats.completedCourses} cursos más</span>
                            </button>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Incentivo de Carrera</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const ComingSoonSection = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-8 md:p-12 bg-white rounded-3xl shadow-xl border border-academy-blue-900/10 text-center space-y-6 max-w-2xl mx-auto relative overflow-hidden group"
    >
        {/* Animated background circle */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>

        <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mb-2 shadow-inner">
            <Clock className="w-10 h-10 text-gold-500 animate-pulse" />
        </div>
        <div>
            <h3 className="text-2xl md:text-3xl font-serif text-academy-blue-900 mb-4">
                Próximamente
            </h3>
            <p className="text-gray-600 leading-relaxed">
                Estamos trabajando para brindarte la mejor formación en Real Estate.
                Nuestros cursos exclusivos de la Academia Maxi Broker estarán disponibles muy pronto.
            </p>
        </div>
        <div className="pt-4 flex flex-col items-center gap-3">
            <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="px-4 py-2 bg-academy-blue-900/5 rounded-full border border-academy-blue-900/10"
            >
                <span className="text-sm font-medium text-academy-blue-900">
                    ✨ Nuevos cursos en camino
                </span>
            </motion.div>
            <p className="text-xs text-gray-400">
                ¡Mantente atento a nuestras redes sociales para el lanzamiento oficial!
            </p>
        </div>
    </motion.div>
);

export default Academy;
