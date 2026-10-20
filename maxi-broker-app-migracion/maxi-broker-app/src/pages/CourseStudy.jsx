import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle, PlayCircle, Download, FileText } from 'lucide-react';
import { coursesService } from '../lib/coursesService';
import { certificatesService } from '../lib/certificados';
import { useUser } from '../context/UserContext';
import { usePageTracking } from '../hooks/usePageTracking';
import CertificateModal from '../components/academy/CertificateModal';
import { supabase } from '../lib/supabase';

const toEmbedUrl = (url) => {
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
    if (videoId) return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`;
    return url;
  } catch {
    return url;
  }
};

const getYouTubeVideoId = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.slice(1);
    }
    if (u.hostname.includes('youtube.com')) {
      return u.searchParams.get('v') || u.pathname.split('/embed/')[1]?.split('/')[0];
    }
    } catch {
    // Silent catch
  }
  return url || null;
};

const CourseStudy = () => {
  usePageTracking();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { academyUser } = useUser();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificate, setCertificate] = useState(null);
  
  const playerRef = useRef(null);
  const saveIntervalRef = useRef(null);
  const userId = academyUser?.id;

  const saveProgress = useCallback(async (percentage) => {
    if (!userId || !courseId) return;
    try {
      await supabase
        .from('course_video_progress')
        .upsert({
          user_id: userId,
          course_id: courseId,
          progress_percentage: Math.min(100, Math.round(percentage)),
          last_position_seconds: Math.round(currentTime),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,course_id' });
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  }, [userId, courseId, currentTime]);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        const courseData = await coursesService.getCourseById(courseId);

        if (!courseData) {
          navigate('/academia');
          return;
        }

        setCourse(courseData);

        if (userId) {
          await loadProgress(userId, courseId);
        }
      } catch (error) {
        console.error('Error loading course:', error);
        navigate('/academia');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId, navigate, userId]);

  const loadProgress = async (uid, cid) => {
    try {
      const { data } = await supabase
        .from('course_video_progress')
        .select('*')
        .eq('user_id', uid)
        .eq('course_id', cid)
        .single();

      if (data) {
        setProgressPercentage(data.progress_percentage || 0);
        setCurrentTime(data.last_position_seconds || 0);
      }

      const { data: enrollData } = await supabase
        .from('enrollments')
        .select('completed_at')
        .eq('user_id', uid)
        .eq('course_id', cid)
        .eq('payment_status', 'paid')
        .single();

      if (enrollData?.completed_at) {
        setIsCompleted(true);
        setProgressPercentage(100);
      }
    } catch {
      setIsCompleted(false);
      setProgressPercentage(0);
    }
  };

  useEffect(() => {
    if (!course?.video_url || !userId) return;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      const videoId = getYouTubeVideoId(course.video_url);
      if (!videoId) return;

      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          playsinline: 1,
          enablejsapi: 1
        },
        events: {
          onReady: (event) => {
            const duration = event.target.getDuration();
            
            if (currentTime > 0 && currentTime < duration) {
              event.target.seekTo(currentTime, true);
            }

            const interval = setInterval(() => {
              if (playerRef.current && playerRef.current.getCurrentTime) {
                const time = playerRef.current.getCurrentTime();
                const dur = playerRef.current.getDuration();
                if (dur > 0) {
                  setCurrentTime(time);
                  const pct = (time / dur) * 100;
                  setProgressPercentage(pct);
                }
              }
            }, 2000);

            saveIntervalRef.current = interval;
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              handleVideoEnded();
            }
          }
        }
      });
    };

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [course?.video_url, userId]);

  useEffect(() => {
    if (progressPercentage > 0 && userId) {
      const timeout = setTimeout(() => {
        saveProgress(progressPercentage);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [progressPercentage, saveProgress, userId]);

  const handleVideoEnded = async () => {
    if (!userId || isCompleted) return;
    
    try {
      await supabase
        .from('enrollments')
        .update({ completed_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('payment_status', 'paid');

      setIsCompleted(true);
      setProgressPercentage(100);
      await saveProgress(100);

      if (course?.has_certificate) {
        try {
          const existingCert = await certificatesService.hasCertificate(userId, courseId);
          if (!existingCert) {
            const newCert = await certificatesService.createCertificate(userId, courseId);
            setCertificate(newCert);
          } else {
            const cert = await certificatesService.getCertificateByCourse(userId, courseId);
            setCertificate(cert);
          }
          setShowCertificateModal(true);
        } catch (error) {
          console.error('Error handling certificate:', error);
        }
      }
    } catch (error) {
      console.error('Error marking complete:', error);
    }
  };

  const handleShowCertificate = async () => {
    if (!userId) return;
    try {
      const cert = await certificatesService.getCertificateByCourse(userId, courseId);
      setCertificate(cert);
      setShowCertificateModal(true);
    } catch (error) {
      console.error('Error loading certificate:', error);
    }
  };

  const handleDownloadPdf = () => {
    if (course?.pdf_url) {
      window.open(course.pdf_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1f3c] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1B365D] border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return <div className="min-h-screen bg-[#0d1f3c] text-white flex items-center justify-center">Curso no encontrado</div>;
  }

  const embedUrl = toEmbedUrl(course.video_url);

  return (
    <div className="h-screen bg-[#0d1f3c] flex flex-col overflow-hidden">
      {/* Header con efecto cinema oscuro */}
      <header className="bg-gradient-to-r from-[#0a1628] via-[#0d1f3c] to-[#0a1628] shadow-2xl flex-shrink-0 border-b border-white/5">
        <div className="max-w-[1800px] mx-auto px-3 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => navigate('/academia')}
              className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/80 hover:text-white"
            >
              <ArrowLeft size={22} />
            </button>
            <div className="w-9 md:w-10 h-9 md:h-10 bg-gradient-to-br from-[#C5A059] to-[#B08D46] rounded-lg flex items-center justify-center shadow-lg">
              <BookOpen size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm md:text-lg font-bold text-white leading-tight truncate max-w-[200px] md:max-w-none">{course.title}</h1>
              {course.level && (
                <p className="text-xs text-[#C5A059] hidden md:block">{course.level.charAt(0).toUpperCase() + course.level.slice(1)}</p>
              )}
            </div>
          </div>

          {/* Progress pill - Estilo cinema */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
              <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-[#C5A059] to-[#D4AF37] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-white text-xs font-semibold tabular-nums">{Math.round(progressPercentage)}%</span>
            </div>

            {isCompleted && (
              <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 px-3 py-1.5 rounded-full">
                <CheckCircle size={14} className="text-green-400" />
                <span className="text-xs text-green-300 font-medium">Completado</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content - Video full screen con efecto cinema */}
      <div className="flex-1 flex flex-col gap-3 md:gap-4 p-3 md:p-4 overflow-hidden">
        {/* Video area - Estilo cinema de YouTube */}
        <div className="flex-1 min-h-0 bg-gradient-to-b from-[#0a1628] to-[#0d1f3c] rounded-2xl shadow-2xl overflow-hidden relative ring-1 ring-white/10">
          {embedUrl ? (
            <div className="w-full h-full">
              <div id="youtube-player" className="w-full h-full" />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <PlayCircle size={80} className="text-white/20" />
              <p className="text-white/40 text-xl font-medium">Video no disponible aún</p>
              <p className="text-white/30 text-sm">El instructor aún no ha cargado el video de este curso</p>
            </div>
          )}
        </div>

        {/* Bottom action bar */}
        <div className="bg-gradient-to-r from-[#0a1628] to-[#0d1f3c] rounded-2xl px-5 md:px-6 py-3 flex-shrink-0 flex items-center justify-between gap-4 border border-white/10 shadow-xl">
          {/* Left side - Progress info */}
          <div className="flex items-center gap-4">
            {/* Mobile progress */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#C5A059] to-[#D4AF37] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-white text-xs font-semibold tabular-nums">{Math.round(progressPercentage)}%</span>
            </div>

            <div className="hidden md:block">
              {isCompleted ? (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle size={18} />
                  <span className="font-semibold text-sm">¡Curso completado!</span>
                </div>
              ) : course?.pdf_url ? (
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all border border-white/10"
                >
                  <Download size={16} />
                  <span>Descargar material</span>
                </button>
              ) : (
                <p className="text-sm text-white/40">Mira el video para ver tu progreso</p>
              )}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {/* PDF Download Button */}
            {course?.pdf_url && (
              <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all border border-white/10"
              >
                <FileText size={16} />
                <span className="hidden sm:inline">Descargar PDF</span>
              </button>
            )}

            {isCompleted && course?.has_certificate && (
              <button
                onClick={handleShowCertificate}
                className="flex items-center gap-2 text-[#C5A059] hover:text-[#D4AF37] font-medium text-sm transition-colors border border-[#C5A059]/30 hover:border-[#C5A059] px-4 py-2 rounded-xl"
              >
                Ver Certificado
              </button>
            )}

            {isCompleted && (
              <button
                onClick={() => navigate('/academia')}
                className="flex items-center gap-2 bg-gradient-to-r from-[#1B365D] to-[#234b7a] hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg"
              >
                <BookOpen size={16} />
                <span className="hidden sm:inline">Más cursos</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificateModal && (
        <CertificateModal
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
          certificate={certificate}
          userName={academyUser?.name}
          courseTitle={course?.title}
          onViewCertificates={() => navigate('/academia/certificados')}
        />
      )}
    </div>
  );
};

export default CourseStudy;