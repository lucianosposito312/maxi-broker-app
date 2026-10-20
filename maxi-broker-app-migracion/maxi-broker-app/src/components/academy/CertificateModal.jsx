import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Award, PartyPopper } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';
import Certificate from './Certificate';
import { certificatesService } from '../../lib/certificados';

const CertificateModal = ({ 
  isOpen, 
  onClose, 
  certificate, 
  userName, 
  courseTitle,
  onViewCertificates 
}) => {
  const certificateRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasPlayedCelebration, setHasPlayedCelebration] = useState(false);

  useEffect(() => {
    if (isOpen && !hasPlayedCelebration) {
      playCelebration();
      setHasPlayedCelebration(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setHasPlayedCelebration(false);
    }
  }, [isOpen]);

  const playCelebration = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#C5A059', '#1B365D', '#e8c97a', '#ffffff']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#C5A059', '#1B365D', '#e8c97a', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

  };

  const generatePDF = async () => {
    if (!certificateRef.current) {
      alert('Error: No se pudo cargar el certificado. Intenta de nuevo.');
      return;
    }
    
    setIsGenerating(true);
    try {
      const element = certificateRef.current;
      
      // Asegurar que el elemento esté renderizado
      if (!element.offsetHeight) {
        throw new Error('El certificado no está renderizado correctamente');
      }

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#1B365D',
        allowTaint: true,
        removeContainer: false,
        onclone: (clonedDocument) => {
          // Forzar estilos en el documento clonado
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

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`certificado-${courseTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      
      if (certificate?.id) {
        await certificatesService.incrementDownloadCount(certificate.id);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error al descargar el PDF: ${error.message || 'Intenta de nuevo.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePNG = async () => {
    if (!certificateRef.current) {
      console.error('Certificado ref no disponible');
      return;
    }
    
    setIsGenerating(true);
    try {
      const element = certificateRef.current;
      
      // Asegurar que el elemento esté renderizado
      if (!element.offsetHeight) {
        throw new Error('El certificado no está renderizado correctamente');
      }

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#1B365D',
        allowTaint: true,
        removeContainer: false,
        onclone: (clonedDocument) => {
          // Forzar estilos en el documento clonado
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
      link.download = `certificado-${courseTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      if (certificate?.id) {
        await certificatesService.incrementDownloadCount(certificate.id);
      }
    } catch (error) {
      console.error('Error generating PNG:', error);
      // Alert removido por petición del usuario
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header de celebración */}
          <div className="bg-gradient-to-r from-academy-blue-900 to-[#12243d] p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-1/4 w-32 h-32 bg-gold-500 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-flex items-center gap-2 bg-gold-500 text-white px-6 py-2 rounded-full mb-4"
              >
                <PartyPopper size={20} />
                <span className="font-bold">¡Felicitaciones!</span>
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-serif text-white">
                Has completado el curso
              </h2>
              <p className="text-gold-400 mt-2 text-lg">
                {courseTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Contenido */}
          <div className="flex flex-col items-center justify-center py-4">
            {/* Ref oculto para html2canvas (versión printable) */}
            <div className="absolute -left-[9999px] -top-[9999px]">
              <Certificate 
                ref={certificateRef}
                certificate={certificate}
                userName={userName}
                courseTitle={courseTitle}
                isPrintable={true}
              />
            </div>

            {/* Vista previa centrada - PROPORCIÓN Y LLENADO EXACTO */}
            <div className="w-full flex items-center justify-center py-8 px-4">
              <div 
                className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative"
                style={{
                  width: '100%',
                  maxWidth: '600px',
                  aspectRatio: '1024 / 723'
                }}
              >
                <div 
                  className="absolute inset-0"
                  style={{
                    width: '1024px',
                    height: '723px',
                    transform: 'scale(calc(100% / 1024))', // Escalado automático al ancho del contenedor
                    transformOrigin: 'top left',
                    imageRendering: 'crisp-edges'
                  }}
                >
                  <Certificate 
                    certificate={certificate}
                    userName={userName}
                    courseTitle={courseTitle}
                    isPrintable={false}
                  />
                </div>
              </div>
            </div>

            {/* Botón PNG solo */}
            <div className="flex justify-center w-full mt-4">
              <button
                onClick={generatePNG}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 bg-academy-blue-900 hover:bg-academy-blue-800 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 active:scale-95"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download size={20} />
                )}
                <span>Descargar Certificado (PNG)</span>
              </button>
            </div>

            {/* Botón para ver todos los certificados */}
            {onViewCertificates && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    onClose();
                    onViewCertificates();
                  }}
                  className="flex items-center justify-center gap-2 text-academy-blue-900 hover:text-gold-600 font-medium transition-colors mx-auto"
                >
                  <Award size={18} />
                  <span>Ver todos mis certificados</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CertificateModal;
