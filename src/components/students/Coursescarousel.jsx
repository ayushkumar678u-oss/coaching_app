import { useState, useEffect, useRef, useCallback } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,900&family=DM+Sans:wght@300;400;500;600&display=swap');

  .cc-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .cc-root {
    font-family: 'DM Sans', sans-serif;
    width: 100%;
    background: #f0f2f8;
  }

  /* ── Header ── */
  .cc-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    padding: 48px 5% 36px;
  }
  .cc-header-eyebrow {
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.18em; text-transform: uppercase;
    color: #aaa; margin-bottom: 10px;
  }
  .cc-header-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(26px, 3.5vw, 46px);
    font-weight: 400; color: #111; line-height: 1.1;
  }
  .cc-header-title strong {
    font-weight: 900; font-style: italic;
    color: #1a5c43; display: block;
  }
  .cc-header-sub {
    font-size: 13.5px; color: #bbb; font-weight: 400;
    margin-top: 8px; max-width: 340px; line-height: 1.65;
  }

  /* Nav arrows */
  .cc-nav-arrows { display: flex; gap: 10px; align-items: center; }
  .cc-arrow {
    width: 44px; height: 44px; border-radius: 50%;
    border: 1.5px solid #222; background: transparent;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 20px; color: #222;
    transition: all 0.22s ease; flex-shrink: 0; line-height: 1;
  }
  .cc-arrow:hover { background: #1a5c43; color: #fff; border-color: #1a5c43; }
  .cc-arrow:disabled { opacity: 0.22; cursor: not-allowed; }
  .cc-arrow:disabled:hover { background: transparent; color: #222; border-color: #222; }

  /* ── Stage: full viewport width like footer ── */
  .cc-stage {
    width: calc(100vw - 17px);
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    height: 540px;
    overflow: hidden;
    cursor: grab;
    user-select: none;
    box-sizing: border-box;
  }
  .cc-stage:active { cursor: grabbing; }

  /* ── Card: absolutely centered via left+translateX ── */
  .cc-card {
    position: absolute;
    top: 50%;
    height: 480px;
    width: 44%;
    min-width: 280px;
    max-width: 580px;
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
    will-change: transform, opacity, left;
  }

  .cc-thumb {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
  }
  .cc-thumb img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.5s ease; display: block;
  }
  .cc-card:hover .cc-thumb img { transform: scale(1.05); }
  .cc-thumb-placeholder {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    font-size: 64px;
    background: linear-gradient(135deg, #1a5c43, #2d8a65);
  }

  .cc-overlay {
    position: absolute; inset: 0; z-index: 2;
    background: linear-gradient(
      to top,
      rgba(0,0,0,0.88) 0%,
      rgba(0,0,0,0.28) 48%,
      transparent 100%
    );
    display: flex; flex-direction: column;
    justify-content: flex-end;
    padding: 20px 18px 18px;
  }

  .cc-price-badge {
    position: absolute; top: 14px; right: 14px; z-index: 3;
    padding: 5px 12px; border-radius: 30px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.03em;
    backdrop-filter: blur(10px);
  }
  .cc-price-badge.free { background: rgba(26,92,67,0.9); color: #9effd8; border: 1px solid rgba(158,255,216,0.25); }
  .cc-price-badge.paid { background: rgba(0,0,0,0.6); color: #fff; border: 1px solid rgba(255,255,255,0.18); }

  .cc-rating-badge {
    position: absolute; top: 14px; left: 14px; z-index: 3;
    display: flex; align-items: center; gap: 4px;
    background: rgba(0,0,0,0.55); backdrop-filter: blur(6px);
    color: #fff; font-size: 11.5px; font-weight: 700;
    padding: 5px 10px; border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.12);
  }
  .cc-rating-star { color: #fbbf24; }

  .cc-card-title {
    font-family: 'Playfair Display', serif;
    font-size: 16px; font-weight: 700; color: #fff;
    line-height: 1.3; margin-bottom: 7px;
    display: -webkit-box; -webkit-line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden;
  }
  .cc-meta-row {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  }
  .cc-meta-item {
    display: flex; align-items: center; gap: 4px;
    font-size: 11px; color: rgba(255,255,255,0.65); font-weight: 500;
  }
  .cc-price-val {
    font-size: 14px; font-weight: 700; color: #fff; margin-left: auto;
  }
  .cc-price-val.free { color: #9effd8; }

  /* ── Bottom ── */
  .cc-bottom {
    padding: 16px 5% 20px;
    display: flex; flex-direction: column; align-items: center; gap: 14px;
  }
  .cc-scroll-hint {
    font-size: 11.5px; color: #bbb; letter-spacing: 0.09em;
    display: flex; align-items: center; gap: 6px;
  }
  .cc-scroll-arrow { display: inline-block; animation: ccBounce 1.8s infinite; }
  @keyframes ccBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(5px)} }

  .cc-dots { display: flex; gap: 7px; }
  .cc-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #d1d5db; cursor: pointer;
    transition: background 0.2s, width 0.2s;
    border: none; padding: 0;
  }
  .cc-dot.active { background: #1a5c43; width: 22px; border-radius: 4px; }

  /* ── Skeleton ── */
  .cc-stage-skel {
    width: calc(100vw - 17px);
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    height: 540px;
    overflow: hidden;
    box-sizing: border-box;
  }
  .cc-skel-card {
    position: absolute; top: 50%; border-radius: 20px;
    height: 480px; width: 44%; min-width: 280px; max-width: 580px;
    background: linear-gradient(90deg, #f0f2f0 25%, #f8faf8 50%, #f0f2f0 75%);
    background-size: 200% 100%; animation: ccShimmer 1.4s infinite;
  }
  @keyframes ccShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ── Empty / Error ── */
  .cc-empty {
    text-align: center; padding: 60px 20px; margin: 0 5%;
    background: #f9faf9; border-radius: 16px; border: 1px solid #e5e9e7;
  }
  .cc-empty-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.4; }
  .cc-empty-text { font-size: 15px; font-weight: 700; color: #64748b; }
  .cc-empty-sub  { font-size: 13px; color: #94a3b8; margin-top: 6px; }

  @media (max-width: 640px) {
    .cc-stage { height: 420px; }
    .cc-card { width: 75%; height: 360px; }
    .cc-skel-card { width: 75%; height: 360px; }
  }
`;

const EASE = '0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

// Returns inline style for a card at `offset` positions from center
// Card width is ~44% of stage. Slots spaced at ~28% so side cards peek in.
const cardStyle = (offset, animate) => {
  const abs = Math.abs(offset);
  // Center card sits at 50%. Each slot step is 28% so ±1 cards center at 22% / 78%
  const slotPct = 28;
  const leftPct = 50 + offset * slotPct;

  let scale, opacity, rotateY, zIndex, ty;
  if (abs === 0)      { scale = 1;    opacity = 1;    rotateY = 0;                      zIndex = 10; ty = 0;  }
  else if (abs === 1) { scale = 0.82; opacity = 0.65; rotateY = offset > 0 ? -12 : 12; zIndex = 7;  ty = 30; }
  else if (abs === 2) { scale = 0.65; opacity = 0.30; rotateY = offset > 0 ? -20 : 20; zIndex = 4;  ty = 55; }
  else                { scale = 0.50; opacity = 0.10; rotateY = offset > 0 ? -26 : 26; zIndex = 1;  ty = 75; }

  const tr = `translateX(-50%) translateY(calc(-50% + ${ty}px)) perspective(1000px) rotateY(${rotateY}deg) scale(${scale})`;
  return {
    left: `${leftPct}%`,
    transform: tr,
    opacity,
    zIndex,
    transition: animate ? `left ${EASE}, transform ${EASE}, opacity ${EASE}` : 'none',
    pointerEvents: abs > 2 ? 'none' : 'auto',
  };
};

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  if (img.startsWith('/')) return `${BASE_URL}${img}`;
  return `${BASE_URL}/${img}`;
};

const CoursesCarousel = ({ onEnroll }) => {
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [current,  setCurrent]  = useState(0);
  const [animate,  setAnimate]  = useState(true);

  const autoRef    = useRef(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const stageRef   = useRef(null);

  /* ── Fetch ── */
  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}/api/courses/carousel`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setCourses(json.data || json.courses || json || []);
      } catch (e) {
        setError('Failed to load courses.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const maxIdx = Math.max(0, courses.length - 1);

  const goTo = useCallback((idx, anim = true) => {
    setAnimate(anim);
    setCurrent(Math.max(0, Math.min(idx, maxIdx)));
  }, [maxIdx]);

  /* ── Auto-play ── */
  const startAuto = useCallback(() => {
    clearInterval(autoRef.current);
    if (courses.length <= 1) return;
    autoRef.current = setInterval(() => {
      setAnimate(true);
      setCurrent(prev => prev >= maxIdx ? 0 : prev + 1);
    }, 4000);
  }, [courses.length, maxIdx]);

  useEffect(() => { startAuto(); return () => clearInterval(autoRef.current); }, [startAuto]);

  const handleNav = (dir) => { goTo(current + dir); startAuto(); };

  /* ── Drag ── */
  const onPointerDown = (e) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    clearInterval(autoRef.current);
  };
  const onPointerUp = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dx = e.clientX - dragStartX.current;
    const threshold = (stageRef.current?.offsetWidth || 400) * 0.1;
    if (dx < -threshold) goTo(current + 1);
    else if (dx > threshold) goTo(current - 1);
    startAuto();
  };

  return (
    <div className="cc-root">
      <style>{css}</style>

      {/* Header */}
      <div className="cc-header">
        <div>
          <div className="cc-header-eyebrow">Browse Courses</div>
          <h2 className="cc-header-title">
            Find your dream
            <strong>course</strong>
          </h2>
          <p className="cc-header-sub">
            You should feel inspired by what you learn — swipe to explore our library.
          </p>
        </div>
        {!loading && courses.length > 1 && (
          <div className="cc-nav-arrows">
            <button className="cc-arrow" onClick={() => handleNav(-1)} disabled={current === 0} aria-label="Previous">‹</button>
            <button className="cc-arrow" onClick={() => handleNav(1)} disabled={current >= maxIdx} aria-label="Next">›</button>
          </div>
        )}
      </div>

      {/* Stage */}
      {loading ? (
        <div className="cc-stage-skel">
          {[-1, 0, 1].map((off, i) => (
            <div key={i} className="cc-skel-card" style={cardStyle(off, false)} />
          ))}
        </div>

      ) : error ? (
        <div className="cc-empty">
          <div className="cc-empty-icon">⚠️</div>
          <div className="cc-empty-text">Couldn't load courses</div>
          <div className="cc-empty-sub">{error}</div>
        </div>

      ) : courses.length === 0 ? (
        <div className="cc-empty">
          <div className="cc-empty-icon">📚</div>
          <div className="cc-empty-text">No courses available</div>
          <div className="cc-empty-sub">Check back soon!</div>
        </div>

      ) : (
        <>
          <div
            className="cc-stage"
            ref={stageRef}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {courses.map((course, idx) => {
              const offset = idx - current;
              if (Math.abs(offset) > 3) return null;

              const thumb  = getImageUrl(course.thumbnail);
              const isFree = course.isFree === 1 || course.isFree === true || parseFloat(course.price) === 0;
              const price  = parseFloat(course.price || 0);
              const rating = parseFloat(course.rating || 0);
              const enroll = course.enroll_count || 0;

              return (
                <div
                  key={course.id || idx}
                  className="cc-card"
                  style={cardStyle(offset, animate)}
                  onClick={() => { if (offset !== 0) { goTo(idx); startAuto(); } }}
                >
                  <div className="cc-thumb">
                    {thumb
                      ? <img src={thumb} alt={course.title} onError={e => { e.target.style.display = 'none'; }} />
                      : <div className="cc-thumb-placeholder">📚</div>
                    }
                  </div>

                  <div className={`cc-price-badge ${isFree ? 'free' : 'paid'}`}>
                    {isFree ? '🆓 Free' : `₹${price.toLocaleString()}`}
                  </div>

                  {rating > 0 && (
                    <div className="cc-rating-badge">
                      <span className="cc-rating-star">★</span> {rating.toFixed(1)}
                    </div>
                  )}

                  <div className="cc-overlay">
                    <div className="cc-card-title">{course.title}</div>
                    <div className="cc-meta-row">
                      {enroll > 0 && (
                        <div className="cc-meta-item"><span>👥</span> {enroll.toLocaleString()}</div>
                      )}
                      {rating > 0 && (
                        <div className="cc-meta-item"><span className="cc-rating-star">★</span> {rating.toFixed(1)}</div>
                      )}
                      <div className={`cc-price-val ${isFree ? 'free' : ''}`}>
                        {isFree ? 'Free' : `₹${price.toLocaleString()}`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cc-bottom">
            <div className="cc-scroll-hint">
              Scroll to view gallery <span className="cc-scroll-arrow">↓</span>
            </div>
            {courses.length > 1 && (
              <div className="cc-dots">
                {courses.map((_, i) => (
                  <button
                    key={i}
                    className={`cc-dot ${i === current ? 'active' : ''}`}
                    onClick={() => { goTo(i); startAuto(); }}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CoursesCarousel;