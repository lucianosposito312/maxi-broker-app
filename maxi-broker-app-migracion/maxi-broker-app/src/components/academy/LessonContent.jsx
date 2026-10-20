import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Download } from 'lucide-react';

const LessonContent = ({ lesson }) => {
  const [showFullContent, setShowFullContent] = useState(false);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {lesson.title}
        </h2>
        
        {lesson.description && (
          <p className="text-gray-600 mb-4">
            {lesson.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Duración: {lesson.duration_minutes || 0} minutos</span>
          <span>•</span>
          <span>Actualizado recientemente</span>
        </div>
      </div>

      {/* Contenido de la lección */}
      {lesson.content && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={20} className="text-gold-500" />
              Material de Estudio
            </h3>
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="text-gold-500 hover:text-gold-600 flex items-center gap-1"
            >
              {showFullContent ? (
                <>
                  <ChevronUp size={20} />
                  <span>Mostrar menos</span>
                </>
              ) : (
                <>
                  <ChevronDown size={20} />
                  <span>Mostrar más</span>
                </>
              )}
            </button>
          </div>

          <div className={`bg-gray-50 rounded-lg p-6 ${showFullContent ? '' : 'max-h-32 overflow-hidden'}`}>
            <div className="prose max-w-none text-gray-700">
              {lesson.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recursos adicionales */}
      <div className="bg-gold-50 border border-gold-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Recursos Adicionales</h4>
        <div className="space-y-2">
          <button className="flex items-center gap-2 text-gold-600 hover:text-gold-700">
            <Download size={16} />
            <span className="text-sm">Descargar PDF de resumen</span>
          </button>
          <button className="flex items-center gap-2 text-gold-600 hover:text-gold-700">
            <Download size={16} />
            <span className="text-sm">Ejercicios prácticos</span>
          </button>
        </div>
      </div>

      {/* Acciones */}
      <div className="mt-6 flex justify-between items-center">
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Lección anterior
        </button>
        <button className="px-6 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors">
          Siguiente lección
        </button>
      </div>
    </div>
  );
};

export default LessonContent;