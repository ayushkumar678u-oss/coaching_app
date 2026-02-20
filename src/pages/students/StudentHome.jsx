import { useState, useEffect, useRef } from 'react';
import SliderDisplay from '../../components/students/SliderDisplay';
import apiFetch from '../../api/apiFetch';
import TopCourses from '../../components/students/TopCourses';
import CoursedCarousel from '../../components/students/Coursescarousel';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

  .sh-root {
    font-family: 'Nunito', sans-serif;
    width: 100%;
    color: #1a1d2e;
    background: #f0f2f8;
    min-height: 100vh;
  }
  .sh-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .sh-inner {
    padding: 28px 40px 60px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  /* ── Welcome Card ── */
  .sh-welcome {
    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #4c1d95 100%);
    border-radius: 20px;
    padding: 28px 32px;
    box-shadow: 0 12px 40px rgba(99,102,241,0.22);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 24px;
    margin-bottom: 36px;
    flex-wrap: wrap;
    position: relative;
    overflow: hidden;
  }
  .sh-welcome::before {
    content: '';
    position: absolute;
    top: -50px; right: -50px;
    width: 220px; height: 220px;
    background: radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%);
    pointer-events: none;
  }
  .sh-welcome-text h3 { font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 6px; }
  .sh-welcome-text p  { color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.55; }
  .sh-welcome-badge {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.13);
    border: 1px solid rgba(255,255,255,0.22);
    border-radius: 50px; padding: 10px 22px;
    font-size: 13px; font-weight: 700; color: #fff;
    white-space: nowrap; position: relative; z-index: 1;
  }

  /* ── Section header ── */
  .sh-section-header { margin-bottom: 20px; text-align: center; }
  .sh-section-title {
    font-size: 32px; font-weight: 800; color: #0f1117;
    display: flex; align-items: center; justify-content: center; gap: 10px;
  }
  .sh-section-sub { font-size: 17px; color: #9ca3af; font-weight: 500; margin-top: 6px; }

  /* ── Fan / Stack stage ── */
  .sh-fan-stage {
    position: relative;
    height: 480px;
    display: flex;
    align-items: center;
    justify-content: center;
    perspective: 1200px;
  }

  /* Navigation arrows */
  .sh-nav-btn {
    position: absolute;
    top: 50%; transform: translateY(-50%);
    z-index: 100;
    width: 44px; height: 44px;
    border-radius: 50%;
    background: #fff;
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    font-size: 18px; color: #6366f1;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .sh-nav-btn:hover { transform: translateY(-50%) scale(1.08); box-shadow: 0 6px 22px rgba(0,0,0,0.16); }
  .sh-nav-btn.left  { left: 0; }
  .sh-nav-btn.right { right: 0; }

  /* Dots indicator */
  .sh-dots-nav {
    display: flex; justify-content: center; gap: 8px;
    margin-top: 24px;
  }
  .sh-dot-nav {
    width: 8px; height: 8px; border-radius: 50%;
    background: #d1d5db; cursor: pointer;
    transition: background 0.2s, transform 0.2s;
  }
  .sh-dot-nav.active { background: #f97316; transform: scale(1.3); }

  /* ── Card wrapper (positioned absolutely in stage) ── */
  .sh-card-slot {
    position: absolute;
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: pointer;
  }

  /* ── Student Card ── */
  .sh-card {
    background: #fff;
    border-radius: 28px;
    box-shadow:
      0 4px 6px rgba(0,0,0,0.04),
      0 10px 28px rgba(0,0,0,0.09),
      0 30px 60px rgba(0,0,0,0.07);
    padding: 36px 28px 30px;
    width: 230px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    overflow: hidden;
    user-select: none;
  }

  /* Three-dot menu */
  .sh-dots-menu {
    position: absolute; top: 20px; right: 20px;
    display: flex; gap: 4px; align-items: center;
  }
  .sh-dots-menu span { width: 4px; height: 4px; border-radius: 50%; background: #c9d0e0; display: block; }

  /* Confetti */
  .sh-confetti { position: absolute; border-radius: 50%; pointer-events: none; opacity: 0.75; }

  /* ── Avatar ── */
  .sh-avatar-outer {
    position: relative; width: 130px; height: 130px;
    margin-bottom: 20px; flex-shrink: 0;
  }
  .sh-avatar-circle {
    width: 130px; height: 130px; border-radius: 50%;
    object-fit: cover; object-position: center top;
    display: block; position: relative; z-index: 1;
  }
  .sh-avatar-fallback {
    width: 130px; height: 130px; border-radius: 50%;
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    display: flex; align-items: center; justify-content: center;
    font-size: 42px; font-weight: 800; color: #fff;
    position: relative; z-index: 1;
  }
  .sh-arc {
    position: absolute; inset: -9px;
    width: calc(100% + 18px); height: calc(100% + 18px);
    z-index: 2; pointer-events: none;
  }

  /* ── Name / sub ── */
  .sh-card-name {
    font-size: 17px; font-weight: 800; color: #1a1d2e;
    text-align: center; margin-bottom: 5px; text-transform: capitalize;
    max-width: 190px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sh-card-sub {
    font-size: 12.5px; color: #a0aab8; font-weight: 500;
    text-align: center; margin-bottom: 26px; max-width: 190px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* ── Stats ── */
  .sh-card-stats { display: flex; align-items: center; justify-content: center; gap: 16px; width: 100%; }
  .sh-stat { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .sh-stat-bubble {
    width: 54px; height: 54px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; font-size: 24px;
  }
  .sh-stat-bubble.trophy { background: #fff8e1; }
  .sh-stat-bubble.chart  { background: #e3f4fd; }
  .sh-stat-val { font-size: 19px; font-weight: 800; color: #1a1d2e; line-height: 1; }
  .sh-stat-divider { width: 1.5px; height: 48px; background: #eaecf2; border-radius: 2px; flex-shrink: 0; }
  .chart-svg { width: 26px; height: 26px; }

  /* ── Skeleton ── */
  .skeleton {
    background: linear-gradient(90deg,#eef0f8 25%,#f6f7fc 50%,#eef0f8 75%);
    background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px;
  }
  @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }

  /* ── Empty ── */
  .sh-empty { text-align:center; padding:80px 20px; color:#9ca3af; background:#fff; border-radius:20px; }
  .sh-empty-icon { font-size:44px; margin-bottom:12px; opacity:0.4; }
  .sh-empty-text { font-size:14px; font-weight:700; }

  @media (max-width: 768px) {
    .sh-inner { padding: 16px 16px 40px; }
    .sh-welcome { padding: 20px; }
    .sh-fan-stage { height: 420px; }
    .sh-card { width: 200px; padding: 28px 20px 24px; }
    .sh-avatar-outer, .sh-avatar-circle, .sh-avatar-fallback { width: 100px; height: 100px; }
    .sh-avatar-fallback { font-size: 30px; }
  }
`;

const ARC = {
  1: { c1: '#f59e0b', c2: '#fde68a' },
  2: { c1: '#94a3b8', c2: '#e2e8f0' },
  3: { c1: '#f97316', c2: '#fed7aa' },
  _: { c1: '#ff6b35', c2: '#f7931e' },
};

const CONFETTI = [
  { top: '11%', left: '16%', r: 7,  col: '#ff6b35' },
  { top: '18%', left: '75%', r: 5,  col: '#38bdf8' },
  { top: '55%', left: '9%',  r: 5,  col: '#fb923c' },
  { top: '65%', left: '82%', r: 6,  col: '#f87171' },
  { top: '38%', left: '88%', r: 4,  col: '#38bdf8' },
  { top: '76%', left: '50%', r: 4,  col: '#fb923c' },
  { top: '7%',  left: '48%', r: 5,  col: '#9ca3af' },
];

const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const ArcRing = ({ rank }) => {
  const { c1, c2 } = ARC[rank] || ARC._;
  const uid = `arc${rank}`;
  const R = 74, cx = 83, cy = 83;
  const rad = d => (d * Math.PI) / 180;
  const sx = cx + R * Math.cos(rad(135)), sy = cy + R * Math.sin(rad(135));
  const ex = cx + R * Math.cos(rad(45)),  ey = cy + R * Math.sin(rad(45));
  return (
    <svg className="sh-arc" viewBox="0 0 166 166" fill="none">
      <defs>
        <linearGradient id={uid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>
      <path
        d={`M ${sx} ${sy} A ${R} ${R} 0 1 1 ${ex} ${ey}`}
        stroke={`url(#${uid})`} strokeWidth="5" strokeLinecap="round" fill="none"
      />
    </svg>
  );
};

const ChartIcon = () => (
  <svg className="chart-svg" viewBox="0 0 26 26" fill="none">
    <rect x="2"  y="14" width="5" height="10" rx="2" fill="#38bdf8" />
    <rect x="10" y="8"  width="5" height="16" rx="2" fill="#38bdf8" opacity="0.7" />
    <rect x="18" y="4"  width="5" height="20" rx="2" fill="#38bdf8" opacity="0.4" />
  </svg>
);

const StudentCard = ({ student, rank }) => {
  const score   = student.completed_courses_count ?? student.score ?? student.total_score ?? student.points ?? 0;
  const name    = student.name || student.username || 'Student';
  const sub     = student.email || student.college || student.education || 'Student';
  const avatar  = student.profile_image;
  const apiBase = import.meta.env.VITE_API_URL || '';
  const pct     = Math.min(100, score * 15);

  return (
    <div className="sh-card">
      <div className="sh-dots-menu"><span /><span /><span /></div>
      {CONFETTI.map((d, i) => (
        <div key={i} className="sh-confetti" style={{
          top: d.top, left: d.left, width: d.r * 2, height: d.r * 2, background: d.col,
        }} />
      ))}
      <div className="sh-avatar-outer">
        <ArcRing rank={rank} />
        {avatar ? (
          <img
            className="sh-avatar-circle"
            src={avatar.startsWith('http') ? avatar : `${apiBase}/${avatar.startsWith('/') ? avatar.slice(1) : avatar}`}
            alt={name}
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="sh-avatar-fallback">{getInitials(name)}</div>
        )}
      </div>
      <div className="sh-card-name">{name}</div>
      <div className="sh-card-sub">{sub}</div>
      <div className="sh-card-stats">
        <div className="sh-stat">
          <div className="sh-stat-bubble trophy">🏆</div>
          <div className="sh-stat-val">{score}</div>
        </div>
        <div className="sh-stat-divider" />
        <div className="sh-stat">
          <div className="sh-stat-bubble chart"><ChartIcon /></div>
          <div className="sh-stat-val">{pct}%</div>
        </div>
      </div>
    </div>
  );
};

const getSlotStyle = (i, activeIdx, total) => {
  const offset = i - activeIdx;
  const absOff = Math.abs(offset);

  if (absOff > 2) {
    return { display: 'none' };
  }

  if (offset === 0) {
    return {
      transform: 'translateX(0px) translateY(0px) rotate(0deg) scale(1)',
      zIndex: 10,
      opacity: 1,
      filter: 'none',
    };
  }

  const sign = offset > 0 ? 1 : -1;

  if (absOff === 1) {
    return {
      transform: `translateX(${sign * 160}px) translateY(40px) rotate(${sign * 8}deg) scale(0.88)`,
      zIndex: 5,
      opacity: 0.85,
      filter: 'brightness(0.97)',
    };
  }

  return {
    transform: `translateX(${sign * 270}px) translateY(80px) rotate(${sign * 15}deg) scale(0.76)`,
    zIndex: 2,
    opacity: 0.6,
    filter: 'brightness(0.95)',
  };
};

const StudentHome = () => {
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeIdx, setActiveIdx]     = useState(0);
  const autoRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await apiFetch('/students/top?limit=10');
        setTopStudents(data.data || data || []);
      } catch (e) {
        console.error(e);
        setTopStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (topStudents.length <= 1) return;
    autoRef.current = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % topStudents.length);
    }, 3000);
    return () => clearInterval(autoRef.current);
  }, [topStudents.length]);

  const goTo = (idx) => {
    clearInterval(autoRef.current);
    setActiveIdx((idx + topStudents.length) % topStudents.length);
    autoRef.current = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % topStudents.length);
    }, 3000);
  };

  return (
    <>
      <style>{css}</style>
      <div className="sh-root">
        <SliderDisplay />
        <div className="sh-inner">
          {/* Welcome */}
          <div className="sh-welcome">
            <div className="sh-welcome-text">
              <h3>Welcome Back! 👋</h3>
              <p>Check out the latest announcements above and explore your courses below.</p>
            </div>
            <div className="sh-welcome-badge">🎓 Keep Learning</div>
          </div>

          {/* Top Courses */}
          <div style={{ marginTop: 60 }}>
            <TopCourses onViewAll={() => window.location.href = '/student/courses'} />
          </div>

          {/* Courses Carousel */}
          <div style={{ marginTop: 60 }}>
            <CoursedCarousel onViewAll={() => window.location.href = '/student/courses'} />
          </div>

          {/* Header */}
          <div className="sh-section-header" style={{ marginTop: 60 }}>
            <div className="sh-section-title">🏆 Top Students</div>
            <div className="sh-section-sub">Students with the most completed courses</div>
          </div>

          {/* Fan stage */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 28, padding: '20px 0 32px' }}>
              {Array(3).fill(0).map((_, i) => (
                <div key={i} style={{
                  background: '#fff', borderRadius: 28, padding: '36px 28px 30px',
                  width: 230, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 12, flexShrink: 0,
                  boxShadow: '0 10px 28px rgba(0,0,0,0.07)',
                  opacity: i === 1 ? 1 : 0.5,
                  transform: i === 0 ? 'rotate(-8deg) translateY(30px)' : i === 2 ? 'rotate(8deg) translateY(30px)' : 'none',
                }}>
                  <div className="skeleton" style={{ width: 130, height: 130, borderRadius: '50%' }} />
                  <div className="skeleton" style={{ width: 110, height: 16, marginTop: 8 }} />
                  <div className="skeleton" style={{ width: 80, height: 12 }} />
                  <div style={{ display: 'flex', gap: 16, marginTop: 12, alignItems: 'center' }}>
                    <div className="skeleton" style={{ width: 54, height: 54, borderRadius: '50%' }} />
                    <div className="skeleton" style={{ width: 2, height: 48 }} />
                    <div className="skeleton" style={{ width: 54, height: 54, borderRadius: '50%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : topStudents.length === 0 ? (
            <div className="sh-empty">
              <div className="sh-empty-icon">🎯</div>
              <div className="sh-empty-text">No student data available yet</div>
            </div>
          ) : (
            <>
              <div className="sh-fan-stage">
                {topStudents.length > 1 && (
                  <button className="sh-nav-btn left" onClick={() => goTo(activeIdx - 1)}>‹</button>
                )}
                {topStudents.map((student, i) => {
                  const slotStyle = getSlotStyle(i, activeIdx, topStudents.length);
                  if (slotStyle.display === 'none') return null;
                  return (
                    <div
                      key={student.id || i}
                      className="sh-card-slot"
                      style={{
                        transform: slotStyle.transform,
                        zIndex: slotStyle.zIndex,
                        opacity: slotStyle.opacity,
                        filter: slotStyle.filter,
                        transition: 'all 0.5s cubic-bezier(0.34, 1.2, 0.64, 1)',
                      }}
                      onClick={() => goTo(i)}
                    >
                      <StudentCard student={student} rank={i + 1} />
                    </div>
                  );
                })}
                {topStudents.length > 1 && (
                  <button className="sh-nav-btn right" onClick={() => goTo(activeIdx + 1)}>›</button>
                )}
              </div>

              {topStudents.length > 1 && (
                <div className="sh-dots-nav">
                  {topStudents.map((_, i) => (
                    <div
                      key={i}
                      className={`sh-dot-nav ${i === activeIdx ? 'active' : ''}`}
                      onClick={() => goTo(i)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer */}
        <footer style={{
          background: '#1e1b4b',
          color: '#fff',
          padding: '48px 40px 28px',
          width: 'calc(100vw - 17px)',
          boxSizing: 'border-box',
          overflow: 'hidden',
          fontFamily: "'Nunito', sans-serif",
          position: 'relative',
          left: '50%',
          transform: 'translateX(-50%)',
        }}>
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, marginBottom: 40, justifyContent: 'space-between' }}>
              <div style={{ minWidth: 200, maxWidth: 280 }}>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>🎓 EduPlatform</div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                  Empowering learners with world-class courses and a thriving student community.
                </p>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Quick Links</div>
                {['Home', 'Courses', 'Leaderboard', 'My Profile'].map(link => (
                  <div key={link} style={{ marginBottom: 10 }}>
                    <a href="#" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>{link}</a>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Support</div>
                {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map(link => (
                  <div key={link} style={{ marginBottom: 10 }}>
                    <a href="#" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>{link}</a>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Contact</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>📧 support@eduplatform.com</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>📞 +1 (800) 123-4567</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>📍 New York, USA</div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                © {new Date().getFullYear()} EduPlatform. All rights reserved.
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map(s => (
                  <a key={s} href="#" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontWeight: 500 }}>{s}</a>
                ))}
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
};

export default StudentHome;