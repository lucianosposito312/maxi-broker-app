import { useState, useEffect } from 'react';
import { Save, Video, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { coursesService } from '../../lib/coursesService';
import { supabase } from '../../lib/supabase';

// Helper to extract YouTube embed URL from any YouTube link
const toYouTubeEmbed = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    let videoId = null;
    if (u.hostname.includes('youtu.be')) {
      videoId = u.pathname.slice(1);
    } else if (u.hostname.includes('youtube.com')) {
      videoId = u.searchParams.get('v');
      if (!videoId && u.pathname.includes('/embed/')) {
        videoId = u.pathname.split('/embed/')[1];
      }
    }
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    // Return as-is if not YouTube (could be Vimeo or direct link)
    return url;
  } catch {
    return url;
  }
};

const AcademyCourseContent = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await coursesService.getAllCourses();
        setCourses(data);
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setVideoUrl(course.video_url || '');
    setSaveStatus(null);
  };

  const handleSave = async () => {
    if (!selectedCourse) return;
    try {
      setSaving(true);
      setSaveStatus(null);

      // Use the service which already handles sanitization
      const updatedData = await coursesService.updateCourse(selectedCourse.id, {
        ...selectedCourse,
        video_url: videoUrl.trim()
      });

      if (!updatedData) throw new Error('No se recibió respuesta del servidor');

      // Update local state
      setSelectedCourse(updatedData);
      setCourses(courses.map(c => c.id === selectedCourse.id ? updatedData : c));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Error saving video URL:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const embedUrl = toYouTubeEmbed(videoUrl);
  const hasVideo = videoUrl.trim().length > 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-forest-900">Video del Curso</h2>
          <p className="text-sm text-gray-500 mt-1">Cada curso tiene un único video asociado</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Lista de cursos */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Cursos</h3>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {courses.length === 0 && (
                <div className="p-4 text-center text-gray-400 text-sm">
                  No hay cursos creados
                </div>
              )}
              {courses.map((course) => (
                <div
                  key={course.id}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedCourse?.id === course.id
                      ? 'bg-gold-50 border-l-4 border-l-gold-500'
                      : ''
                  }`}
                  onClick={() => handleSelectCourse(course)}
                >
                  <h4 className="font-medium text-gray-900 text-sm">{course.title}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <Video size={12} className={course.video_url ? 'text-green-500' : 'text-gray-300'} />
                    <span className={`text-xs ${course.video_url ? 'text-green-600' : 'text-gray-400'}`}>
                      {course.video_url ? 'Video cargado' : 'Sin video'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel de edición del video */}
        <div className="lg:col-span-3">
          {selectedCourse ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedCourse.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Configura el video de este curso</p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 font-medium"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Guardar Video
                    </>
                  )}
                </button>
              </div>

              {/* Status feedback */}
              {saveStatus === 'success' && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  <CheckCircle size={16} />
                  Video guardado correctamente
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle size={16} />
                  Error al guardar. Intenta nuevamente.
                </div>
              )}

              {/* URL Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del Video
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Pega aquí el enlace de YouTube (ej: https://www.youtube.com/watch?v=...). También puedes usar Vimeo u otro proveedor de video.
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => { setVideoUrl(e.target.value); setSaveStatus(null); }}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
                    />
                  </div>
                  {hasVideo && (
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 text-sm transition-colors"
                      title="Abrir enlace"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>

              {/* Video preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Vista Previa
                </label>
                {hasVideo && embedUrl ? (
                  <div className="aspect-video rounded-xl overflow-hidden border border-gray-200 bg-black shadow-inner">
                    <iframe
                      src={embedUrl}
                      title="Vista previa del video"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                    <Video size={48} className="text-gray-300 mb-3" />
                    <p className="text-gray-400 font-medium">Sin video configurado</p>
                    <p className="text-gray-300 text-sm mt-1">Pega una URL arriba para ver la vista previa</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video size={32} className="text-gold-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecciona un curso</h3>
              <p className="text-gray-500">Elige un curso de la lista para configurar su video</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademyCourseContent;