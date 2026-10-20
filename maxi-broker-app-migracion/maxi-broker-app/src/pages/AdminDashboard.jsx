import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Home as HomeIcon, LogOut, Menu, X,
    BookOpen, Edit3, BarChart3, ChevronDown, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Stats from '../components/admin/Stats';
import Leads from '../components/admin/Leads';
import ProjectsManager from '../components/admin/ProjectsManager';
import AcademyStats from '../components/admin/AcademyStats';
import AcademyCourseInfo from '../components/admin/AcademyCourseInfo';
import VisitorStatsContainer from '../components/admin/VisitorStatsContainer';

const NavItem = ({ tab, icon: Icon, label, activeTab, onClick, academyActive, isAcademyItem }) => {
    // Determine background color based on active state and if it's an academy item
    const getBgColor = () => {
        if (activeTab === tab) {
            return isAcademyItem || academyActive ? 'bg-academy-blue-900 text-white' : 'bg-gold-500 text-forest-900';
        }
        return 'hover:bg-forest-800 text-gray-300 hover:text-white';
    };

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between px-4 py-3 rounded transition-all duration-300 ${getBgColor()}`}
        >
            <div className="flex items-center space-x-3">
                <Icon size={20} />
                <span className="font-medium">{label}</span>
            </div>
        </button>
    );
};

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('stats');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAcademyOpen, setIsAcademyOpen] = useState(false);
    const navigate = useNavigate();

    const isAcademyTab = activeTab.startsWith('academy');

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-forest-900 text-white p-4 flex justify-between items-center">
                <span className="text-xl font-serif text-gold-500">Maxi Admin</span>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Sidebar / Mobile Menu */}
            <aside className={`
                ${isMobileMenuOpen ? 'block' : 'hidden'} 
                md:block 
                w-full md:w-64 
                bg-forest-900 
                text-white 
                md:flex md:flex-col
                md:h-screen md:sticky md:top-0
                transition-colors duration-500
                ${isAcademyTab ? 'border-r-4 border-academy-blue-900' : ''}
            `}>
                <div className="hidden md:block p-6 border-b border-forest-800">
                    <h2 className="text-2xl font-serif text-gold-500">Maxi Admin</h2>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavItem
                        tab="stats"
                        icon={LayoutDashboard}
                        label="Estadísticas"
                        activeTab={activeTab}
                        onClick={() => {
                            setActiveTab('stats');
                            setIsMobileMenuOpen(false);
                            setIsAcademyOpen(false);
                        }}
                    />
                    <NavItem
                        tab="leads"
                        icon={Users}
                        label="Leads"
                        activeTab={activeTab}
                        onClick={() => {
                            setActiveTab('leads');
                            setIsMobileMenuOpen(false);
                            setIsAcademyOpen(false);
                        }}
                    />
                    <NavItem
                        tab="projects"
                        icon={HomeIcon}
                        label="Proyectos"
                        activeTab={activeTab}
                        onClick={() => {
                            setActiveTab('projects');
                            setIsMobileMenuOpen(false);
                            setIsAcademyOpen(false);
                        }}
                    />

                    {/* Academia Expandable Menu */}
                    <div
                        className="relative"
                        onMouseEnter={() => !window.matchMedia('(max-width: 768px)').matches && setIsAcademyOpen(true)}
                        onMouseLeave={() => !window.matchMedia('(max-width: 768px)').matches && setIsAcademyOpen(false)}
                    >
                        <button
                            onClick={() => setIsAcademyOpen(!isAcademyOpen)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded transition-all duration-300 ${isAcademyTab || isAcademyOpen
                                ? 'bg-academy-blue-900 text-white shadow-lg lg:scale-105'
                                : 'hover:bg-forest-800 text-gray-300 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <GraduationCap size={20} />
                                <span className="font-medium">Academia</span>
                            </div>
                            <ChevronDown size={16} className={`transition-transform duration-300 ${isAcademyOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isAcademyOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden bg-forest-800/50 rounded-b-lg mt-1"
                                >
                                    <div className="p-2 space-y-1 pl-6">
                                        <button
                                            onClick={() => {
                                                setActiveTab('academy-stats');
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 rounded text-sm transition-colors ${activeTab === 'academy-stats'
                                                ? 'text-gold-400 font-bold bg-white/10'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            Estadísticas
                                        </button>
                                        <button
                                            onClick={() => {
                                                setActiveTab('academy-courses');
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 rounded text-sm transition-colors ${activeTab === 'academy-courses'
                                                ? 'text-gold-400 font-bold bg-white/10'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            Cursos
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </nav>

                <div className="p-4 border-t border-forest-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded text-red-300 hover:bg-forest-800 transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 md:p-8">
                <header className="mb-8 hidden md:block">
                    <h1 className="text-3xl font-serif text-forest-900 border-b-2 border-gold-500 pb-2 flex items-center gap-3">
                        {isAcademyTab && <GraduationCap className="text-academy-blue-900" size={32} />}
                        {activeTab === 'stats' && 'Panel de Estadísticas'}
                        {activeTab === 'leads' && 'Base de Datos de Leads'}
                        {activeTab === 'projects' && 'Gestor de Contenido'}
                        {activeTab === 'academy-stats' && 'Academia - Estadísticas Generales'}
                        {activeTab === 'academy-courses' && 'Academia - Gestión Integral de Cursos'}
                    </h1>
                </header>
                {/* Mobile Title */}
                <header className="mb-6 md:hidden">
                    <h1 className="text-2xl font-serif text-forest-900">
                        {activeTab === 'stats' && 'Estadísticas'}
                        {activeTab === 'leads' && 'Leads'}
                        {activeTab === 'projects' && 'Proyectos'}
                        {activeTab === 'academy-stats' && 'Academia Stats'}
                        {activeTab === 'academy-courses' && 'Cursos'}
                    </h1>
                </header>

                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 min-h-[500px]">
                    {activeTab === 'stats' && (
                        <div className="space-y-12">
                            <div className="border-b pb-8">
                                <h2 className="text-2xl font-bold text-forest-900 mb-6">Estadísticas Generales</h2>
                                <Stats />
                            </div>
                            <div>
                                <VisitorStatsContainer />
                            </div>
                        </div>
                    )}
                    {activeTab === 'leads' && <Leads />}
                    {activeTab === 'projects' && <ProjectsManager />}
                    {activeTab === 'academy-stats' && <AcademyStats />}
                    {activeTab === 'academy-courses' && (
                        <div>
                            <AcademyCourseInfo />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
