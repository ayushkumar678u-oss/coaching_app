import { useState, useEffect, useRef, useCallback } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

.sv-root { font-family: 'Outfit', sans-serif; background: #f0f4ff; min-height: 100vh; padding: 32px 28px; color: #1a1d2e; }
.sv-root * { box-sizing: border-box; margin: 0; padding: 0; }
.sv-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
.sv-title { font-family: 'Syne', sans-serif; font-size: clamp(20px, 2.5vw, 28px); font-weight: 800; line-height: 1; }
.sv-subtitle { font-size: 13px; color: #7b82a0; margin-top: 5px; }
.sv-layout { display: grid; grid-template-columns: 1fr 300px; gap: 24px; }
.sv-courses { display: flex; flex-direction: column; gap: 12px; background: #fff; border-radius: 12px; padding: 16px; border: 1px solid #e4e9f7; }
.sv-course-btn { padding: 12px 14px; text-align: left; border: none; border-radius: 8px; background: transparent; color: #7b82a0; font: 500 13px 'Outfit', sans-serif; cursor: pointer; transition: all 0.15s; border-left: 3px solid transparent; }
.sv-course-btn:hover { background: #f0f4ff; color: #6366f1; }
.sv-course-btn.active { background: #eef2ff; color: #6366f1; border-left-color: #6366f1; font-weight: 600; }
.sv-video-list { display: flex; flex-direction: column; gap: 16px; }
.sv-video-card { background: #fff; border: 1px solid #e4e9f7; border-radius: 12px; overflow: hidden; transition: all 0.2s; }
.sv-video-card:hover { box-shadow: 0 8px 24px rgba(99,102,241,0.1); transform: translateY(-2px); }
.sv-video-header { display: flex; gap: 16px; padding: 16px; }
.sv-video-thumb { width: 120px; height: 80px; background: linear-gradient(135deg, #ede9ff, #dbeafe); border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 32px; }
.sv-video-info { flex: 1; }
.sv-video-title { font-size: 14px; font-weight: 700; color: #1a1d2e; }
.sv-video-course { font-size: 11px; color: #7b82a0; margin-top: 4px; }
.sv-video-desc { font-size: 12px; color: #94a3b8; margin-top: 6px; line-height: 1.4; }
.sv-video-actions { padding: 12px 16px; border-top: 1px solid #e4e9f7; }
.btn-play { width: 100%; padding: 10px; border: none; border-radius: 8px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; font: 600 12px 'Outfit', sans-serif; cursor: pointer; transition: opacity 0.15s; }
.btn-play:hover { opacity: 0.9; }
.sv-empty { text-align: center; padding: 60px 20px; color: #94a3b8; }
.sv-empty-icon { font-size: 56px; margin-bottom: 12px; opacity: 0.5; }
.sv-empty-text { font-size: 15px; font-weight: 500; }
.skeleton { background: linear-gradient(90deg,#e8ecf8 25%,#f4f6fd 50%,#e8ecf8 75%); background-size: 200% 100%; animation: shimmer 1.3s infinite; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; z-index: 50; background: rgba(15,23,42,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal-container { position: relative; background: #0f0f1a; border-radius: 16px; overflow: hidden; width: 100%; max-width: 800px; box-shadow: 0 32px 80px rgba(0,0,0,0.5); }
.modal-container.fullscreen-active { max-width: 100vw; width: 100vw; height: 100vh; border-radius: 0; margin: 0; }

/* Modal top bar */
.modal-topbar { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.08); }
.modal-video-title { font-size: 13px; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 500px; }
.modal-controls { display: flex; align-items: center; gap: 8px; }

/* Control buttons */
.ctrl-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: none; border-radius: 8px; cursor: pointer; transition: all 0.15s; font-size: 15px; background: rgba(255,255,255,0.08); color: #cbd5e1; }
.ctrl-btn:hover { background: rgba(99,102,241,0.3); color: #fff; }
.ctrl-btn.active { background: rgba(99,102,241,0.5); color: #fff; }
.ctrl-btn-close { background: rgba(239,68,68,0.15); color: #f87171; }
.ctrl-btn-close:hover { background: rgba(239,68,68,0.4); color: #fff; }

/* Video wrapper */
.modal-video-wrap { position: relative; background: #000; }
.modal-video-wrap video { display: block; width: 100%; max-height: 70vh; object-fit: contain; }
.modal-container.fullscreen-active .modal-video-wrap video { max-height: calc(100vh - 52px); }

/* Fullscreen tooltip */
.fs-tooltip { position: absolute; bottom: calc(100% + 6px); right: 0; background: #1e1e30; color: #cbd5e1; font-size: 11px; padding: 4px 8px; border-radius: 6px; white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity 0.15s; }
.ctrl-btn:hover .fs-tooltip { opacity: 1; }

@media (max-width: 768px) {
  .sv-layout { grid-template-columns: 1fr; }
  .modal-video-title { max-width: 180px; }
}
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

const token = () => localStorage.getItem('token');
const authHeaders = () => ({ Authorization: `Bearer ${token()}` });
const resolveUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${BASE_URL}${url}`;
  if (url.startsWith('uploads/')) return `${BASE_URL}/${url}`;
  return `${BASE_URL}/${url}`;
};

// Fullscreen icon components
const FullscreenEnterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9"/>
    <polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/>
    <line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);

const FullscreenExitIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="8 3 3 3 3 8"/>
    <polyline points="21 8 21 3 16 3"/>
    <polyline points="3 16 3 21 8 21"/>
    <polyline points="16 21 21 21 21 16"/>
    <line x1="3" y1="3" x2="9" y2="9"/>
    <line x1="21" y1="3" x2="15" y2="9"/>
    <line x1="21" y1="21" x2="15" y2="15"/>
    <line x1="3" y1="21" x2="9" y2="15"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const StudentVideos = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const modalRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/enroll/my-courses`, { headers: authHeaders() });
        const data = await res.json();
        const courses = data.data || [];
        setEnrolledCourses(courses);
        if (courses.length > 0) setSelectedCourse(courses[0].id);
      } catch (e) {
        console.error('Failed to fetch courses:', e);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/videos/${selectedCourse}`, { headers: authHeaders() });
        const data = await res.json();
        setVideos(data.data || []);
      } catch (e) {
        console.error('Failed to fetch videos:', e);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [selectedCourse]);

  // ── Fullscreen logic ──────────────────────────────────────────────────────

  const toggleFullscreen = useCallback(async () => {
    const el = modalRef.current;
    if (!el) return;

    const fsDoc = document;
    const isCurrentlyFs =
      fsDoc.fullscreenElement ||
      fsDoc.webkitFullscreenElement ||
      fsDoc.mozFullScreenElement;

    if (!isCurrentlyFs) {
      try {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
        else if (el.mozRequestFullScreen) await el.mozRequestFullScreen();
        setIsFullscreen(true);
      } catch (err) {
        // Fallback: CSS-only fullscreen if browser API not available
        setIsFullscreen(prev => !prev);
      }
    } else {
      try {
        if (fsDoc.exitFullscreen) await fsDoc.exitFullscreen();
        else if (fsDoc.webkitExitFullscreen) await fsDoc.webkitExitFullscreen();
        else if (fsDoc.mozCancelFullScreen) await fsDoc.mozCancelFullScreen();
        setIsFullscreen(false);
      } catch (err) {
        setIsFullscreen(false);
      }
    }
  }, []);

  // Sync state when user presses Esc to exit native fullscreen
  useEffect(() => {
    const onFsChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement
      );
      setIsFullscreen(isFs);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    document.addEventListener('mozfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      document.removeEventListener('mozfullscreenchange', onFsChange);
    };
  }, []);

  // Keyboard shortcut: F key toggles fullscreen, Escape closes modal
  useEffect(() => {
    if (!playingVideo) return;
    const onKey = (e) => {
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      if (e.key === 'Escape' && !document.fullscreenElement) handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playingVideo, toggleFullscreen]);

  const handleClose = useCallback(() => {
    // Exit native fullscreen if active before closing
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsFullscreen(false);
    setPlayingVideo(null);
  }, []);

  const currentCourse = enrolledCourses.find(c => c.id === selectedCourse);

  return (
    <>
      <style>{css}</style>
      <div className="sv-root">
        {/* Header */}
        <div className="sv-header">
          <div>
            <div className="sv-title">🎬 Videos</div>
            <div className="sv-subtitle">Watch course videos</div>
          </div>
        </div>

        {enrolledCourses.length === 0 && !loading ? (
          <div className="sv-empty">
            <div className="sv-empty-icon">🎬</div>
            <div className="sv-empty-text">No enrolled courses</div>
          </div>
        ) : (
          <div className="sv-layout">
            {/* Sidebar */}
            <div style={{ order: 2 }}>
              <div className="sv-courses">
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  Your Courses
                </div>
                {enrolledCourses.map(course => (
                  <button
                    key={course.id}
                    className={`sv-course-btn ${selectedCourse === course.id ? 'active' : ''}`}
                    onClick={() => setSelectedCourse(course.id)}
                  >
                    {course.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Main content */}
            <div style={{ order: 1 }}>
              {currentCourse && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{currentCourse.title}</div>
                  <div style={{ fontSize: 12, color: '#7b82a0', marginTop: 2 }}>
                    {videos.length} video{videos.length !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
              <div className="sv-video-list">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="sv-video-card">
                      <div className="sv-video-header">
                        <div className="skeleton" style={{ width: 120, height: 80, borderRadius: 8, flexShrink: 0 }} />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div className="skeleton" style={{ height: 14, borderRadius: 6, width: '70%' }} />
                          <div className="skeleton" style={{ height: 11, borderRadius: 6, width: '40%' }} />
                          <div className="skeleton" style={{ height: 11, borderRadius: 6, width: '90%' }} />
                        </div>
                      </div>
                    </div>
                  ))
                ) : videos.length === 0 ? (
                  <div className="sv-empty">
                    <div className="sv-empty-icon">🎯</div>
                    <div className="sv-empty-text">No videos available</div>
                  </div>
                ) : (
                  videos.map((video) => (
                    <div key={video.id} className="sv-video-card">
                      <div className="sv-video-header">
                        <div className="sv-video-thumb">▶️</div>
                        <div className="sv-video-info">
                          <div className="sv-video-title">{video.title}</div>
                          <div className="sv-video-course">{currentCourse?.title}</div>
                          {video.description && (
                            <div className="sv-video-desc">{video.description.substring(0, 60)}...</div>
                          )}
                        </div>
                      </div>
                      <div className="sv-video-actions">
                        <button className="btn-play" onClick={() => setPlayingVideo(video)}>
                          ▶️ Play
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Video Modal */}
        {playingVideo && (
          <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
            <div
              ref={modalRef}
              className={`modal-container${isFullscreen ? ' fullscreen-active' : ''}`}
            >
              {/* Top bar */}
              <div className="modal-topbar">
                <div className="modal-video-title">▶ {playingVideo.title}</div>
                <div className="modal-controls">
                  {/* Fullscreen toggle */}
                  <div style={{ position: 'relative' }}>
                    <button
                      className={`ctrl-btn${isFullscreen ? ' active' : ''}`}
                      onClick={toggleFullscreen}
                      title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
                      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    >
                      {isFullscreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}
                      <span className="fs-tooltip">{isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} · F</span>
                    </button>
                  </div>
                  {/* Close */}
                  <button
                    className="ctrl-btn ctrl-btn-close"
                    onClick={handleClose}
                    title="Close (Esc)"
                    aria-label="Close video"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </div>

              {/* Video */}
              <div className="modal-video-wrap">
                <video
                  ref={videoRef}
                  src={resolveUrl(playingVideo.video_url)}
                  controls
                  autoPlay
                  onError={(e) => console.error('Video load error:', e, 'src=', resolveUrl(playingVideo.video_url))}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StudentVideos;