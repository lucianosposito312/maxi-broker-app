import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, FileText, Award, ArrowLeft, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useUser } from '../context/UserContext';
import { usePageTracking } from '../hooks/usePageTracking';
import AcademyNavBar from '../components/academy/AcademyNavBar';
import AcademyMobileMenu from '../components/academy/AcademyMobileMenu';
import Certificate from '../components/academy/Certificate';
import { certificatesService } from '../lib/certificados';

const Certificates = () => {
  usePageTracking();
  const { academyUser, logoutAcademy } = useUser();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState(null);
  const certificateRefs = useRef({});

  useEffect(() => {
    if (!academyUser) {
      navigate('/academia');
      return;
    }

    const fetchCertificates = async () => {
      try {
        const data = await certificatesService.getUserCertificates(academyUser.id);
        setCertificates(data || []);
      } catch (error) {
        console.error('Error fetching certificates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [academyUser, navigate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const generatePNG = async (certificate, index) => {
    const ref = certificateRefs.current[index];
    if (!ref) {
      console.error('Certificado ref no disponible para índice:', index);
      return;
    }

    setGeneratingId(certificate.id);
    try {
      // Asegurar que el elemento esté renderizado
      if (!ref.offsetHeight) {
        throw new Error('El certificado no está renderizado correctamente');
      }

      const canvas = await html2canvas(ref, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#1B365D',
        allowTaint: true,
        removeContainer: false,
        onclone: (clonedDocument) => {
          const clonedElement = clonedDocument.querySelector('.certificate-container');
          if (clonedElement) {
            clonedElement.style.boxShadow = 'none';
            clonedElement.style.transform = 'none';
          }
        }
      });

      if (!canvas.width || !canvas.height) {
        throw new Error('Canvas no se generó correctamente');
      }

      const link = document.createElement('a');
      link.download = `certificado-${certificate.course.title.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      await certificatesService.incrementDownloadCount(certificate.id);
    } catch (error) {
      console.error('Error generating PNG:', error);
      // Alert removido por petición del usuario
    } finally {
      setGeneratingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <Loader2 className="animate-spin text-gold-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <AcademyNavBar onLogout={logoutAcademy} />
      <AcademyMobileMenu onLogout={logoutAcademy} />

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              to="/academia"
              className="inline-flex items-center gap-2 text-academy-blue-900 hover:text-gold-600 transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              <span>Volver a la Academia</span>
            </Link>

            <h1 className="text-3xl md:text-4xl font-bold text-academy-blue-900 flex items-center gap-3">
              <Award className="text-gold-500" size={36} />
              Mis Certificados
            </h1>
            <p className="text-gray-600 mt-2">
              Descarga tus certificados de finalización de curso
            </p>
          </motion.div>

          {/* Lista de certificados */}
          {certificates.length > 0 ? (
            <div className="space-y-4">
              {certificates.map((cert, index) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                    {/* Miniatura a la izquierda - Siempre a la izquierda con ratio exacto */}
                    <div 
                      className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 relative"
                      style={{
                        width: '120px',
                        height: '84.7px', // Proporción exacta 1024/723
                      }}
                    >
                      <div 
                        style={{
                          width: '1024px',
                          height: '723px',
                          transform: 'scale(0.1171875)', // 120 / 1024 = 0.1171875
                          transformOrigin: 'top left',
                          imageRendering: 'crisp-edges',
                        }}
                      >
                        <Certificate 
                          certificate={cert}
                          userName={academyUser?.name}
                          courseTitle={cert.course.title}
                          isPrintable={false}
                        />
                      </div>
                    </div>

                    {/* Info del curso en el centro */}
                    <div className="flex-grow text-center md:text-left">
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">
                        {cert.course.title}
                      </h3>
                      <div className="flex flex-col gap-1 mt-1">
                        <p className="text-sm text-gray-500">
                          Finalizado el {formatDate(cert.issued_at)}
                        </p>
                        <p className="text-xs text-gold-600 font-medium tracking-wide">
                          ID: {cert.certificate_number}
                        </p>
                      </div>
                    </div>

                    {/* Botón de descarga a la derecha */}
                    <div className="flex-shrink-0 w-full md:w-auto">
                      <button
                        onClick={() => generatePNG(cert, index)}
                        disabled={generatingId === cert.id}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-academy-blue-900 hover:bg-academy-blue-800 text-white py-3 md:py-2.5 px-5 rounded-lg font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {generatingId === cert.id ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <Download size={18} />
                        )}
                        <span>Descargar PNG</span>
                      </button>
                    </div>
                  </div>

                  {/* Ref oculto para html2canvas (versión final) */}
                  <div className="absolute -left-[9999px] -top-[9999px]">
                    <div ref={el => certificateRefs.current[index] = el}>
                      <Certificate 
                        certificate={cert}
                        userName={academyUser?.name}
                        courseTitle={cert.course.title}
                        isPrintable={true}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No tienes certificados aún
              </h3>
              <p className="text-gray-600 mb-6">
                Completa un curso para obtener tu certificado
              </p>
              <Link
                to="/academia"
                className="inline-flex items-center gap-2 bg-academy-blue-900 hover:bg-academy-blue-800 text-white py-3 px-6 rounded-lg transition-colors"
              >
                Ver cursos disponibles
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Certificates;
