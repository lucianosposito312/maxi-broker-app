import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from '../lib/analyticsService';
import { useUser } from '../context/UserContext';

/**
 * Hook para registrar automáticamente page views
 * Se ejecuta cada vez que la ruta cambia
 * Excluye automáticamente al admin
 */
export const usePageTracking = () => {
  const location = useLocation();
  const { academyUser, userData } = useUser();

  useEffect(() => {
    // Determinar el email del usuario
    // Prioridad: academyUser (academia logueado) > userData (home logueado) > anonymous
    const email = academyUser?.email || userData?.email || null;

    // Registrar la visualización
    analyticsService.trackPageView(email, location.pathname);
  }, [location.pathname, academyUser?.email, userData?.email]);
};
