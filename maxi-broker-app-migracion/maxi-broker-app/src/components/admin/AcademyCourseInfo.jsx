import { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Plus, Trash2, Edit2, X, Check, Upload, AlertTriangle, FileText, Video, Image as ImageIcon, DollarSign, Clock, BookOpen, Award } from 'lucide-react';
import { coursesService } from '../../lib/coursesService';
import { supabase } from '../../lib/supabase';

const formatPrice = (price) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0
}).format(Number(price) || 0);

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 p-2 rounded-full">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

async function performDeleteCourse(courseId, setCourses, selectedCourse, setSelectedCourse, setEditingCourse, setDeleteModal) {
  try {
    // 1. Eliminar progreso de video relacionado
    await supabase.from('course_video_progress').delete().eq('course_id', courseId);
    
    // 2. Eliminar inscripciones relacionadas
    await supabase.from('enrollments').delete().eq('course_id', courseId);

    // 3. Limpiar módulos, lecciones y progreso de lecciones (legacy support)
    try {
      const { data: modules } = await supabase.from('modules').select('id').eq('course_id', courseId);
      if (modules && modules.length > 0) {
        const moduleIds = modules.map(m => m.id);
        
        const { data: lessons } = await supabase.from('lessons').select('id').in('module_id', moduleIds);
        if (lessons && lessons.length > 0) {
          const lessonIds = lessons.map(l => l.id);
          // Borrar progreso de lecciones
          await supabase.from('lesson_progress').delete().in('lesson_id', lessonIds);
          // Borrar lecciones
          await supabase.from('lessons').delete().in('module_id', moduleIds);
        }
        // Borrar módulos
        await supabase.from('modules').delete().eq('course_id', courseId);
      }
    } catch (err) {
      console.warn('Error al limpiar datos legacy:', err);
    }

    // 4. Finalmente eliminar el curso
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    if (error) throw error;
    
    const data = await coursesService.getAllCourses();
    setCourses(data);
    
    if (selectedCourse?.id === courseId) {
      setSelectedCourse(null);
      setEditingCourse(null);
    }
    
    setDeleteModal({ isOpen: false, courseId: null });
    alert('Curso eliminado correctamente');
  } catch (error) {
    console.error('Error en eliminación:', error);
    setDeleteModal({ isOpen: false, courseId: null });
    alert('Error al eliminar curso: ' + (error.message || JSON.stringify(error)));
  }
}

const CardSection = ({ title, icon: Icon, children, className = '', colorVariant = 'blue' }) => {
  const colorClasses = {
    blue: 'from-[#1B365D] to-[#234b7a]',
    gold: 'from-[#C5A059] to-[#B08D46]',
    green: 'from-[#1A3C34] to-[#234d42]',
    purple: 'from-[#5B4B8A] to-[#7B6BAA]',
    teal: 'from-[#0D7377] to-[#14919B]'
  };
  
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className={`bg-gradient-to-r ${colorClasses[colorVariant]} px-5 py-3 flex items-center gap-2`}>
        {Icon && <Icon className="text-white" size={18} />}
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

const ToggleSwitch = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
    <div className="flex flex-col">
      <span className="text-sm font-semibold text-gray-900">{label}</span>
      {description && <span className="text-xs text-gray-500 mt-0.5">{description}</span>}
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1B365D]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B365D]"></div>
    </label>
  </div>
);

