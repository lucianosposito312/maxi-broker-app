import { motion } from 'framer-motion';
import { BookOpen, Zap, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

/* ─── Decoration icons ─────────────────────────────────────── */
const IconBook = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const IconStar = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);
const IconCap = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 10 12 5 2 10 12 15 22 10" />
    <polyline points="6 12 6 17 12 20 18 17 18 12" />
    <line x1="22" y1="10" x2="22" y2="16" />
  </svg>
);
const IconPencil = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const VIDEO_POSTER = '/assets/maxi-portrait.webp';
const VIDEO_SRC = '/assets/videoBienvenida.mp4';

const WelcomeSection = ({ userName }) => {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  // Tracks whether user explicitly muted so IntersectionObserver respects that choice
  const userMutedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Browsers require starting muted for autoplay to work.
    // We unmute immediately on first user interaction with the document.
    video.muted = true;
    video.volume = 0.6;
    video.loop = true;
    video.play().catch(() => { });

    const unlock = () => {
      if (!userMutedRef.current) {
        video.muted = false;
        setIsMuted(false);
      }
      // Remove after first interaction
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('touchstart', unlock);
    };
    document.addEventListener('click', unlock);
    document.addEventListener('keydown', unlock);
    document.addEventListener('touchstart', unlock);

    // Mute while section is off-screen, restore when back
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.muted = true;
        } else if (!userMutedRef.current) {
          video.muted = false;
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);

    return () => {
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('touchstart', unlock);
      obs.disconnect();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const ensurePlaying = () => {
      if (video.paused) {
        video.play().catch(() => {});
      }
      if (!video.loop && video.ended) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    };

    const interval = setInterval(ensurePlaying, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    userMutedRef.current = next;
    setIsMuted(next);
  };

  return (
    <div ref={sectionRef} className="mb-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-academy-blue-900 via-[#1a3d5c] to-[#12243d] text-white shadow-2xl"
      >
        {/* Background blurs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-gold-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-academy-blue-800/30 rounded-full blur-3xl" />
        </div>

        {/* ── Two-column layout: Video LEFT · Text RIGHT ── */}
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 px-6 py-8 md:px-10 md:py-10 max-w-6xl mx-auto">

          {/* ── LEFT: Video ── */}
          <div className="flex-shrink-0 w-[190px] sm:w-[220px] md:w-[250px]">
            <div className="relative">
              {/* Pulsing gold glow */}
              <motion.div
                className="absolute inset-0 bg-gold-500/25 blur-2xl rounded-3xl scale-110 pointer-events-none"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <video
                ref={videoRef}
                poster={VIDEO_POSTER}
                className="relative w-full rounded-3xl shadow-[0_0_50px_rgba(212,175,55,0.2)]"
                muted
                playsInline
                loop
                style={{ aspectRatio: '9/16', objectFit: 'cover' }}
              >
                <source src={VIDEO_SRC} type="video/mp4" />
              </video>
              {/* Mute / Unmute button */}
              <button
                onClick={toggleMute}
                className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white text-xs font-medium px-2.5 py-1.5 rounded-full transition-all"
              >
                {isMuted
                  ? <><VolumeX size={13} /> <span>Activar</span></>
                  : <><Volume2 size={13} /> <span>Silenciar</span></>}
              </button>
            </div>
          </div>

          {/* ── RIGHT: Text + Decorations ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex-1 text-center md:text-left"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-gold-400 px-4 py-1.5 rounded-full mb-5">
              <Zap size={13} className="animate-pulse" />
              <span className="text-xs font-semibold tracking-wider uppercase">Bienvenido a la Academia</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-3 text-white leading-tight">
              Hola, <span className="text-gold-500">{userName}</span>
            </h1>

            <p className="text-sm md:text-base text-gray-300 mb-7 max-w-xs leading-relaxed">
              Tu espacio de aprendizaje profesional. Todo lo que necesitás para transformar tu carrera y alcanzar tus metas.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center md:justify-start gap-5 pt-4 mb-8 border-t border-white/10">
              {[
                { icon: <BookOpen size={15} className="text-gold-400" />, bg: 'bg-gold-500/20', value: '3', label: 'Cursos' },
                { icon: <Zap size={15} className="text-green-400" />, bg: 'bg-green-500/20', value: '0%', label: 'Progreso' },
                { icon: <ChevronRight size={15} className="text-blue-400" />, bg: 'bg-blue-500/20', value: '0', label: 'Lecciones' },
              ].map(({ icon, bg, value, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>{icon}</div>
                  <div className="text-left">
                    <p className="text-lg font-bold text-white leading-none">{value}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating decorations */}
            <div className="relative h-20">
              <motion.div className="absolute left-0 top-0 text-gold-400"
                animate={{ y: [0, -8, 0], rotate: [-4, 3, -4] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                <IconBook size={36} />
              </motion.div>
              <motion.div className="absolute left-14 top-3 text-yellow-300"
                animate={{ y: [0, 7, 0], scale: [1, 1.35, 1] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}>
                <IconStar size={18} />
              </motion.div>
              <motion.div className="absolute left-24 top-0 text-white opacity-70"
                animate={{ y: [0, -6, 0], rotate: [3, -3, 3] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}>
                <IconCap size={32} />
              </motion.div>
              <motion.div className="absolute left-8 top-10 text-gold-300"
                animate={{ y: [0, 5, 0], rotate: [-8, 4, -8] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}>
                <IconPencil size={22} />
              </motion.div>
              <motion.div className="absolute left-40 top-5 text-blue-300"
                animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}>
                <IconStar size={12} />
              </motion.div>
              <motion.div className="absolute left-52 top-1 text-gold-400 opacity-60"
                animate={{ y: [0, -5, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}>
                <IconStar size={10} />
              </motion.div>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeSection;