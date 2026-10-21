import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash, Edit, MapPin, Image as ImageIcon, X, Upload, Video } from 'lucide-react';



const ProjectsManager = () => {
    const [projects, setProjects] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '', type: 'Departamento', price: '', address: '', map_link: '', lat: null, lng: null, images: [], videos: [], description: ''
    });

    useEffect(() => {
        fetchProjects();
    }, []);

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
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm('¿Está seguro de eliminar este proyecto?');
        if (!confirmed) return;

        try {
            const { error } = await supabase.from('projects').delete().eq('id', id);

            if (error) {
                console.error('Error deleting project:', error);
                alert('Error al eliminar: ' + error.message);
                return;
            }

            // Refresh the entire list from Supabase
            await fetchProjects();
        } catch (err) {
            console.error('Error:', err);
            alert('Error al eliminar el proyecto.');
        }
    };

    const handleEdit = (project) => {
        setFormData({ ...project });
        setEditingId(project.id);
        setShowForm(true);
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (formData.images.length + files.length > 3) {
            alert('Máximo 3 imágenes permitidas.');
            return;
        }

        // Upload immediately to Supabase Storage
        const uploadedUrls = [];
        
        for (const file of files) {
            try {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    alert(`El archivo ${file.name} no es una imagen válida.`);
                    continue;
                }

                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert(`El archivo ${file.name} es demasiado grande. Máximo 5MB.`);
                    continue;
                }

                // Generate unique filename
                const fileExtension = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExtension}`;

                // Upload to Supabase Storage
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('Proyectos (MG Broker)')
                    .upload(fileName, file);

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    alert(`Error subiendo ${file.name}: ${uploadError.message}`);
                    continue;
                }

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('Proyectos (MG Broker)')
                    .getPublicUrl(fileName);

                uploadedUrls.push(publicUrl);
                
            } catch (error) {
                console.error('Error processing file:', error);
                alert(`Error procesando ${file.name}: ${error.message}`);
            }
        }

        // Update form data with permanent Supabase URLs
        setFormData({ ...formData, images: [...(formData.images || []), ...uploadedUrls] });
    };

    const removeImage = (index) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData({ ...formData, images: newImages });
    };

    const handleVideoUpload = (e) => {
        const files = Array.from(e.target.files);
        if ((formData.videos || []).length + files.length > 2) {
            alert('Máximo 2 videos permitidos.');
            return;
        }

        const newVideos = files.map(file => URL.createObjectURL(file));
        setFormData({ ...formData, videos: [...(formData.videos || []), ...newVideos] });
    };

    const removeVideo = (index) => {
        const newVideos = formData.videos.filter((_, i) => i !== index);
        setFormData({ ...formData, videos: newVideos });
    };

    const extractLocationFromMapLink = (mapLink) => {
        if (!mapLink) return '';
        
        try {
            if (mapLink.includes('/place/')) {
                const placePart = mapLink.split('/place/')[1].split('/')[0];
                const location = placePart.split(',')[0].replace(/\+/g, ' ');
                return location.charAt(0).toUpperCase() + location.slice(1);
            }
            
            if (mapLink.includes('/search/')) {
                const searchPart = mapLink.split('/search/')[1].split('/')[0];
                const location = searchPart.split(',')[0].replace(/\+/g, ' ');
                return location.charAt(0).toUpperCase() + location.slice(1);
            }
            
            if (mapLink.includes('maps.app.goo.gl') || mapLink.includes('goo.gl/maps')) {
                return mapLink;
            }
            
            return '';
        } catch (e) {
            return '';
        }
    };

    const extractCoordinatesFromMapLink = async (mapLink) => {
        if (!mapLink) return { lat: null, lng: null };
        
        try {
            const coordsMatch = mapLink.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
            if (coordsMatch) {
                return { lat: parseFloat(coordsMatch[1]), lng: parseFloat(coordsMatch[2]) };
            }
            
            const address = extractLocationFromMapLink(mapLink);
            if (address && !address.includes('goo.gl')) {
                const encodedAddress = encodeURIComponent(address + ', Argentina');
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
                    { headers: { 'User-Agent': 'MaxiBrokerApp/1.0' } }
                );
                const data = await response.json();
                if (data && data.length > 0) {
                    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                }
            }
            
            return { lat: null, lng: null };
        } catch (e) {
            console.error('Error extracting coordinates:', e);
            return { lat: null, lng: null };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const extractedAddress = extractLocationFromMapLink(formData.map_link);
            const coordinates = await extractCoordinatesFromMapLink(formData.map_link);
            
            const finalProjectData = {
                ...formData,
                address: extractedAddress || formData.address,
                image: formData.images[0] || '',
                images: formData.images,
                lat: coordinates.lat,
                lng: coordinates.lng
            };

            // Save to database (Insert or Update)
            if (editingId) {
                const { error } = await supabase
                    .from('projects')
                    .update(finalProjectData)
                    .eq('id', editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('projects')
                    .insert([finalProjectData]);
                if (error) throw error;
            }

            // Clean up and close
            fetchProjects(); // Reload the list
            setShowForm(false);
            setEditingId(null);
            setFormData({ title: '', type: 'Departamento', price: '', address: '', map_link: '', lat: null, lng: null, images: [], videos: [], description: '' });
            alert("¡Proyecto guardado con éxito, Jefe!");

        } catch (err) {
            console.error("Error al guardar:", err);
            alert("Hubo un error al guardar el proyecto.");
        }
    };
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif text-gray-700">Listado de Proyectos</h3>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingId(null);
            setFormData({ title: '', type: 'Departamento', price: '', address: '', map_link: '', lat: null, lng: null, images: [], videos: [], description: '' });
                    }}
                    className="flex items-center space-x-2 bg-gold-500 text-white px-4 py-2 rounded hover:bg-gold-600 transition-colors"
                >
                    {showForm ? 'Cancelar' : <><Plus size={18} /><span>Nuevo Proyecto</span></>}
                </button>
            </div>

            {showForm && (
                <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200 animate-fade-in-down">
                    <h4 className="font-serif text-lg mb-4">{editingId ? 'Editar Proyecto' : 'Agregar Nuevo Proyecto'}</h4>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input type="text" required className="w-full border p-2 rounded" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                            <textarea className="w-full border p-2 rounded" rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select className="w-full border p-2 rounded" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                <option>Departamento</option>
                                <option>Casa</option>
                                <option>Lote</option>
                                <option>Oficina</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                            <input type="text" placeholder="USD 100,000" required className="w-full border p-2 rounded" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección (se filled automatically desde Google Maps)</label>
                            <input type="text" className="w-full border p-2 rounded bg-gray-100" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Se filled automáticamente desde el link de Google Maps" readOnly />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link de Google Maps *</label>
                            <input type="text" required placeholder="https://www.google.com/maps/place/..." className="w-full border p-2 rounded" value={formData.map_link} onChange={e => setFormData({ ...formData, map_link: e.target.value })} />
                            <p className="text-xs text-gray-500 mt-1">Copia el enlace de Google Maps - la dirección se filled automáticamente</p>
                        </div>

                        {/* Image Upload */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes (Máx 3)</label>
                            <div className="flex items-center gap-4 mb-2">
                                <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded flex items-center gap-2 text-sm text-gray-700">
                                    <Upload size={16} /> Subir Imagen
                                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                                </label>
                                <span className="text-xs text-gray-500">{formData.images?.length || 0}/3 seleccionadas</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto">
                                {formData.images?.map((img, idx) => (
                                    <div key={idx} className="relative w-24 h-24 border rounded overflow-hidden">
                                        <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl shadow"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Video Upload */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Videos (Máx 2)</label>
                            <div className="flex items-center gap-4 mb-2">
                                <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded flex items-center gap-2 text-sm text-gray-700">
                                    <Video size={16} /> Subir Video
                                    <input type="file" accept="video/*" multiple onChange={handleVideoUpload} className="hidden" />
                                </label>
                                <span className="text-xs text-gray-500">{formData.videos?.length || 0}/2 seleccionados</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto">
                                {formData.videos?.map((vid, idx) => (
                                    <div key={idx} className="relative w-40 h-24 border rounded overflow-hidden bg-black">
                                        <video src={vid} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeVideo(idx)}
                                            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl shadow z-10"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2 flex justify-end mt-4">
                            <button type="submit" className="bg-forest-900 text-white px-6 py-2 rounded hover:bg-forest-800">
                                {editingId ? 'Actualizar Proyecto' : 'Guardar Proyecto'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4">
                {projects.map((project) => (
                    <div key={project.id} className="bg-white p-4 border rounded shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                {project.image ? (
                                    <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="w-full h-full p-4 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <h4 className="font-serif font-bold text-lg text-forest-900">{project.title}</h4>
                                <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                                    <span className="bg-gray-100 px-2 rounded">{project.type}</span>
                                    <span className="text-gold-600 font-medium">{project.price}</span>
                                    <span className="flex items-center gap-1"><MapPin size={12} /> {project.address}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-2 w-full md:w-auto justify-end">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(project);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Editar"
                            >
                                <Edit size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(project.id);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded" title="Eliminar"
                            >
                                <Trash size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectsManager;
