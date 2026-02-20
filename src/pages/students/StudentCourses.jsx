import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

  .sc-root {
    font-family: 'Outfit', sans-serif;
    background: #f0f4ff;
    min-height: 100vh;
    padding: 40px 40px;
    color: #1a1d2e;
  }
  .sc-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .sc-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 28px; flex-wrap: wrap; gap: 12px;
  }
  .sc-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(20px, 2.5vw, 28px); font-weight: 800; line-height: 1;
  }
  .sc-subtitle { font-size: 13px; color: #7b82a0; margin-top: 5px; }

  .sc-tabs {
    display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 2px solid #e2e8f0;
    padding-bottom: 0;
  }
  .sc-tab {
    padding: 12px 16px; border: none; background: none;
    color: #7b82a0; font: 600 13px 'Outfit', sans-serif;
    cursor: pointer; border-bottom: 3px solid transparent;
    transition: all 0.2s;
  }
  .sc-tab.active { color: #6366f1; border-bottom-color: #6366f1; }
  .sc-tab:hover { color: #6366f1; }

  .sc-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 24px;
  }

  .sc-card {
    background: #fff; border: 1px solid #e4e9f7; border-radius: 18px;
    overflow: hidden; transition: transform 0.2s, box-shadow 0.2s;
    animation: fadeUp 0.4s both;
    min-height: 320px;
  }
  .sc-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(99,102,241,0.12); }

  /* Completed card styling */
  .sc-card.completed {
    border-color: #a7f3d0;
    box-shadow: 0 4px 16px rgba(5,150,105,0.08);
  }

  .sc-card-img {
    width: 100%; height: 220px; background: linear-gradient(135deg, #ede9ff, #dbeafe);
    display: flex; align-items: center; justify-content: center; font-size: 56px;
    position: relative;
  }

  /* Completed ribbon */
  .sc-completed-ribbon {
    position: absolute; top: 12px; left: 12px;
    background: linear-gradient(135deg, #059669, #10b981);
    color: #fff; font: 700 11px 'Outfit', sans-serif;
    padding: 5px 12px; border-radius: 20px;
    display: flex; align-items: center; gap: 5px;
    box-shadow: 0 4px 10px rgba(5,150,105,0.3);
  }

  .sc-card-body { padding: 22px; }
  .sc-card-title { font-size: 18px; font-weight: 700; color: #1a1d2e; }
  .sc-card-desc { font-size: 14px; color: #7b82a0; margin-top: 8px; line-height: 1.6; }

  .sc-card-meta {
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    font-size: 13px; color: #94a3b8; margin: 14px 0;
  }

  .sc-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
  }
  .sc-badge.enrolled { background: #d1fae5; color: #059669; }
  .sc-badge.free { background: #dbeafe; color: #1e40af; }
  .sc-badge.completed-badge { background: #d1fae5; color: #059669; }

  .sc-card-actions {
    display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;
  }

  .btn-enroll {
    flex: 1; padding: 12px 0; border: none; border-radius: 12px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff; font: 600 12px 'Outfit', sans-serif;
    cursor: pointer; transition: opacity 0.15s, transform 0.1s;
    min-width: 80px;
  }
  .btn-enroll:hover { opacity: 0.9; transform: scale(1.02); }
  .btn-enroll:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .btn-view {
    flex: 1; padding: 10px 0; border: 1.5px solid #e2e8f0; border-radius: 10px;
    background: #fff; color: #6366f1; font: 600 12px 'Outfit', sans-serif;
    cursor: pointer; transition: background 0.15s;
    min-width: 80px;
  }
  .btn-view:hover { background: #eef2ff; }

  /* Complete button */
  .btn-complete {
    flex: 1; padding: 10px 0; border: none; border-radius: 10px;
    background: linear-gradient(135deg, #059669, #10b981);
    color: #fff; font: 600 12px 'Outfit', sans-serif;
    cursor: pointer; transition: opacity 0.15s, transform 0.1s;
    display: flex; align-items: center; justify-content: center; gap: 5px;
    min-width: 100px;
  }
  .btn-complete:hover { opacity: 0.9; transform: scale(1.02); }
  .btn-complete:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* Already completed button (disabled state) */
  .btn-completed-done {
    flex: 1; padding: 10px 0; border: 1.5px solid #a7f3d0; border-radius: 10px;
    background: #ecfdf5; color: #059669; font: 600 12px 'Outfit', sans-serif;
    cursor: default; display: flex; align-items: center; justify-content: center; gap: 5px;
    min-width: 100px;
  }

  .sc-empty {
    grid-column: 1/-1; text-align: center; padding: 60px 20px;
    color: #94a3b8;
  }
  .sc-empty-icon { font-size: 56px; margin-bottom: 12px; opacity: 0.5; }
  .sc-empty-text { font-size: 15px; font-weight: 500; }

  .skeleton {
    background: linear-gradient(90deg,#e8ecf8 25%,#f4f6fd 50%,#e8ecf8 75%);
    background-size: 200% 100%;
    animation: shimmer 1.3s infinite;
  }

  .modal-overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(15,23,42,0.5); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
  }
  .modal-box {
    background: #fff; border-radius: 22px; width: 100%; max-width: 600px;
    max-height: 90vh; overflow-y: auto;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18);
  }

  .modal-header { padding: 24px; border-bottom: 1px solid #f1f5f9; position: relative; }
  .modal-title { font-size: 18px; font-weight: 700; color: #0f172a; }
  .modal-sub { font-size: 12px; color: #94a3b8; margin-top: 4px; }

  .modal-body { padding: 24px; }
  .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
  .detail-label { font-size: 12px; color: #7b82a0; font-weight: 600; }
  .detail-value { font-size: 14px; color: #1a1d2e; font-weight: 500; }

  .close-btn {
    position: absolute; top: 16px; right: 16px;
    width: 32px; height: 32px; border-radius: 50%; border: none;
    background: #fee2e2; color: #dc2626; font-size: 18px;
    cursor: pointer;
  }

  /* Confirm modal */
  .confirm-modal {
    background: #fff; border-radius: 20px; width: 100%; max-width: 420px;
    padding: 32px 28px; text-align: center;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18);
  }
  .confirm-icon { font-size: 48px; margin-bottom: 14px; }
  .confirm-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: #1a1d2e; margin-bottom: 8px; }
  .confirm-text { font-size: 13px; color: #7b82a0; line-height: 1.6; margin-bottom: 24px; }
  .confirm-actions { display: flex; gap: 10px; }
  .confirm-cancel {
    flex: 1; padding: 12px; border: 1.5px solid #e2e8f0; border-radius: 12px;
    background: #fff; color: #7b82a0; font: 600 13px 'Outfit', sans-serif; cursor: pointer;
  }
  .confirm-ok {
    flex: 1; padding: 12px; border: none; border-radius: 12px;
    background: linear-gradient(135deg, #059669, #10b981);
    color: #fff; font: 600 13px 'Outfit', sans-serif; cursor: pointer;
    transition: opacity 0.15s;
  }
  .confirm-ok:hover { opacity: 0.9; }
  .confirm-ok:disabled { opacity: 0.6; cursor: not-allowed; }

  .toast {
    position: fixed; bottom: 20px; right: 20px; z-index: 100;
    padding: 12px 20px; border-radius: 12px;
    font: 600 13px 'Outfit', sans-serif;
    display: flex; align-items: center; gap: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
  .toast.success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
  .toast.error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

let toastTimer;
const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = useCallback((type, text) => {
    clearTimeout(toastTimer);
    setToast({ type, text });
    toastTimer = setTimeout(() => setToast(null), 3000);
  }, []);
  return [toast, show];
};

const token = () => localStorage.getItem('token');
const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

const getThumbnailUrl = (filename) => {
  if (!filename) return null;
  if (filename.startsWith('http')) return filename;
  if (filename.startsWith('/')) return `${BASE_URL}${filename}`;
  if (filename.startsWith('uploads/')) return `${BASE_URL}/${filename}`;
  return `${BASE_URL}/uploads/${filename}`;
};

const StudentCourses = () => {
  const [tab, setTab] = useState('all');
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState({});
  const [completing, setCompleting] = useState({});
  const [completedIds, setCompletedIds] = useState(new Set());
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [confirmComplete, setConfirmComplete] = useState(null); // course to confirm
  const [toast, showToast] = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const allRes = await fetch(`${BASE_URL}/api/courses`, { headers: authHeaders() });
        const allData = await allRes.json();
        setCourses(allData.data || []);

        const enrolledRes = await fetch(`${BASE_URL}/api/enroll/my-courses`, { headers: authHeaders() });
        const enrolledData = await enrolledRes.json();
        const enrolled = enrolledData.data || [];
        setEnrolledCourses(enrolled);

        // Pre-populate completed set from API data if field exists
        const alreadyCompleted = new Set(
          enrolled.filter(c => c.completed || c.is_completed || c.status === 'completed').map(c => c.id)
        );
        setCompletedIds(alreadyCompleted);
      } catch (e) {
        console.error('Failed to fetch courses:', e);
        showToast('error', 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showToast]);

  const handleEnroll = (courseId) => {
    // Find course details
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    // Redirect to payment page with course details
    navigate(`/payment?courseId=${courseId}&amount=${course.price}&courseName=${encodeURIComponent(course.title)}`);
  };

  const handleComplete = async (courseId) => {
    setCompleting(p => ({ ...p, [courseId]: true }));
    setConfirmComplete(null);
    try {
      const res = await fetch(`${BASE_URL}/api/enroll/${courseId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not mark as complete');
      setCompletedIds(prev => new Set([...prev, courseId]));
      showToast('success', '🎉 Course marked as completed!');
    } catch (e) {
      showToast('error', e.message);
    } finally {
      setCompleting(p => ({ ...p, [courseId]: false }));
    }
  };

  const isEnrolled = (courseId) => enrolledCourses.some(c => c.id === courseId);
  const isCompleted = (courseId) => completedIds.has(courseId);
  const displayCourses = tab === 'enrolled' ? enrolledCourses : courses;

  return (
    <div className="sc-root">
      <style>{css}</style>

      <div className="sc-header">
        <div>
          <div className="sc-title">📚 Courses</div>
          <div className="sc-subtitle">{displayCourses.length} course{displayCourses.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      <div className="sc-tabs">
        <button className={`sc-tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
          All Courses
        </button>
        <button className={`sc-tab ${tab === 'enrolled' ? 'active' : ''}`} onClick={() => setTab('enrolled')}>
          My Courses {enrolledCourses.length > 0 && `(${enrolledCourses.length})`}
        </button>
      </div>

      <div className="sc-grid">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e4e9f7', borderRadius: 18, overflow: 'hidden' }}>
              <div className="skeleton" style={{ height: 180 }} />
              <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="skeleton" style={{ height: 16, width: '70%' }} />
                <div className="skeleton" style={{ height: 12, width: '100%' }} />
                <div className="skeleton" style={{ height: 12, width: '80%' }} />
              </div>
            </div>
          ))
        ) : displayCourses.length === 0 ? (
          <div className="sc-empty">
            <div className="sc-empty-icon">📚</div>
            <div className="sc-empty-text">
              {tab === 'enrolled' ? 'No enrollments yet' : 'No courses available'}
            </div>
          </div>
        ) : (
          displayCourses.map((course, i) => {
            const enrolled = isEnrolled(course.id);
            const completed = isCompleted(course.id);
            const isFreeFlag = course.isFree == 1 || parseFloat(course.price || 0) === 0;

            return (
              <div
                key={course.id}
                className={`sc-card${completed ? ' completed' : ''}`}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="sc-card-img">
                  {completed && (
                    <div className="sc-completed-ribbon">✓ Completed</div>
                  )}
                  {course.thumbnail ? (
                    <img src={getThumbnailUrl(course.thumbnail)} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : '📖'}
                </div>

                <div className="sc-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
                    <div className="sc-card-title">{course.title}</div>
                    {enrolled && !completed && <span className="sc-badge enrolled">✓ Enrolled</span>}
                    {completed && <span className="sc-badge completed-badge">🎓 Done</span>}
                    {isFreeFlag && !enrolled && <span className="sc-badge free">Free</span>}
                  </div>

                  {course.description && (
                    <div className="sc-card-desc">{course.description.substring(0, 100)}...</div>
                  )}

                  <div className="sc-card-meta">
                    {parseFloat(course.price || 0) > 0 && (
                      <span>💰 Rs {parseFloat(course.price).toFixed(2)}</span>
                    )}
                    <span>👥 {course.enrollment_count || 0} students</span>
                  </div>

                  <div className="sc-card-actions">
                    {/* ── My Courses tab: show Complete button ── */}
                    {tab === 'enrolled' ? (
                      <>
                        <button className="btn-view" onClick={() => setSelectedCourse(course)}>
                          View Details
                        </button>
                        {completed ? (
                          <div className="btn-completed-done">
                            🎓 Completed
                          </div>
                        ) : (
                          <button
                            className="btn-complete"
                            onClick={() => setConfirmComplete(course)}
                            disabled={completing[course.id]}
                          >
                            {completing[course.id] ? '⏳' : '✅ Complete'}
                          </button>
                        )}
                      </>
                    ) : enrolled ? (
                      /* All tab + enrolled */
                      <button className="btn-view" onClick={() => setSelectedCourse(course)}>
                        View Details
                      </button>
                    ) : (
                      /* All tab + not enrolled */
                      <>
                        <button className="btn-view" onClick={() => setSelectedCourse(course)}>
                          Learn More
                        </button>
                        <button
                          className="btn-enroll"
                          onClick={() => {
                            if (isFreeFlag) {
                              handleEnroll(course.id);
                            } else {
                              navigate(`/student/payments?amount=${encodeURIComponent(course.price)}&courseId=${course.id}`);
                            }
                          }}
                          disabled={enrolling[course.id]}
                        >
                          {enrolling[course.id] ? '⏳' : 'Enroll'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Course Details Modal ── */}
      {selectedCourse && (
        <div className="modal-overlay" onClick={() => setSelectedCourse(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <button className="close-btn" onClick={() => setSelectedCourse(null)}>×</button>
              <div className="modal-title">{selectedCourse.title}</div>
              <div className="modal-sub">Course Details</div>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className="detail-value">
                  {isCompleted(selectedCourse.id) ? '🎓 Completed' : isEnrolled(selectedCourse.id) ? '✅ Enrolled' : '❌ Not Enrolled'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Type</span>
                <span className="detail-value">{selectedCourse.isFree ? 'Free' : 'Paid'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Students</span>
                <span className="detail-value">{selectedCourse.enrollment_count || 0}</span>
              </div>
              {selectedCourse.description && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                  <div className="detail-label">Description</div>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginTop: 8 }}>
                    {selectedCourse.description}
                  </p>
                </div>
              )}
              {/* Complete button inside modal too */}
              {isEnrolled(selectedCourse.id) && !isCompleted(selectedCourse.id) && (
                <button
                  className="btn-complete"
                  style={{ width: '100%', marginTop: 20 }}
                  onClick={() => { setSelectedCourse(null); setConfirmComplete(selectedCourse); }}
                >
                  ✅ Mark as Complete
                </button>
              )}
              {!isEnrolled(selectedCourse.id) && (
                <button
                  className="btn-enroll"
                  onClick={() => { handleEnroll(selectedCourse.id); setSelectedCourse(null); }}
                  style={{ width: '100%', marginTop: 20 }}
                  disabled={enrolling[selectedCourse.id]}
                >
                  {enrolling[selectedCourse.id] ? '⏳ Enrolling...' : 'Enroll Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Complete Modal ── */}
      {confirmComplete && (
        <div className="modal-overlay" onClick={() => setConfirmComplete(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">🎓</div>
            <div className="confirm-title">Mark as Completed?</div>
            <div className="confirm-text">
              Are you sure you want to mark <strong>"{confirmComplete.title}"</strong> as completed?
              This action cannot be undone.
            </div>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setConfirmComplete(null)}>
                Cancel
              </button>
              <button
                className="confirm-ok"
                onClick={() => handleComplete(confirmComplete.id)}
                disabled={completing[confirmComplete.id]}
              >
                {completing[confirmComplete.id] ? '⏳ Saving...' : '✅ Yes, Complete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? '✓' : '⚠️'} {toast.text}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;