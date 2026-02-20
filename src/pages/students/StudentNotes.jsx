import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

  .sn-root {
    font-family: 'Outfit', sans-serif;
    background: #f0f4ff;
    min-height: 100vh;
    padding: 32px 28px;
    color: #1a1d2e;
  }
  .sn-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .sn-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 28px; flex-wrap: wrap; gap: 12px;
  }
  .sn-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(20px, 2.5vw, 28px); font-weight: 800; line-height: 1;
  }
  .sn-subtitle { font-size: 13px; color: #7b82a0; margin-top: 5px; }

  .sn-layout {
    display: grid; grid-template-columns: 1fr 300px; gap: 24px;
  }

  .sn-courses {
    display: flex; flex-direction: column; gap: 12px;
    background: #fff; border-radius: 12px; padding: 16px;
    border: 1px solid #e4e9f7;
  }
  .sn-course-btn {
    padding: 12px 14px; text-align: left; border: none; border-radius: 8px;
    background: transparent; color: #7b82a0; font: 500 13px 'Outfit', sans-serif;
    cursor: pointer; transition: all 0.15s;
    border-left: 3px solid transparent;
  }
  .sn-course-btn:hover { background: #f0f4ff; color: #6366f1; }
  .sn-course-btn.active {
    background: #eef2ff; color: #6366f1; border-left-color: #6366f1;
    font-weight: 600;
  }

  .sn-notes-list {
    display: flex; flex-direction: column; gap: 16px;
  }

  .sn-note-card {
    background: #fff; border: 1px solid #e4e9f7; border-radius: 12px;
    padding: 18px; transition: all 0.2s;
  }
  .sn-note-card:hover { box-shadow: 0 8px 24px rgba(99,102,241,0.1); transform: translateY(-2px); }

  .sn-note-title { font-size: 15px; font-weight: 700; color: #1a1d2e; }
  .sn-note-course { font-size: 11px; color: #7b82a0; margin-top: 4px; }
  .sn-note-date { font-size: 11px; color: #94a3b8; margin-top: 8px; }

  .sn-note-actions {
    display: flex; gap: 8px; margin-top: 12px;
  }
  .btn-download {
    flex: 1; padding: 10px; border: none; border-radius: 8px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
    font: 600 12px 'Outfit', sans-serif; cursor: pointer; transition: opacity 0.15s;
  }
  .btn-download:hover { opacity: 0.9; }

  .sn-empty {
    text-align: center; padding: 60px 20px; color: #94a3b8;
  }
  .sn-empty-icon { font-size: 56px; margin-bottom: 12px; opacity: 0.5; }
  .sn-empty-text { font-size: 15px; font-weight: 500; }

  .skeleton {
    background: linear-gradient(90deg,#e8ecf8 25%,#f4f6fd 50%,#e8ecf8 75%);
    background-size: 200% 100%;
    animation: shimmer 1.3s infinite;
  }

  @media (max-width: 768px) {
    .sn-layout { grid-template-columns: 1fr; }
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

const StudentNotes = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/notes/${selectedCourse}`, { headers: authHeaders() });
        const data = await res.json();
        setNotes(data.data || []);
      } catch (e) {
        console.error('Failed to fetch notes:', e);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [selectedCourse]);

  const currentCourse = enrolledCourses.find(c => c.id === selectedCourse);
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="sn-root">
      <style>{css}</style>
      <div className="sn-header">
        <div>
          <div className="sn-title">Documents</div>
          <div className="sn-subtitle">Download course notes</div>
        </div>
      </div>

      {enrolledCourses.length === 0 && !loading ? (
        <div className="sn-empty">
          <div className="sn-empty-icon">No courses</div>
          <div className="sn-empty-text">No enrolled courses</div>
        </div>
      ) : (
        <div className="sn-layout">
          <div style={{ order: 2 }}>
            <div style={{ marginBottom: 12, fontSize: 12, fontWeight: 600, color: '#7b82a0', textTransform: 'uppercase' }}>Your Courses</div>
            <div className="sn-courses">
              {enrolledCourses.map(course => (
                <button
                  key={course.id}
                  className={`sn-course-btn ${selectedCourse === course.id ? 'active' : ''}`}
                  onClick={() => setSelectedCourse(course.id)}
                >
                  {course.title}
                </button>
              ))}
            </div>
          </div>

          <div style={{ order: 1 }}>
            {currentCourse && (
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1d2e', marginBottom: 4 }}>{currentCourse.title}</h2>
                <p style={{ fontSize: 12, color: '#7b82a0' }}>{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
              </div>
            )}

            <div className="sn-notes-list">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="sn-note-card">
                    <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: '100%' }} />
                  </div>
                ))
              ) : notes.length === 0 ? (
                <div className="sn-empty">
                  <div className="sn-empty-icon">📚</div>
                  <div className="sn-empty-text">No notes available</div>
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="sn-note-card">
                    <div>
                      <div className="sn-note-title">{note.title}</div>
                      <div className="sn-note-course">{currentCourse?.title}</div>
                      <div className="sn-note-date">{formatDate(note.created_at)}</div>
                    </div>
                    <div className="sn-note-actions">
                      <a href={resolveUrl(note.file_url)} download style={{ flex: 1, textDecoration: 'none' }}>
                        <button className="btn-download">Download</button>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentNotes;
