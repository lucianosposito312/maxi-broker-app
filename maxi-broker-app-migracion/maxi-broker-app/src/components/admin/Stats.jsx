import { useState, useEffect } from 'react';
import { BarChart, Activity, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const Stats = () => {
    const [stats, setStats] = useState({
        totalLeads: 0,
        ebookDownloads: 0,
        appointments: 0,
        statusCounts: {
            'Nuevo': 0,
            'Contactado': 0,
            'Agendó cita': 0,
            'No agendó cita': 0,
            'Ya visitó un lugar': 0,
            'Ya compró': 0
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch everything in parallel
            const [
                { count: totalLeads },
                { count: ebookDownloads },
                { count: appointments },
                { data: statusData }
            ] = await Promise.all([
                supabase.from('leads').select('*', { count: 'exact', head: true }),
                supabase.from('leads').select('*', { count: 'exact', head: true }).eq('downloaded_ebook', true),
                supabase.from('leads').select('*', { count: 'exact', head: true }).not('appointment_date', 'is', null),
                supabase.from('leads').select('status')
            ]);

            // Calculate status counts from data
            const counts = {
                'Nuevo': 0,
                'Contactado': 0,
                'Agendó cita': 0,
                'No agendó cita': 0,
                'Ya visitó un lugar': 0,
                'Ya compró': 0
            };

            statusData?.forEach(lead => {
                const leadStatuses = Array.isArray(lead.status) ? lead.status : [lead.status];
                leadStatuses.forEach(s => {
                    if (counts[s] !== undefined) {
                        counts[s]++;
                    }
                });
            });

            setStats({
                totalLeads: totalLeads || 0,
                ebookDownloads: ebookDownloads || 0,
                appointments: appointments || 0,
                statusCounts: counts
            });
        } catch (err) {
            console.log('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        'Nuevo': 'bg-blue-500',
        'Contactado': 'bg-yellow-500',
        'Agendó cita': 'bg-green-500',
        'No agendó cita': 'bg-red-500',
        'Ya visitó un lugar': 'bg-purple-500',
        'Ya compró': 'bg-indigo-500'
    };

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Total Leads</p>
                    <h3 className="text-3xl font-bold text-forest-900 mt-1">{loading ? '-' : stats.totalLeads}</h3>
                </div>
                <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Descargas Ebook</p>
                    <h3 className="text-3xl font-bold text-forest-900 mt-1">{loading ? '-' : stats.ebookDownloads}</h3>
                </div>
                <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Citas Agendadas</p>
                    <h3 className="text-3xl font-bold text-forest-900 mt-1">{loading ? '-' : stats.appointments}</h3>
                </div>
            </div>

            {/* Graphical Status Blocks */}
            <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
                <h4 className="font-serif text-2xl mb-8 text-forest-900 text-center">Embudo de Conversión</h4>

                <div className="space-y-6 max-w-3xl mx-auto">
                    {Object.entries(stats.statusCounts).map(([status, count]) => {
                        const percentage = stats.totalLeads > 0 ? (count / stats.totalLeads * 100) : 0;
                        return (
                            <div key={status}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-forest-800">{status}</span>
                                    <span className="text-sm font-bold text-forest-900">{count} ({percentage.toFixed(1)}%)</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${statusColors[status]}`}
                                        style={{ width: `${loading ? 0 : Math.max(percentage, 2)}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(stats.statusCounts).map(([status, count]) => (
                        <div key={status} className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full mb-2 ${statusColors[status]}`}></div>
                            <span className="text-xs text-gray-500 uppercase tracking-tighter text-center">{status}</span>
                            <span className="text-xl font-bold text-forest-900 mt-1">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-forest-900 p-8 rounded-lg text-white">
                <h4 className="font-serif text-xl mb-4">Estado del Sistema</h4>
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-400' : 'bg-green-500'} animate-pulse`}></div>
                    <span className="text-sm font-light">{loading ? 'Verificando datos...' : 'Sincronización con Supabase activa'}</span>
                </div>
            </div>
        </div>
    );
};

export default Stats;
