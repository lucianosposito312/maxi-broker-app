import { forwardRef } from 'react';

const Certificate = forwardRef(({ certificate, userName, courseTitle, isPrintable = false }, ref) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div 
      ref={ref}
      className="certificate-container"
      style={{
        width: '1024px',
        height: '723px',
        position: 'relative',
        boxSizing: 'border-box',
        backgroundImage: 'url(/assets/certificate-template.jpg)',
        backgroundSize: '1024px 723px',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden'
      }}
    >
      {/* Título del curso - Bajado un 3% desde la posición anterior (6.5% total) */}
      <div style={{
        position: 'absolute',
        top: '6.5%',
        left: '0',
        width: '100%',
        textAlign: 'center',
      }}>
        <h3 style={{ 
          color: '#C5A059', 
          fontSize: '42px', 
          fontWeight: 'bold',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          textShadow: '1px 1px 2px rgba(255,255,255,0.5)'
        }}>
          {courseTitle}
        </h3>
      </div>

      {/* Nombre del alumno - Se mantiene excelente en 35.5% */}
      <div style={{
        position: 'absolute',
        top: '35.5%',
        left: '0',
        width: '100%',
        textAlign: 'center',
      }}>
        <span style={{ 
          color: '#1B365D', 
          fontSize: '48px', 
          fontWeight: '700',
          fontFamily: "'Georgia', serif",
        }}>
          {userName}
        </span>
      </div>

      {/* Fecha de Finalización - Bajado un 5% desde la posición anterior (68% total) */}
      <div style={{
        position: 'absolute',
        top: '68%',
        left: '21%',
        width: '24%',
        textAlign: 'center',
      }}>
        <p style={{ 
          color: '#1B365D', 
          fontSize: '18px',
          fontWeight: '600',
          margin: 0
        }}>
          {formatDate(certificate?.issued_at || new Date().toISOString())}
        </p>
      </div>
    </div>
  );
});

Certificate.displayName = 'Certificate';

export default Certificate;