const InputField = ({ label, value, onChange, type = 'text', placeholder, icon: Icon, className = '', disabled = false }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={16} />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2.5 ${Icon ? 'pl-10' : ''} border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] transition-all disabled:bg-gray-100 disabled:text-gray-500`}
      />
    </div>
  </div>
);

const UploadSection = ({ label, value, onChange, onUpload, onRemove, accept = "image/*", uploading = false, placeholder = "Click para subir", hint = "Máximo 5MB" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    {value ? (
      <div className="relative mt-2 group">
        {accept.startsWith('image') ? (
          <img src={value} alt="Preview" className="w-full h-40 object-cover rounded-xl border border-gray-300 bg-gray-100" />
        ) : (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <FileText className="text-[#1B365D]" size={32} />
            <span className="text-sm text-gray-700 truncate">{value.split('/').pop()}</span>
          </div>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      </div>
    ) : (
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex flex-col items-center justify-center">
          {uploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B365D]"></div>
          ) : (
            <>
              <Upload className="w-8 h-8 mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">{placeholder}</p>
              <p className="text-xs text-gray-400">{hint}</p>
            </>
          )}
        </div>
        <input type="file" accept={accept} onChange={onUpload} disabled={uploading} className="hidden" />
      </label>
    )}
    {accept.startsWith('image') && (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B365D]/30 text-sm"
        placeholder="O pega una URL de imagen aquí"
      />
    )}
  </div>
);

const AcademyCourseInfo = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, courseId: null });

  const loadCourses = useCallback(async () => {
    try {
      const data = await coursesService.getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setEditingCourse(JSON.parse(JSON.stringify(course)));
    setIsCreating(false);
  };

  const handleEdit = () => {
    setEditingCourse(JSON.parse(JSON.stringify(selectedCourse)));
  };

  const handleCreate = () => {
    const newCourse = {
      title: '',
      description: '',
      short_description: '',
      price: 0,
      duration_hours: 0,
      level: 'principiante',
      thumbnail_url: '',
      video_url: '',
      pdf_url: '',
      status: 'active',
      has_certificate: false,
      is_free: false,
      learning_outcomes: []
    };
    setEditingCourse(newCourse);
    setIsCreating(true);
    setSelectedCourse(null);
  };

  const handleSave = async () => {
    if (!editingCourse) return;

    if (!editingCourse.title?.trim()) {
      alert('El título del curso es obligatorio.');
      return;
    }

    try {
      setSaving(true);

      if (isCreating) {
        const newCourse = await coursesService.createCourse(editingCourse);
        setCourses([...courses, newCourse]);
        setSelectedCourse(newCourse);
        setIsCreating(false);
      } else {
        const updatedCourse = await coursesService.updateCourse(selectedCourse.id, editingCourse);
        setCourses(courses.map(c => c.id === selectedCourse.id ? updatedCourse : c));
        setSelectedCourse(updatedCourse);
      }

      setEditingCourse(null);
    } catch (error) {
      console.error('Error saving course:', error);
      alert(`No se pudo guardar el curso. ${error.message || 'Revisa la configuración de la base de datos.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingCourse(null);
    setIsCreating(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('El archivo debe ser una imagen.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 5MB.');
      return;
    }

    try {
      setUploadingImage(true);
      const fileExtension = file.name.split('.').pop();
      const fileName = `course-thumbnails/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExtension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('Proyectos (MG Broker)')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('Proyectos (MG Broker)')
        .getPublicUrl(fileName);

      setEditingCourse({ ...editingCourse, thumbnail_url: publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('El archivo debe ser un PDF.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('El PDF es demasiado grande. Máximo 50MB.');
      return;
    }

    try {
      setUploadingPdf(true);
      const fileExtension = file.name.split('.').pop();
      const fileName = `course-pdfs/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExtension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('Proyectos (MG Broker)')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('Proyectos (MG Broker)')
        .getPublicUrl(fileName);

      setEditingCourse({ ...editingCourse, pdf_url: publicUrl });
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert('Error al subir el PDF.');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleRemoveImage = () => {
    setEditingCourse({ ...editingCourse, thumbnail_url: '' });
  };

  const handleRemovePdf = () => {
    setEditingCourse({ ...editingCourse, pdf_url: '' });
  };

  const levels = ['principiante', 'intermedio', 'avanzado'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B365D]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#1B365D]">Gestión de Cursos</h2>
          <p className="text-gray-500 text-sm mt-1">Administra los cursos de tu academia</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-[#1B365D] hover:bg-[#234b7a] text-white px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#1B365D]/20"
        >
          <Plus size={20} />
          Nuevo Curso
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Lista de cursos */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">Cursos ({courses.length})</h3>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {courses.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <BookOpen className="mx-auto mb-2 text-gray-300" size={32} />
                  <p>No hay cursos aún</p>
                </div>
              ) : (
                courses.map((course) => (
                  <div
                    key={course.id}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedCourse?.id === course.id ? 'bg-[#1B365D]/5 border-l-4 border-l-[#1B365D]' : ''}`}
                    onClick={() => handleSelectCourse(course)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{course.title}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm font-semibold text-[#1B365D]">
                            {course.is_free ? 'GRATIS' : formatPrice(course.price)}
                          </span>
                          {course.video_url && (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <Video size={12} /> Video
                            </span>
                          )}
                          {course.pdf_url && (
                            <span className="flex items-center gap-1 text-xs text-blue-600">
                              <FileText size={12} /> PDF
                            </span>
                          )}
                        </div>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded mt-2 ${course.status === 'active' ? 'bg-green-100 text-green-800' :
                          course.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                          {course.status === 'active' ? 'Activo' : course.status === 'inactive' ? 'Inactivo' : 'Borrador'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteModal({ isOpen: true, courseId: course.id });
                        }}
                        className="text-red-400 hover:text-red-600 ml-2 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Eliminar curso"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Formulario de edición / Vista previa */}
        <div className="lg:col-span-3">
          {editingCourse ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  {isCreating ? 'Nuevo Curso' : 'Editar Curso'}
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-[#1B365D] hover:bg-[#234b7a] text-white px-6 py-2.5 rounded-xl transition-colors font-medium disabled:opacity-50 shadow-lg shadow-[#1B365D]/20"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Guardar
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Información del Curso */}
              <CardSection title="Información del Curso" icon={BookOpen} colorVariant="blue">
                <div className="space-y-4">
                  <InputField
                    label="Título del Curso"
                    value={editingCourse.title}
                    onChange={(value) => setEditingCourse({ ...editingCourse, title: value })}
                    placeholder="Ej: Fundamentos de Ventas"
                  />
                  <InputField
                    label="Descripción Corta"
                    value={editingCourse.short_description}
                    onChange={(value) => setEditingCourse({ ...editingCourse, short_description: value })}
                    placeholder="Breve descripción para la tarjeta del curso"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción Completa</label>
                    <textarea
                      value={editingCourse.description}
                      onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] transition-all"
                      placeholder="Descripción detallada del curso"
                    />
                  </div>
                  <InputField
                    label="Lo que aprenderás (uno por línea)"
                    value={Array.isArray(editingCourse.learning_outcomes) ? editingCourse.learning_outcomes.join('\n') : ''}
                    onChange={(value) => setEditingCourse({ ...editingCourse, learning_outcomes: value.split('\n').filter(line => line.trim()) })}
                    placeholder="Técnicas de ventas\nGestión de clientes\nEstrategias de negociación"
                  />
                </div>
              </CardSection>

              {/* Configuración */}
              <CardSection title="Configuración" icon={Award} colorVariant="gold">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Precio (ARS)"
                      type="number"
                      value={editingCourse.price}
                      onChange={(value) => setEditingCourse({ ...editingCourse, price: value })}
                      icon={DollarSign}
                      disabled={editingCourse.is_free}
                      className={editingCourse.is_free ? 'opacity-50' : ''}
                    />
                    <InputField
                      label="Duración (horas)"
                      type="number"
                      value={editingCourse.duration_hours}
                      onChange={(value) => setEditingCourse({ ...editingCourse, duration_hours: value })}
                      icon={Clock}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Nivel</label>
                      <select
                        value={editingCourse.level}
                        onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] transition-all"
                      >
                        {levels.map(level => (
                          <option key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </CardSection>

              {/* Opciones */}
              <CardSection title="Opciones" icon={Check} colorVariant="green">
                <div className="space-y-3">
                  <ToggleSwitch
                    checked={editingCourse.is_free}
                    onChange={(checked) => setEditingCourse({ ...editingCourse, is_free: checked, price: checked ? 0 : editingCourse.price })}
                    label="Curso Gratuito"
                    description="Los estudiantes podrán acceder sin pagar"
                  />
                  <ToggleSwitch
                    checked={editingCourse.status === 'active'}
                    onChange={(checked) => setEditingCourse({ ...editingCourse, status: checked ? 'active' : 'draft' })}
                    label="Publicar curso"
                    description="Si está desactivado, el curso figurará como borrador"
                  />
                  <ToggleSwitch
                    checked={editingCourse.has_certificate}
                    onChange={(checked) => setEditingCourse({ ...editingCourse, has_certificate: checked })}
                    label="Incluir Certificado"
                    description="Los estudiantes recibirán un certificado al completar"
                  />
                </div>
              </CardSection>

              {/* Cargas de archivos */}
              <CardSection title="Cargas de Archivos" icon={FileText} colorVariant="purple">
                <div className="space-y-6">
                  {/* Video de YouTube */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Video de YouTube</label>
                    <p className="text-xs text-gray-500 mb-2">Pega el enlace del video principal del curso</p>
                    <input
                      type="text"
                      value={editingCourse.video_url || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, video_url: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D] transition-all text-sm"
                      placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/..."
                    />
                    {editingCourse.video_url && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Vista previa:</p>
                        <iframe
                          src={`https://www.youtube.com/embed/${editingCourse.video_url.replace('https://', '').replace('http://', '').replace('www.', '').replace('youtu.be/', '').replace('youtube.com/watch?v=', '').replace('youtube.com/embed/', '')}`}
                          className="w-full aspect-video rounded-lg"
                          allowFullScreen
                          title="Preview"
                        />
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <UploadSection
                      label="Imagen de Portada"
                      value={editingCourse.thumbnail_url}
                      onChange={(value) => setEditingCourse({ ...editingCourse, thumbnail_url: value })}
                      onUpload={handleImageUpload}
                      onRemove={handleRemoveImage}
                      uploading={uploadingImage}
                      placeholder="Click para subir una imagen"
                      hint="Ideal: 1600 x 900 px. Máximo 5MB"
                    />
                  </div>
                  <div className="border-t border-gray-200 pt-6">
                    <UploadSection
                      label="Material PDF Descargable"
                      value={editingCourse.pdf_url}
                      onChange={(value) => setEditingCourse({ ...editingCourse, pdf_url: value })}
                      onUpload={handlePdfUpload}
                      onRemove={handleRemovePdf}
                      accept="application/pdf"
                      uploading={uploadingPdf}
                      placeholder="Click para subir un PDF"
                      hint="Máximo 50MB"
                    />
                  </div>
                </div>
              </CardSection>
            </div>
          ) : selectedCourse ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{selectedCourse.title}</h3>
                  <div className="flex flex-wrap gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedCourse.is_free ? 'bg-green-100 text-green-800' : 'bg-[#1B365D]/10 text-[#1B365D]'}`}>
                      {selectedCourse.is_free ? 'GRATIS' : formatPrice(selectedCourse.price)}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                      {selectedCourse.duration_hours}h
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 capitalize">
                      {selectedCourse.level}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedCourse.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {selectedCourse.status === 'active' ? 'Activo' : 'Borrador'}
                    </span>
                    {selectedCourse.has_certificate && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#C5A059]/20 text-[#C5A059]">
                        Certificado Incluido
                      </span>
                    )}
                    {selectedCourse.video_url && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        Video Cargado
                      </span>
                    )}
                    {selectedCourse.pdf_url && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        PDF Disponible
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 bg-[#1B365D] hover:bg-[#234b7a] text-white px-5 py-2.5 rounded-xl transition-colors"
                >
                  <Edit2 size={18} />
                  Editar
                </button>
              </div>

              <div className="space-y-6">
                {selectedCourse.short_description && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Descripción Corta</h4>
                    <p className="text-gray-600">{selectedCourse.short_description}</p>
                  </div>
                )}

                {selectedCourse.description && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Descripción Completa</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{selectedCourse.description}</p>
                  </div>
                )}

                {selectedCourse.thumbnail_url && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Imagen del Curso</h4>
                    <img
                      src={selectedCourse.thumbnail_url}
                      alt={selectedCourse.title}
                      className="w-full max-w-md h-auto rounded-xl border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
              <div className="bg-[#1B365D]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={40} className="text-[#1B365D]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Selecciona un curso para editar</h3>
              <p className="text-gray-500">O crea un nuevo curso haciendo clic en el botón "Nuevo Curso"</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Eliminar Curso"
        message="¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer."
        onConfirm={() => {
          performDeleteCourse(
            deleteModal.courseId,
            setCourses,
            selectedCourse,
            setSelectedCourse,
            setEditingCourse,
            setDeleteModal
          );
        }}
        onCancel={() => setDeleteModal({ isOpen: false, courseId: null })}
      />
    </div>
  );
};

export default AcademyCourseInfo;