import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Check, X, Search, Calendar, User, Clock, MapPin, Plus, Trash2 } from 'lucide-react';

const Leads = () => {
    const [leads, setLeads] = useState([]);
    const [filter, setFilter] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [activeProjectTab, setActiveProjectTab] = useState('Todos');
    const [availableProjects, setAvailableProjects] = useState([]);

    // Get unique projects from leads with appointments + 'Todos'
    const appointmentProjects = ['Todos', ...new Set(leads.filter(l => l.appointment_date && l.project_interest).map(l => l.project_interest))];

    useEffect(() => {
        fetchLeads();
        fetchProjects();
    }, []);

    const fetchLeads = async () => {
        try {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching leads:', error);
                setLeads([]);
            } else {
                setLeads(data || []);
            }
        } catch (err) {
            console.error('Catch error:', err);
            setLeads([]);
        }
    };

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

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        const newLead = {
            name: document.getElementById('manualName').value,
            email: document.getElementById('manualEmail').value,
            phone: document.getElementById('manualPhone').value,
            appointment_date: document.getElementById('manualDate').value || null,
            appointment_time: document.getElementById('manualTime').value || null,
            project_interest: document.getElementById('manualProject').value || null,
            status: ['Nuevo'],
            downloaded_ebook: false,
            created_at: new Date().toISOString()
        };

        const tempId = Date.now();
        setLeads([{ ...newLead, id: tempId }, ...leads]);
        setShowForm(false);
        await supabase.from('leads').insert([newLead]);
    };

    const handleDeleteLead = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar este lead?')) return;

        try {
            // Delete from Supabase first
            const { error } = await supabase.from('leads').delete().eq('id', id);

            if (error) {
                console.error('Error deleting lead:', error);
                alert('Error al eliminar el lead. Por favor intenta de nuevo.');
                return;
            }

            // Update local state only if Supabase deletion was successful
            setLeads(leads.filter(l => l.id !== id));
        } catch (err) {
            console.error('Error:', err);
            alert('Error al eliminar el lead.');
        }
    };

    const handleAddStatus = async (id, statusToAdd) => {
        const lead = leads.find(l => l.id === id);
        if (!lead) return;

        const currentStatus = Array.isArray(lead.status) ? lead.status : [lead.status];
        if (currentStatus.includes(statusToAdd)) return;

        const newStatus = [...currentStatus, statusToAdd];

        try {
            const { error } = await supabase
                .from('leads')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
        } catch (err) {
            console.error('Error adding status:', err);
        }
    };

    const handleRemoveStatus = async (id, statusToRemove) => {
        const lead = leads.find(l => l.id === id);
        if (!lead) return;

        const currentStatus = Array.isArray(lead.status) ? lead.status : [lead.status];
        const newStatus = currentStatus.filter(s => s !== statusToRemove);

        try {
            const { error } = await supabase
                .from('leads')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
        } catch (err) {
            console.error('Error removing status:', err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Nuevo': return 'bg-blue-100 text-blue-800';
            case 'Contactado': return 'bg-yellow-100 text-yellow-800';
            case 'Agendó cita': return 'bg-green-100 text-green-800';
            case 'No agendó cita': return 'bg-red-100 text-red-800';
            case 'Ya visitó un lugar': return 'bg-purple-100 text-purple-800';
            case 'Ya compró': return 'bg-indigo-100 text-indigo-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(filter.toLowerCase()) ||
        lead.email.toLowerCase().includes(filter.toLowerCase())
    );

    const filteredAppointments = activeProjectTab === 'Todos'
        ? leads.filter(l => l.appointment_date)
        : leads.filter(l => l.appointment_date && l.project_interest === activeProjectTab);

    return (
        <div className="h-[calc(100vh-200px)] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar lead..."
                        className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center space-x-2 bg-gold-500 text-white px-4 py-2 rounded hover:bg-gold-600 transition-colors"
                >
                    {showForm ? 'Cancelar' : <><Plus size={18} /><span>Nuevo Lead/Cita</span></>}
                </button>
            </div>

            {/* Manual Form (Modal-like overlay or inline push) */}
            {showForm && (
                <div className="bg-gray-50 p-6 rounded-lg mb-4 border border-gray-200 shrink-0">
                    <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input id="manualName" type="text" placeholder="Nombre" required className="border p-2 rounded" />
                        <input id="manualEmail" type="email" placeholder="Email" required className="border p-2 rounded" />
                        <input id="manualPhone" type="text" placeholder="Teléfono" className="border p-2 rounded" />
                        <select id="manualProject" className="border p-2 rounded">
                            <option value="">-- Proyecto --</option>
                            {availableProjects.map((projectTitle, idx) => (
                                <option key={idx} value={projectTitle}>{projectTitle}</option>
                            ))}
                        </select>
                        <input id="manualDate" type="date" className="border p-2 rounded" />
                        <input id="manualTime" type="time" className="border p-2 rounded" />
                        <button type="submit" className="md:col-span-2 bg-forest-900 text-white px-4 py-2 rounded hover:bg-forest-800">Guardar</button>
                    </form>
                </div>
            )}

            {/* Split View */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">

                {/* Left: Leads List */}
                <div className="bg-white rounded-lg shadow border border-gray-100 flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 font-serif font-medium text-forest-900 sticky top-0">
                        Listado de Leads
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {filteredLeads.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No hay leads registrados.</p>
                        ) : (
                            <div className="space-y-3">
                                {filteredLeads.map(lead => (
                                    <div key={lead.id} className="p-4 border border-gray-100 rounded hover:bg-gray-50 transition-colors flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-forest-900">{lead.name}</h4>
                                            <p className="text-sm text-gray-600">{lead.email}</p>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(lead.created_at).toLocaleDateString()}</p>
                                            {lead.birth_date && (
                                                <div className="mt-2 inline-flex items-center gap-1 bg-gold-100 text-gold-800 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                                    🎓 Academia • {new Date(lead.birth_date).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            <div className="flex flex-wrap justify-end gap-1 mb-1">
                                                {(Array.isArray(lead.status) ? lead.status : [lead.status]).map((s, idx) => (
                                                    <span
                                                        key={idx}
                                                        onClick={() => handleRemoveStatus(lead.id, s)}
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase cursor-pointer hover:opacity-70 transition-opacity flex items-center gap-1 ${getStatusColor(s)}`}
                                                        title="Clic para eliminar etiqueta"
                                                    >
                                                        {s} <X size={10} />
                                                    </span>
                                                ))}
                                            </div>
                                            <select
                                                value=""
                                                onChange={(e) => {
                                                    if (e.target.value) handleAddStatus(lead.id, e.target.value);
                                                }}
                                                className="px-2 py-1 rounded text-xs font-medium border border-gray-200 cursor-pointer focus:ring-1 focus:ring-gold-500 bg-white"
                                            >
                                                <option value="" disabled>+ Etiqueta</option>
                                                <option value="Nuevo">Nuevo</option>
                                                <option value="Contactado">Contactado</option>
                                                <option value="Agendó cita">Agendó cita</option>
                                                <option value="No agendó cita">No agendó cita</option>
                                                <option value="Ya visitó un lugar">Ya visitó un lugar</option>
                                                <option value="Ya compró">Ya compró</option>
                                            </select>
                                            {lead.downloaded_ebook && (
                                                <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                    <Check size={12} /> Ebook
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteLead(lead.id);
                                                }}
                                                className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                                                title="Eliminar lead"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Appointments List */}
                <div className="bg-white rounded-lg shadow border border-gray-100 flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 font-serif font-medium text-forest-900 sticky top-0 flex items-center justify-between">
                        <span>Agenda de Citas</span>
                        <div className="flex space-x-2 overflow-x-auto max-w-[200px] md:max-w-xs no-scrollbar">
                            {appointmentProjects.map(proj => (
                                <button
                                    key={proj}
                                    onClick={() => setActiveProjectTab(proj)}
                                    className={`text-xs px-2 py-1 rounded whitespace-nowrap transition-colors ${activeProjectTab === proj ? 'bg-gold-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                        }`}
                                >
                                    {proj}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {filteredAppointments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
                                <Calendar size={32} className="mb-2 opacity-50" />
                                <p>No hay citas agendadas para {activeProjectTab}.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredAppointments.map(app => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const appDate = new Date(app.appointment_date);
                                    appDate.setHours(0, 0, 0, 0);

                                    const isPast = appDate < today;
                                    const isToday = appDate.getTime() === today.getTime();

                                    return (
                                        <div
                                            key={app.id}
                                            className={`border-l-4 border-gold-500 bg-orange-50/50 p-4 rounded-r shadow-sm transition-opacity ${isPast ? 'opacity-50' : isToday ? 'opacity-80' : 'opacity-100'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h5 className="font-bold text-forest-900 flex items-center gap-2">
                                                    <Clock size={16} className="text-gold-600" />
                                                    {new Date(app.appointment_date).toLocaleDateString()} - {app.appointment_time} hs
                                                    {isPast && <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded ml-2 uppercase tracking-tighter">Transcurrido</span>}
                                                    {isToday && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded ml-2 uppercase tracking-tighter animate-pulse font-bold">Cita transcurriendo</span>}
                                                </h5>
                                                <span className="text-xs bg-gold-100 text-gold-800 px-2 py-0.5 rounded-full border border-gold-200">
                                                    {app.project_interest}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                                                <User size={14} /> {app.name}
                                            </div>
                                            <div className="text-xs text-gray-500 pl-6">
                                                {app.phone} • {app.email}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Leads;
