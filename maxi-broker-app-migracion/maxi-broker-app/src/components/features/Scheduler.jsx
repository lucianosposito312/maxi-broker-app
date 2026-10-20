import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const Scheduler = ({ projects, onSchedule, pendingAppointment, status }) => {
    const [selectedProject, setSelectedProject] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [availableProjects, setAvailableProjects] = useState([]);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data, error } = await supabase.from('projects').select('title');
            if (!error && data) {
                setAvailableProjects(data.map(p => p.title));
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
        }
    };

    const times = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

    // Calendar Helpers
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const prevMonth = () => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        // Don't go back past current month if we are in current month
        const today = new Date();
        if (newDate.getMonth() < today.getMonth() && newDate.getFullYear() <= today.getFullYear()) return;
        setCurrentDate(newDate);
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="p-2"></div>);
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
            const isToday = date.getTime() === today.getTime();
            const isPast = date < today;
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

            days.push(
                <button
                    key={i}
                    onClick={() => !isPast && setSelectedDate(date)}
                    disabled={isPast}
                    className={`p-2 w-full aspect-square rounded-lg flex flex-col items-center justify-center transition-all relative ${isSelected
                        ? 'bg-gold-500 text-white shadow-md scale-105'
                        : isPast
                            ? 'text-gray-600 cursor-not-allowed opacity-50'
                            : 'bg-forest-800 text-gray-200 hover:bg-forest-700 hover:text-white'
                        }`}
                >
                    <span className="text-sm font-medium">{i}</span>
                    {isToday && <span className="absolute bottom-1 w-1 h-1 bg-gold-400 rounded-full"></span>}
                </button>
            );
        }
        return days;
    };

    const handleConfirm = () => {
        if (!selectedProject || !selectedDate || !selectedTime) return;
        onSchedule({
            project: selectedProject,
            date: selectedDate.toISOString(),
            time: selectedTime
        });
    };

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    if (status === 'success') {
        return (
            <section id="scheduler" className="py-24 bg-forest-900 text-white flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-forest-800 p-12 rounded-xl border border-gold-500 text-center max-w-2xl"
                >
                    <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10 text-gold-500" />
                    </div>
                    <h2 className="text-4xl font-serif mb-4 text-gold-500">¡Visita Agendada!</h2>
                    <p className="text-xl text-gray-200 mb-8 font-light">
                        Tu cita ha sido confirmada. Revisa tu email para más detalles.
                    </p>
                    <div className="bg-white/5 p-8 rounded-lg text-left inline-block min-w-[320px] border border-white/10">
                        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                            <span className="text-gray-400">Proyecto</span>
                            <span className="text-white font-medium">{selectedProject}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                            <span className="text-gray-400">Fecha</span>
                            <span className="text-white font-medium">{selectedDate?.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Hora</span>
                            <span className="text-white font-medium">{selectedTime} hs</span>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedDate(null);
                            setSelectedTime(null);
                            setSelectedProject('');
                            if (onSchedule) onSchedule(null);
                        }}
                        className="block w-full mt-8 bg-gold-500 hover:bg-gold-600 text-white font-medium py-3 rounded transition-colors"
                    >
                        Agendar otra cita
                    </button>
                </motion.div>
            </section>
        );
    }

    return (
        <section id="scheduler" className="py-24 bg-forest-900 text-white relative overflow-hidden">
            {/* Success Overlay / Blur */}
            <AnimatePresence>
                {status === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        className="absolute inset-0 z-40 bg-forest-900/60 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-forest-800 p-8 md:p-12 rounded-xl border border-gold-500 shadow-2xl text-center max-w-xl"
                        >
                            <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Clock className="w-10 h-10 text-gold-500" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-serif mb-4 text-gold-500">¡Cita Agendada!</h2>
                            <p className="text-gray-200 mb-8 font-light italic">
                                Tu cita ha sido confirmada con éxito.
                            </p>

                            <div className="bg-white/5 p-6 rounded-lg text-left mb-8 border border-white/10 text-sm">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-400">Proyecto:</span>
                                    <span className="text-gold-400 font-medium">{selectedProject}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-400">Fecha:</span>
                                    <span className="text-white">{selectedDate?.toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Hora:</span>
                                    <span className="text-white">{selectedTime} hs</span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setSelectedDate(null);
                                    setSelectedTime(null);
                                    setSelectedProject('');
                                    if (onSchedule) onSchedule(null); // Signal reset to parent
                                }}
                                className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-4 rounded-lg transition-all shadow-lg uppercase tracking-widest text-sm"
                            >
                                Agendar otra cita
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-gold-500 font-medium tracking-widest uppercase mb-2">Agenda tu visita al lugar</h2>
                    <h3 className="text-3xl md:text-5xl font-serif mb-6 text-white">
                        Selecciona la fecha y horario
                    </h3>
                </div>

                <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/10 shadow-2xl flex flex-col md:flex-row gap-8">
                    {/* Left Panel: Project & Info */}
                    <div className="w-full md:w-1/3 space-y-6">
                        <div>
                            <label className="block text-gold-500 font-medium mb-3 flex items-center gap-2">
                                <MapPin size={18} /> Selecciona el Proyecto
                            </label>
                            <select
                                className="w-full bg-forest-800 border border-forest-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-gold-500 outline-none"
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                            >
                                <option value="">-- Elige un proyecto --</option>
                                {availableProjects.map((title, idx) => (
                                    <option key={idx} value={title}>{title}</option>
                                ))}
                            </select>
                        </div>

                        {selectedDate && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-forest-800/50 p-4 rounded-lg border border-white/5"
                            >
                                <p className="text-gray-400 text-sm mb-1">Fecha seleccionada:</p>
                                <p className="text-xl font-serif text-white mb-4">
                                    {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                                {selectedTime && (
                                    <>
                                        <p className="text-gray-400 text-sm mb-1">Horario:</p>
                                        <p className="text-xl font-serif text-gold-500">{selectedTime} hs</p>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Right Panel: Calendar & Time */}
                    <div className="w-full md:w-2/3">
                        {/* Month Navigation */}
                        <div className="flex justify-between items-center mb-6 bg-forest-800 p-2 rounded-lg">
                            <button onClick={prevMonth} className="p-2 hover:bg-forest-700 rounded-full transition-colors"><ChevronLeft size={20} /></button>
                            <span className="text-lg font-medium font-serif tracking-wide">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                            <button onClick={nextMonth} className="p-2 hover:bg-forest-700 rounded-full transition-colors"><ChevronRight size={20} /></button>
                        </div>

                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 mb-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                            <div>Dom</div><div>Lun</div><div>Mar</div><div>Mie</div><div>Jue</div><div>Vie</div><div>Sab</div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 mb-8">
                            {renderCalendarDays()}
                        </div>

                        {/* Time Slots */}
                        {selectedDate && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                            >
                                <label className="block text-gold-500 font-medium mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                                    <Clock size={16} /> Horarios Disponibles
                                </label>
                                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                    {times.map((time) => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            className={`p-2 rounded text-sm transition-all ${selectedTime === time
                                                ? 'bg-gold-500 text-white font-bold'
                                                : 'bg-forest-800 text-gray-300 hover:bg-forest-700 hover:text-white'
                                                }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        <div className="mt-8">
                            <button
                                onClick={handleConfirm}
                                disabled={!selectedProject || !selectedDate || !selectedTime}
                                className={`w-full py-4 rounded-lg font-bold tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${(!selectedProject || !selectedDate || !selectedTime)
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-white text-forest-900 hover:bg-gold-500 hover:text-white'
                                    }`}
                            >
                                AGENDAR VISITA
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Scheduler;
