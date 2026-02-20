import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');

  .tc-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .tc-root { font-family: 'Nunito', sans-serif; width: 100%; }

  /* ── Section Header ── */
  .tc-header {
    text-align: center;
    margin-bottom: 36px;
  }
  .tc-header-tag {
    display: inline-flex; align-items: center; gap: 6px;
    background: linear-gradient(135deg, #fff0e6, #ffe0cc);
    border: 1px solid #ffcba4;
    color: #e8620a;
    font-size: 12px; font-weight: 700;
    padding: 5px 14px; border-radius: 50px;
    letter-spacing: 0.06em; text-transform: uppercase;
    margin-bottom: 14px;
  }
  .tc-header-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(26px, 4vw, 38px);
    font-weight: 800;
    color: #0f1117;
    line-height: 1.15;
    margin-bottom: 10px;
  }
  .tc-header-title span { color: #f97316; }
  .tc-header-sub {
    font-size: 15px; color: #94a3b8; font-weight: 500; max-width: 460px; margin: 0 auto;
  }

  /* ── Cards Grid ── */
  .tc-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }

  /* ── Course Card ── */
  .tc-card {
    background: #fff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0,0,0,0.03), 0 10px 24px rgba(0,0,0,0.06);
    border: 1px solid #f0f2fa;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    animation: tcFadeUp 0.5s both;
    display: flex;
    flex-direction: column;
    cursor: pointer;
  }
  .tc-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 48px rgba(249,115,22,0.13), 0 4px 12px rgba(0,0,0,0.07);
  }
  @keyframes tcFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Thumbnail ── */
  .tc-thumb {
    position: relative;
    width: 100%; height: 180px;
    background: linear-gradient(135deg, #fde8d0, #fce7f3);
    overflow: hidden;
    flex-shrink: 0;
  }
  .tc-thumb img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }
  .tc-card:hover .tc-thumb img { transform: scale(1.05); }

  .tc-thumb-placeholder {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    font-size: 52px;
    background: linear-gradient(135deg, #fff3e0, #fce4ec);
  }

  /* Rank badge */
  .tc-rank {
    position: absolute; top: 12px; left: 12px;
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 800;
    backdrop-filter: blur(8px);
    border: 2px solid rgba(255,255,255,0.6);
  }
  .tc-rank.r1 { background: rgba(245,158,11,0.9); color: #fff; }
  .tc-rank.r2 { background: rgba(148,163,184,0.9); color: #fff; }
  .tc-rank.r3 { background: rgba(217,119,6,0.9);   color: #fff; }
  .tc-rank.rn { background: rgba(255,255,255,0.85); color: #64748b; font-size: 12px; }

  /* Category pill on image */
  .tc-category-pill {
    position: absolute; bottom: 10px; right: 10px;
    background: rgba(15,17,23,0.65);
    backdrop-filter: blur(6px);
    color: #fff; font-size: 10px; font-weight: 700;
    padding: 4px 10px; border-radius: 20px;
    letter-spacing: 0.04em; text-transform: uppercase;
  }

  /* ── Card Body ── */
  .tc-body {
    padding: 18px 20px 20px;
    display: flex; flex-direction: column; flex: 1;
  }

  .tc-instructor {
    display: flex; align-items: center; gap: 7px;
    font-size: 11.5px; color: #94a3b8; font-weight: 600;
    margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.04em;
  }
  .tc-instructor-dot {
    width: 20px; height: 20px; border-radius: 50%;
    background: linear-gradient(135deg, #f97316, #fb923c);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; color: #fff; font-weight: 800; flex-shrink: 0;
  }

  .tc-title {
    font-size: 15.5px; font-weight: 800;
    color: #0f1117; line-height: 1.35;
    margin-bottom: 10px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Star rating */
  .tc-rating {
    display: flex; align-items: center; gap: 5px;
    margin-bottom: 14px;
  }
  .tc-stars { display: flex; gap: 2px; }
  .tc-star { font-size: 13px; }
  .tc-rating-val { font-size: 13px; font-weight: 700; color: #0f1117; }
  .tc-rating-count { font-size: 12px; color: #94a3b8; }

  /* Stats row */
  .tc-stats {
    display: flex; gap: 14px; margin-bottom: 16px; flex-wrap: wrap;
  }
  .tc-stat {
    display: flex; align-items: center; gap: 5px;
    font-size: 12px; color: #64748b; font-weight: 600;
  }
  .tc-stat-icon { font-size: 14px; }

  /* Price + CTA */
  .tc-footer {
    display: flex; align-items: center;
    justify-content: space-between; gap: 10px;
    margin-top: auto; padding-top: 14px;
    border-top: 1px solid #f1f4fc;
  }
  .tc-price-wrap { display: flex; flex-direction: column; }
  .tc-price {
    font-family: 'Syne', sans-serif;
    font-size: 20px; font-weight: 800; color: #0f1117; line-height: 1;
  }
  .tc-price.free { color: #16a34a; }
  .tc-price-label { font-size: 10px; color: #94a3b8; font-weight: 600; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.05em; }

  .tc-enroll-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 18px; border-radius: 12px; border: none;
    background: linear-gradient(135deg, #f97316, #fb923c);
    color: #fff; font: 700 13px 'Nunito', sans-serif;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(249,115,22,0.3);
    transition: opacity 0.15s, transform 0.15s;
    white-space: nowrap;
  }
  .tc-enroll-btn:hover { opacity: 0.9; transform: translateY(-1px); }

  /* ── Skeleton ── */
  .tc-skeleton-card {
    background: #fff; border-radius: 20px; overflow: hidden;
    border: 1px solid #f0f2fa;
    box-shadow: 0 4px 6px rgba(0,0,0,0.03);
  }
  .tc-skel {
    background: linear-gradient(90deg, #f0f2fa 25%, #f8f9fe 50%, #f0f2fa 75%);
    background-size: 200% 100%;
    animation: tcShimmer 1.4s infinite;
    border-radius: 6px;
  }
  @keyframes tcShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ── Empty ── */
  .tc-empty {
    grid-column: 1 / -1;
    text-align: center; padding: 80px 20px;
    color: #94a3b8;
  }
  .tc-empty-icon { font-size: 52px; margin-bottom: 14px; opacity: 0.4; }
  .tc-empty-text { font-size: 16px; font-weight: 700; color: #64748b; }
  .tc-empty-sub  { font-size: 13px; margin-top: 6px; }

  /* ── View All button ── */
  .tc-view-all-wrap { text-align: center; margin-top: 36px; }
  .tc-view-all {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 32px; border-radius: 14px;
    border: 2px solid #f97316;
    background: transparent;
    color: #f97316; font: 700 14px 'Nunito', sans-serif;
    cursor: pointer;
    transition: background 0.18s, color 0.18s, transform 0.15s;
  }
  .tc-view-all:hover {
    background: #f97316; color: #fff; transform: translateY(-2px);
  }

  @media (max-width: 640px) {
    .tc-grid { grid-template-columns: 1fr; }
    .tc-header-title { font-size: 26px; }
  }
`;

const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };
const RANK_CLASS  = { 1: 'r1', 2: 'r2', 3: 'r3' };

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  if (img.startsWith('/')) return `${BASE_URL}${img}`;
  return `${BASE_URL}/${img}`;
};

const renderStars = (rating = 0) => {
  const r = Math.round(rating * 2) / 2;
  return [1,2,3,4,5].map(i => (
    <span key={i} className="tc-star">
      {i <= Math.floor(r) ? '★' : i - 0.5 === r ? '⭐' : '☆'}
    </span>
  ));
};

const SkeletonCard = () => (
  <div className="tc-skeleton-card">
    <div className="tc-skel" style={{ height: 180 }} />
    <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="tc-skel" style={{ height: 12, width: '40%' }} />
      <div className="tc-skel" style={{ height: 16, width: '90%' }} />
      <div className="tc-skel" style={{ height: 14, width: '60%' }} />
      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
        <div className="tc-skel" style={{ height: 12, width: 70 }} />
        <div className="tc-skel" style={{ height: 12, width: 70 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 14, borderTop: '1px solid #f1f4fc' }}>
        <div className="tc-skel" style={{ height: 22, width: 60 }} />
        <div className="tc-skel" style={{ height: 36, width: 100, borderRadius: 12 }} />
      </div>
    </div>
  </div>
);

const TopCourses = ({ onViewAll }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}/api/courses/top?limit=5`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setCourses(json.data || json.courses || json || []);
      } catch (e) {
        console.error('TopCourses fetch error:', e);
        setError('Failed to load courses.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="tc-root">
      <style>{css}</style>

      {/* Header */}
      <div className="tc-header">
        <div className="tc-header-tag">🔥 Trending Now</div>
        <h2 className="tc-header-title">
          Our <span>Top Courses</span>
        </h2>
        <p className="tc-header-sub">
          Hand-picked by learners — the most popular and highest-rated courses on the platform.
        </p>
      </div>

      {/* Grid */}
      <div className="tc-grid">
        {loading ? (
          Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)

        ) : error ? (
          <div className="tc-empty">
            <div className="tc-empty-icon">⚠️</div>
            <div className="tc-empty-text">Couldn't load courses</div>
            <div className="tc-empty-sub">{error}</div>
          </div>

        ) : courses.length === 0 ? (
          <div className="tc-empty">
            <div className="tc-empty-icon">📚</div>
            <div className="tc-empty-text">No courses available yet</div>
            <div className="tc-empty-sub">Check back soon for new content</div>
          </div>

        ) : (
          courses.map((course, idx) => {
            const rank       = idx + 1;
            const rankClass  = RANK_CLASS[rank] || 'rn';
            const rankLabel  = RANK_MEDALS[rank] || `#${rank}`;
            const thumb      = getImageUrl(course.thumbnail || course.image || course.cover_image);
            const title      = course.title || course.name || 'Untitled Course';
            const instructor = course.instructor || course.teacher_name || course.author || '';
            const category   = course.category || course.subject || '';
            const rating     = parseFloat(course.rating || course.average_rating || 0);
            const reviews    = course.reviews_count || course.total_reviews || course.enrollments_count || 0;
            const students   = course.students_count || course.enrolled_count || course.enrollments || 0;
            const duration   = course.duration || course.total_duration || '';
            const lessons    = course.lessons_count || course.total_lessons || course.lessons || '';
            const price      = course.price ?? course.amount ?? null;
            const isFree     = price === 0 || price === '0' || price === null || course.is_free;

            return (
              <div
                className="tc-card"
                key={course.id || idx}
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                {/* Thumbnail */}
                <div className="tc-thumb">
                  {thumb
                    ? <img src={thumb} alt={title} onError={e => { e.target.style.display='none'; }} />
                    : <div className="tc-thumb-placeholder">📚</div>
                  }
                  {/* Rank badge */}
                  <div className={`tc-rank ${rankClass}`}>{rankLabel}</div>
                  {/* Category */}
                  {category && <div className="tc-category-pill">{category}</div>}
                </div>

                {/* Body */}
                <div className="tc-body">
                  {/* Instructor */}
                  {instructor && (
                    <div className="tc-instructor">
                      <div className="tc-instructor-dot">
                        {instructor.charAt(0).toUpperCase()}
                      </div>
                      {instructor}
                    </div>
                  )}

                  {/* Title */}
                  <div className="tc-title">{title}</div>

                  {/* Stars */}
                  {rating > 0 && (
                    <div className="tc-rating">
                      <div className="tc-stars" style={{ color: '#f59e0b' }}>
                        {renderStars(rating)}
                      </div>
                      <span className="tc-rating-val">{rating.toFixed(1)}</span>
                      {reviews > 0 && <span className="tc-rating-count">({reviews.toLocaleString()})</span>}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="tc-stats">
                    {students > 0 && (
                      <div className="tc-stat">
                        <span className="tc-stat-icon">👥</span>
                        {students.toLocaleString()} students
                      </div>
                    )}
                    {lessons && (
                      <div className="tc-stat">
                        <span className="tc-stat-icon">📖</span>
                        {lessons} lessons
                      </div>
                    )}
                    {duration && (
                      <div className="tc-stat">
                        <span className="tc-stat-icon">⏱️</span>
                        {duration}
                      </div>
                    )}
                  </div>

                  {/* Price + CTA */}
                  <div className="tc-footer">
                    <div className="tc-price-wrap">
                      <div className={`tc-price ${isFree ? 'free' : ''}`}>
                        {isFree ? 'Free' : `₹${parseFloat(price).toLocaleString()}`}
                      </div>
                      <div className="tc-price-label">{isFree ? 'No cost' : 'One-time'}</div>
                    </div>
                    <button className="tc-enroll-btn">
                      Enroll Now →
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View All */}
      {!loading && courses.length > 0 && (
        <div className="tc-view-all-wrap">
          <button className="tc-view-all" onClick={onViewAll}>
            View All Courses →
          </button>
        </div>
      )}
    </div>
  );
};

export default TopCourses;