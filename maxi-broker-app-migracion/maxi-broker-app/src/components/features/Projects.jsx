import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Grid, Map as MapIcon, ArrowRight, ExternalLink } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import ImageCarousel from '../ui/ImageCarousel';
import { supabase } from '../../lib/supabase';
import Map from './Map';
import 'leaflet/dist/leaflet.css';

const extractLocationFromMapLink = (mapLink) => {
    if (!mapLink) return null;
    
    try {
        if (mapLink.includes('/place/')) {
            const placePart = mapLink.split('/place/')[1].split('/')[0];
            const location = placePart.split(',')[0].replace(/\+/g, ' ');
            return location;
        }
        
        if (mapLink.includes('/search/')) {
            const searchPart = mapLink.split('/search/')[1].split('/')[0];
            const location = searchPart.split(',')[0].replace(/\+/g, ' ');
            return location;
        }
        
        if (mapLink.includes('maps.app.goo.gl') || mapLink.includes('goo.gl/maps')) {
            return 'Ver ubicación';
        }
        
        return null;
    } catch (e) {
        return null;
    }
};



const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [loading, setLoading] = useState(true);
    const [hasCoordinates, setHasCoordinates] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        const hasCoords = projects.some(p => p.lat && p.lng);
        setHasCoordinates(hasCoords);
    }, [projects]);

    const fetchProjects = async () => {
        try {
            const { data, error } = await supabase.from('projects').select('*');
            if (error) {
                console.error('Error fetching projects:', error);
                setProjects([]);
            } else {
                setProjects(data || []);
            }
        } catch (err) {
            console.error('Catch error:', err);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="projects" className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div className="w-full text-center md:text-left md:w-auto">
                        <h2 className="text-4xl md:text-5xl font-serif text-forest-900 mb-2 md:mb-0 text-center w-full">Proyectos</h2>
                    </div>

                    <div className="mt-6 md:mt-0 bg-beige-100 p-1 rounded-lg flex mx-auto md:mx-0">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex items-center space-x-2 px-6 py-2 rounded transition-all duration-300 ${viewMode === 'grid' ? 'bg-white shadow text-forest-900' : 'text-gray-500 hover:text-forest-900'}`}
                        >
                            <Grid size={18} />
                            <span className="font-medium text-sm tracking-wide">LISTA</span>
                        </button>
                        {hasCoordinates && (
                            <button
                                onClick={() => setViewMode('map')}
                                className={`flex items-center space-x-2 px-6 py-2 rounded transition-all duration-300 ${viewMode === 'map' ? 'bg-white shadow text-forest-900' : 'text-gray-500 hover:text-forest-900'}`}
                            >
                                <MapIcon size={18} />
                                <span className="font-medium text-sm tracking-wide">MAPA</span>
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">Cargando proyectos...</div>
                ) : (
                    <div className="min-h-[500px]">
                        {viewMode === 'grid' ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {projects.map((project, index) => (
                                    <motion.div
                                        key={project.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="group relative bg-beige-100/30 rounded-lg overflow-hidden border border-transparent hover:border-gold-500/30 transition-all duration-300 hover:shadow-xl"
                                    >
                                        <ImageCarousel
                                            images={project.images && project.images.length > 0 ? project.images : [project.image]}
                                            videos={project.videos || []}
                                            projectTitle={project.title}
                                            fallbackImage={null}
                                        />
                                        <div className="absolute top-4 left-4 bg-forest-900 text-gold-500 text-xs font-bold px-3 py-1 uppercase tracking-wider z-10">
                                            {project.type}
                                        </div>
                                        <div className="p-6">
                                            <h4 className="text-2xl font-serif text-forest-900 mb-2 truncate">{project.title}</h4>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <MapPin size={14} className="mr-1 text-gold-600" />
                                                    <span>{extractLocationFromMapLink(project.map_link) || project.address}</span>
                                                </div>
                                                {project.map_link && (
                                                    <a
                                                        href={project.map_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-2 text-forest-900 hover:text-gold-600 text-sm font-medium transition-colors"
                                                    >
                                                        <ExternalLink size={14} />
                                                        Ver en Google Maps
                                                    </a>
                                                )}
                                                <a
                                                    href={`https://wa.me/+541163789186?text=${encodeURIComponent(`Hola Maxi! Me gustaría consultar por el proyecto: ${project.title}`)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full bg-gold-500 hover:bg-gold-600 text-forest-900 font-bold py-3 px-4 rounded transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg uppercase tracking-wider text-sm"
                                                >
                                                    CONSULTAR AHORA
                                                </a>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Map projects={projects} />
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Projects;
