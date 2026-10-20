import YouTube from 'react-youtube';

const VideoPlayer = ({ lesson, onComplete }) => {
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      ecver: 2
    }
  };

  const onEnd = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const extractVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const videoId = lesson?.video_url ? extractVideoId(lesson.video_url) : null;

  if (!videoId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="text-center text-slate-400 p-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-700 flex items-center justify-center">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-xl font-medium mb-2">Video no disponible</p>
          <p className="text-slate-500">Esta lección no contiene video</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
      <YouTube
        videoId={videoId}
        opts={opts}
        onEnd={onEnd}
        className="w-full h-full"
        containerClassName="w-full h-full"
      />
    </div>
  );
};

export default VideoPlayer;