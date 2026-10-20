import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageCarousel = ({ images = [], videos = [], projectTitle }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    // Combine images and videos into a single media array
    const media = [
        ...images.map(url => ({ type: 'image', url })),
        ...videos.map(url => ({ type: 'video', url }))
    ];

    if (media.length === 0) return null;

    const nextMedia = () => {
        setCurrentIndex((prev) => (prev + 1) % media.length);
    };

    const prevMedia = () => {
        setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    };

    const currentItem = media[currentIndex];

    return (
        <>
            {/* Main Media with Click to Open */}
            <div
                className="relative h-64 overflow-hidden cursor-pointer group bg-black"
                onClick={() => setIsOpen(true)}
            >
                {currentItem.type === 'image' ? (
                    <img
                        src={currentItem.url}
                        alt={`${projectTitle} - Imagen ${currentIndex + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <video
                        src={currentItem.url}
                        muted
                        autoPlay
                        loop
                        className="w-full h-full object-cover"
                    />
                )}

                {/* Navigation Arrows (only if multiple items) */}
                {media.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); prevMedia(); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); nextMedia(); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
                        >
                            <ChevronRight size={20} />
                        </button>

                        {/* Counter */}
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-3 py-1 rounded-full z-10">
                            {currentIndex + 1} / {media.length}
                        </div>
                    </>
                )}
            </div>

            {/* Fullscreen Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
                        onClick={() => setIsOpen(false)}
                    >
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-white hover:text-gold-500 transition-colors z-50"
                        >
                            <X size={32} />
                        </button>

                        <div className="relative max-w-6xl w-full h-full flex items-center justify-center">
                            {currentItem.type === 'image' ? (
                                <img
                                    src={currentItem.url}
                                    alt={`${projectTitle} - Imagen ${currentIndex + 1}`}
                                    className="max-h-full max-w-full object-contain"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <video
                                    src={currentItem.url}
                                    controls
                                    autoPlay
                                    className="max-h-full max-w-full"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            )}

                            {media.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevMedia(); }}
                                        className="absolute left-4 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all z-50"
                                    >
                                        <ChevronLeft size={32} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextMedia(); }}
                                        className="absolute right-4 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all z-50"
                                    >
                                        <ChevronRight size={32} />
                                    </button>

                                    {/* Thumbnail Navigation */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg z-50 overflow-x-auto max-w-full">
                                        {media.map((item, idx) => (
                                            <button
                                                key={idx}
                                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                                                className={`w-16 h-16 flex-shrink-0 rounded overflow-hidden border-2 transition-all bg-black ${idx === currentIndex ? 'border-gold-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                                                    }`}
                                            >
                                                {item.type === 'image' ? (
                                                    <img src={item.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white">
                                                        <Video size={24} />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ImageCarousel;
