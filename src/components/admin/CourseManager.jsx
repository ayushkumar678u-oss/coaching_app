import { useState, useEffect, useRef } from 'react';
import VideoManager from './VideoManager';
import NotesManager from './NotesManager';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ── CSS (unchanged but classes prefixed with cm-) ── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

  .cm-root {
    font-family: 'Outfit', sans-serif;
    background: #f0f4ff;
    min-height: 100vh;
    padding: 32px 28px;
    color: #1a1d2e;
  }
  .cm-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .cm-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 28px; flex-wrap: wrap; gap: 12px;
  }
  .cm-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(20px, 2.5vw, 28px); font-weight: 800; line-height: 1;
  }
  .cm-subtitle { font-size: 13px; color: #7b82a0; margin-top: 5px; }

  .btn-primary {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 20px; border-radius: 12px; border: none;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff; font: 600 13px 'Outfit', sans-serif;
    cursor: pointer; box-shadow: 0 4px 14px rgba(99,102,241,0.3);
    transition: opacity 0.15s, transform 0.15s;
  }
  .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
  .btn-primary:active { transform: scale(0.97); }

  .cm-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  .cm-card {
    background: #fff; border: 1px solid #e4e9f7; border-radius: 18px;
    overflow: hidden; transition: transform 0.2s, box-shadow 0.2s;
    animation: fadeUp 0.4s both;
  }
  .cm-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(99,102,241,0.12); }

  .cm-card-img {
    width: 100%; height: 180px; object-fit: cover;
    background: linear-gradient(135deg, #ede9ff, #dbeafe);
    display: flex; align-items: center; justify-content: center;
    font-size: 48px; color: #c7d2fe;
  }
  .cm-card-img img { width: 100%; height: 100%; object-fit: cover; }

  .cm-card-body { padding: 16px 18px 18px; }
  .cm-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 8px; }

  .cm-card-title { font-size: 15px; font-weight: 700; color: #1a1d2e; line-height: 1.3; }
  .cm-card-desc  { font-size: 12.5px; color: #7b82a0; line-height: 1.5; margin-bottom: 10px; }

  .cm-card-meta {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    font-size: 11px; color: #94a3b8; margin-bottom: 14px;
  }
  .cm-card-meta span { display: flex; align-items: center; gap: 4px; }

  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 600; flex-shrink: 0;
  }
  .badge.free   { background: #d1fae5; color: #059669; }
  .badge.paid   { background: #fee2e2; color: #dc2626; }

  .cm-card-actions {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .btn-icon {
    flex: 1 1 auto;
    padding: 8px 0;
    border-radius: 10px;
    border: none;
    font: 600 12px 'Outfit', sans-serif;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    transition: opacity 0.15s, transform 0.1s;
    min-width: 70px;
  }
  .btn-icon:hover { opacity: 0.85; transform: scale(1.03); }
  .btn-edit   { background: #eef2ff; color: #6366f1; }
  .btn-delete { background: #fee2e2; color: #dc2626; }
  .btn-students { background: #e0f2fe; color: #0284c7; }

  .cm-empty {
    grid-column: 1/-1; text-align: center;
    padding: 80px 0; color: #94a3b8;
  }
  .cm-empty-icon { font-size: 56px; margin-bottom: 14px; opacity: 0.5; }
  .cm-empty-text { font-size: 15px; font-weight: 500; }
  .cm-empty-sub  { font-size: 13px; margin-top: 5px; }

  .skeleton {
    background: linear-gradient(90deg,#e8ecf8 25%,#f4f6fd 50%,#e8ecf8 75%);
    background-size: 200% 100%; border-radius: 8px;
    animation: shimmer 1.3s infinite;
  }

  .modal-overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(15,23,42,0.5); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px; animation: fadeIn 0.18s ease;
  }
  .modal-box {
    background: #fff; border-radius: 22px; width: 100%; max-width: 520px;
    max-height: 92vh; overflow-y: auto;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18);
    animation: slideUp 0.22s ease;
  }
  .modal-header {
    padding: 20px 24px 0; display: flex; align-items: flex-start;
    justify-content: space-between; gap: 12px;
    position: sticky; top: 0; background: #fff; z-index: 1;
    padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;
  }
  .modal-title { font-size: 17px; font-weight: 700; color: #0f172a; }
  .modal-sub   { font-size: 12px; color: #94a3b8; margin-top: 2px; }

  .close-btn {
    width: 32px; height: 32px; border-radius: 50%;
    border: 1px solid #e2e8f0; background: #f8fafc;
    cursor: pointer; font-size: 18px; color: #64748b;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: background 0.15s;
  }
  .close-btn:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; }

  .form-body { padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 16px; }

  .field-label {
    display: block; font-size: 10px; font-weight: 700; color: #64748b;
    text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 5px;
  }
  .field-label span { color: #f43f5e; margin-left: 2px; }

  .field-input {
    width: 100%; padding: 10px 13px;
    border: 1.5px solid #e2e8f0; border-radius: 10px;
    font: 400 13px 'Outfit', sans-serif; color: #0f172a;
    background: #fafafa; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .field-input:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }

  .img-upload-zone {
    border: 2px dashed #c7d2fe; border-radius: 12px;
    padding: 20px; text-align: center;
    cursor: pointer; transition: border-color 0.15s, background 0.15s;
    background: #fafbff;
  }
  .img-upload-zone:hover { border-color: #6366f1; background: #eef2ff; }
  .img-upload-zone.has-img { border-style: solid; border-color: #6366f1; padding: 6px; }

  .img-preview {
    width: 100%; height: 140px; object-fit: cover;
    border-radius: 8px;
  }

  .toggle-wrap { display: flex; align-items: center; justify-content: space-between; }
  .toggle-label-text { font-size: 13px; font-weight: 500; color: #1a1d2e; }
  .toggle-sub { font-size: 11px; color: #94a3b8; margin-top: 1px; }

  .toggle {
    position: relative; width: 44px; height: 24px; flex-shrink: 0;
  }
  .toggle input { opacity: 0; width: 0; height: 0; }
  .toggle-slider {
    position: absolute; inset: 0; border-radius: 24px;
    background: #e2e8f0; cursor: pointer; transition: background 0.2s;
  }
  .toggle-slider::before {
    content: ''; position: absolute;
    width: 18px; height: 18px; border-radius: 50%;
    background: #fff; left: 3px; top: 3px;
    transition: transform 0.2s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  }
  .toggle input:checked + .toggle-slider { background: #6366f1; }
  .toggle input:checked + .toggle-slider::before { transform: translateX(20px); }

  .form-footer { display: flex; gap: 10px; padding-top: 4px; }
  .btn-cancel {
    flex: 1; padding: 11px 0; border: 1.5px solid #e2e8f0; border-radius: 10px;
    background: #fff; font: 600 13px 'Outfit', sans-serif; color: #64748b;
    cursor: pointer; transition: background 0.15s;
  }
  .btn-cancel:hover { background: #f8fafc; }
  .btn-save {
    flex: 2; padding: 11px 0; border: none; border-radius: 10px;
    font: 700 13px 'Outfit', sans-serif; color: #fff; cursor: pointer;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
    transition: opacity 0.15s;
  }
  .btn-save:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }

  .toast {
    position: fixed; bottom: 28px; right: 28px; z-index: 100;
    padding: 12px 20px; border-radius: 12px;
    font: 600 13px 'Outfit', sans-serif;
    display: flex; align-items: center; gap: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    animation: slideInRight 0.3s ease;
  }
  .toast.success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
  .toast.error   { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

  .del-modal {
    background: #fff; border-radius: 20px; width: 100%; max-width: 380px;
    padding: 28px 26px; text-align: center;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18);
    animation: slideUp 0.22s ease;
  }
  .del-icon { font-size: 44px; margin-bottom: 12px; }
  .del-title { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
  .del-desc  { font-size: 13px; color: #64748b; line-height: 1.5; }
  .del-actions { display: flex; gap: 10px; margin-top: 22px; }
  .btn-del-confirm {
    flex: 1; padding: 11px 0; border: none; border-radius: 10px;
    background: #ef4444; color: #fff; font: 700 13px 'Outfit', sans-serif;
    cursor: pointer; transition: opacity 0.15s;
  }
  .btn-del-confirm:hover { opacity: 0.88; }
  .btn-del-cancel {
    flex: 1; padding: 11px 0; border: 1.5px solid #e2e8f0; border-radius: 10px;
    background: #fff; color: #64748b; font: 600 13px 'Outfit', sans-serif; cursor: pointer;
  }

  /* Students modal specific */
  .students-list {
    padding: 16px 24px 24px;
    max-height: 400px;
    overflow-y: auto;
  }
  .student-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #f1f5f9;
  }
  .student-item:last-child { border-bottom: none; }
  .student-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: #6366f1; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 14px;
    flex-shrink: 0;
  }
  .student-info {
    flex: 1;
  }
  .student-name { font-size: 14px; font-weight: 600; color: #0f172a; }
  .student-email { font-size: 12px; color: #64748b; }

  .loading-students {
    text-align: center; padding: 40px 0; color: #94a3b8;
  }

  @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
  @keyframes shimmer   { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes slideUp   { from{opacity:0;transform:translateY(22px) scale(0.97)} to{opacity:1;transform:none} }
  @keyframes slideInRight { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:none} }
`;

/* ── Helpers ── */
const token = () => localStorage.getItem('token');
const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  // If backend returns a leading-slash path like '/uploads/..', preserve it.
  // Otherwise ensure there's a slash between BASE_URL and the path.
  return url.startsWith('/') ? `${BASE_URL}${url}` : `${BASE_URL}/${url}`;
};

const getFileUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? `${BASE_URL}${url}` : `${BASE_URL}/${url}`;
};


/* ── Toast ── */
let toastTimer;
const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = (type, text) => {
    clearTimeout(toastTimer);
    setToast({ type, text });
    toastTimer = setTimeout(() => setToast(null), 3000);
  };
  return [toast, show];
};

/* ── Skeleton Card ── */
const SkeletonCard = () => (
  <div style={{ background: '#fff', border: '1px solid #e4e9f7', borderRadius: 18, overflow: 'hidden' }}>
    <div className="skeleton" style={{ height: 180 }} />
    <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="skeleton" style={{ height: 16, width: '70%' }} />
      <div className="skeleton" style={{ height: 12, width: '90%' }} />
      <div className="skeleton" style={{ height: 12, width: '55%' }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <div className="skeleton" style={{ height: 34, flex: 1, borderRadius: 10 }} />
        <div className="skeleton" style={{ height: 34, flex: 1, borderRadius: 10 }} />
      </div>
    </div>
  </div>
);

/* ── Main Component: CourseManager ── */
const CourseManager = () => {
  const [courses,    setCourses]   = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [modal,      setModal]     = useState(null); // null | 'create' | 'edit'
  const [editData,   setEditData]  = useState(null);
  const [delTarget,  setDelTarget] = useState(null);
  const [saving,     setSaving]    = useState(false);
  const [deleting,   setDeleting]  = useState(false);
  const [toast,      showToast]    = useToast();
  const fileRef = useRef(null);

  // Students modal state
  const [studentsModal, setStudentsModal] = useState(null); // null or course object
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  // Course details (videos & notes) modal state
  const [detailsModal, setDetailsModal] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  // Manager view state
  const [managerView, setManagerView] = useState(null); // null | 'videos' | 'notes'
  const [selectedCourse, setSelectedCourse] = useState(null);

  /* Form state – matching API keys: title, description, price, isFree, thumbnail */
  const EMPTY_FORM = {
    title: '',
    description: '',
    price: 0,
    isFree: false,
    thumbnail: null
  };
  const [form, setForm] = useState(EMPTY_FORM);
  const [preview, setPreview] = useState(null);

  /* ── Fetch all courses from /api/courses/carousel ── */
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/courses`, { headers: authHeaders() });
      const json = await res.json();
      // Response structure: { success, message, data: [...] }
      setCourses(json.data ?? []);
    } catch (e) {
      showToast('error', 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  /* ── Open Create Modal ── */
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setPreview(null);
    setModal('create');
  };

  /* ── Open Edit Modal ── */
  const openEdit = (course) => {
    setForm({
      title:        course.title || '',
      description:  course.description || '',
      price:        parseFloat(course.price) || 0,
      isFree:       course.isFree == 1 || course.isFree === true,
      thumbnail:    null,
    });
    setPreview(getImageUrl(course.thumbnail));
    setEditData(course);
    setModal('edit');
  };

  /* ── Handle Image Change ── */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(p => ({ ...p, thumbnail: file }));
    setPreview(URL.createObjectURL(file));
  };

  /* ── Submit (Create / Update) ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title',        form.title);
      fd.append('description',  form.description);
      fd.append('price',        form.price);
      fd.append('isFree',       form.isFree ? '1' : '0'); // send as 1/0 or boolean? adjust if needed
      if (form.thumbnail) fd.append('thumbnail', form.thumbnail);

      const isEdit = modal === 'edit';
      const url    = isEdit ? `${BASE_URL}/api/courses/${editData.id}` : `${BASE_URL}/api/courses`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers: authHeaders(), body: fd });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Request failed'); }

      showToast('success', isEdit ? 'Course updated!' : 'Course created!');
      setModal(null);
      fetchCourses();
    } catch (err) {
      showToast('error', err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete Course ── */
  const handleDelete = async () => {
    if (!delTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/courses/${delTarget.id}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Delete failed');
      showToast('success', 'Course deleted');
      setDelTarget(null);
      fetchCourses();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setDeleting(false);
    }
  };

  /* ── Fetch enrolled students for a course ── */
  const fetchStudents = async (courseId) => {
    setLoadingStudents(true);
    try {
      const url = `${BASE_URL}/api/courses/${courseId}/students`;
      console.debug('fetchStudents: requesting', url);
      const res = await fetch(url, { headers: authHeaders() });
      console.debug('fetchStudents: status', res.status, res.statusText);
      const json = await res.json().catch(() => null);
      console.debug('fetchStudents: body', json);
      if (!res.ok) {
        const errMsg = (json && json.message) || `Request failed (${res.status})`;
        if (res.status === 401 || res.status === 403) {
          throw new Error('Unauthorized — this endpoint requires an admin token');
        }
        throw new Error(errMsg);
      }
      const studentsData = json.data ?? json.students ?? json ?? [];
      // Normalize and resolve profile image URLs
      const normalized = (studentsData || []).map(s => ({
        ...s,
        profile_image_url: getImageUrl(s.profile_image),
      }));
      setStudents(normalized);
    } catch (e) {
      console.error('fetchStudents error', e);
      showToast('error', e.message || 'Failed to load students');
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const openStudentsModal = (course) => {
    setStudentsModal(course);
    fetchStudents(course.id);
  };

  const fetchCourseDetails = async (courseId) => {
    setLoadingDetails(true);
    try {
      const url = `${BASE_URL}/api/courses/${courseId}`;
      console.debug('fetchCourseDetails: requesting', url);
      const res = await fetch(url, { headers: authHeaders() });
      console.debug('fetchCourseDetails: status', res.status, res.statusText);
      const json = await res.json().catch(() => null);
      console.debug('fetchCourseDetails: body', json);
      if (!res.ok) {
        const errMsg = (json && json.message) || `Request failed (${res.status})`;
        throw new Error(errMsg);
      }
      const data = json.data ?? json ?? {};
      // Resolve video and note URLs
      data.videos = (data.videos || []).map(v => ({
        ...v,
        video_url_resolved: v.video_url ? (v.video_url.startsWith('http') ? v.video_url : getFileUrl(v.video_url)) : null,
      }));
      data.notes = (data.notes || []).map(n => ({
        ...n,
        file_url_resolved: n.file_url ? (n.file_url.startsWith('http') ? n.file_url : getFileUrl(n.file_url)) : null,
      }));
      setCourseDetails(data);
      setSelectedVideo(data.videos && data.videos.length ? data.videos[0] : null);
    } catch (e) {
      console.error('fetchCourseDetails error', e);
      showToast('error', e.message || 'Failed to load course details');
      setCourseDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const openDetailsModal = (course) => {
    setDetailsModal(course);
    fetchCourseDetails(course.id);
  };

  /* ── Render ── */
  // Show manager views instead of course manager when active
  if (managerView === 'videos' && selectedCourse) {
    return <VideoManager courseId={selectedCourse.id} courseName={selectedCourse.title} onClose={() => setManagerView(null)} />;
  }
  if (managerView === 'notes' && selectedCourse) {
    return <NotesManager courseId={selectedCourse.id} courseName={selectedCourse.title} onClose={() => setManagerView(null)} />;
  }

  return (
    <div className="cm-root">
      <style>{css}</style>

      {/* Header */}
      <div className="cm-header">
        <div>
          <div className="cm-title">📚 Course Manager</div>
          <div className="cm-subtitle">
            {loading ? 'Loading…' : `${courses.length} course${courses.length !== 1 ? 's' : ''} total`}
          </div>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          ＋ Add Course
        </button>
      </div>

      {/* Grid */}
      <div className="cm-grid">
        {loading ? (
          Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : courses.length === 0 ? (
          <div className="cm-empty">
            <div className="cm-empty-icon">📚</div>
            <div className="cm-empty-text">No courses yet</div>
            <div className="cm-empty-sub">Click "Add Course" to create your first one</div>
          </div>
        ) : (
          courses.map((c, i) => (
            <div className="cm-card" key={c.id} style={{ animationDelay: `${i * 0.06}s` }}>
              {/* Image */}
              <div className="cm-card-img">
                {c.thumbnail
                  ? <img src={getImageUrl(c.thumbnail)} alt={c.title} />
                  : <span>📚</span>
                }
              </div>

              {/* Body */}
              <div className="cm-card-body">
                <div className="cm-card-top">
                  <div className="cm-card-title">{c.title}</div>
                  <span className={`badge ${c.isFree == 1 || c.isFree === true ? 'free' : 'paid'}`}>
                    {c.isFree == 1 || c.isFree === true ? '🆓 Free' : '💰 Paid'}
                  </span>
                </div>

                {c.description && (
                  <div className="cm-card-desc" style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {c.description}
                  </div>
                )}

                <div className="cm-card-meta">
                  {c.price > 0 && <span>💰 ${parseFloat(c.price).toFixed(2)}</span>}
                  {c.rating && <span>⭐ {c.rating}</span>}
                  {c.enroll_count !== undefined && <span>👥 {c.enroll_count} enrolled</span>}
                </div>

                <div className="cm-card-actions">
                  <button className="btn-icon btn-edit" onClick={() => openEdit(c)} style={{ flex: 1.2 }}>✏️ Edit</button>
                  <button className="btn-icon" onClick={() => openDetailsModal(c)} style={{ flex: 1, fontSize: 11 }}>👁 View</button>
                  <button className="btn-icon" onClick={() => { setSelectedCourse(c); setManagerView('videos'); }} style={{ flex: 1, fontSize: 11 }}>▶ Manage Videos</button>
                  <button className="btn-icon" onClick={() => { setSelectedCourse(c); setManagerView('notes'); }} style={{ flex: 1, fontSize: 11 }}>📄 Manage Notes</button>
                  <button className="btn-icon btn-students" onClick={() => openStudentsModal(c)} style={{ flex: 1.2 }}>👥 Students</button>
                  <button className="btn-icon btn-delete" onClick={() => setDelTarget(c)} style={{ flex: 1, fontSize: 11 }}>🗑️</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Course Details Modal (Videos & Notes) ── */}
      {detailsModal && (
        <div className="modal-overlay" onClick={() => setDetailsModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 820 }}>
            <div className="modal-header">
              <div>
                <div className="modal-title">🎬 {detailsModal.title}</div>
                <div className="modal-sub">Videos & Notes</div>
              </div>
              <button className="close-btn" onClick={() => setDetailsModal(null)}>×</button>
            </div>

            <div style={{ padding: 16 }}>
              {loadingDetails ? (
                <div className="loading-students">⏳ Loading details...</div>
              ) : courseDetails ? (
                <>
                  {selectedVideo ? (
                    <video 
                      controls 
                      src={selectedVideo.video_url_resolved} 
                      style={{ width: '100%', maxHeight: 380, borderRadius: 12 }}
                      onError={(e) => {
                        console.error('❌ Video playback error:', e);
                        console.error('Video URL attempted:', selectedVideo.video_url_resolved);
                        console.error('Video element error code:', e.target.error?.code, e.target.error?.message);
                      }}
                      onLoadStart={() => console.log('🎬 Video loading started:', selectedVideo.video_url_resolved)}
                      onCanPlay={() => console.log('✅ Video can play:', selectedVideo.video_url_resolved)}
                    />
                  ) : (
                    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No video selected</div>
                  )}

                  <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, marginBottom: 8 }}>Videos</div>
                      {(courseDetails.videos || []).length === 0 ? (
                        <div style={{ color: '#94a3b8' }}>No videos available for this course.</div>
                      ) : (
                        (courseDetails.videos || []).map(v => (
                          <div key={v.id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: 600 }}>{v.title}</div>
                              <div style={{ fontSize: 12, color: '#94a3b8' }}>{v.duration || ''}</div>
                            </div>
                            <div>
                              <button className="btn-icon" type="button" onClick={() => setSelectedVideo(v)} style={{ minWidth: 80 }}>▶ Play</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div style={{ width: 280 }}>
                      <div style={{ fontWeight: 700, marginBottom: 8 }}>Notes</div>
                      {(courseDetails.notes || []).length === 0 ? (
                        <div style={{ color: '#94a3b8' }}>No notes uploaded for this course.</div>
                      ) : (
                        (courseDetails.notes || []).map(n => (
                          <div key={n.id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ fontWeight: 600 }}>{n.title || 'Notes'}</div>
                            {n.file_url_resolved && (
                              <a href={n.file_url_resolved} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#6366f1' }}>Download</a>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="loading-students">Failed to load details.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{modal === 'edit' ? '✏️ Edit Course' : '➕ Create Course'}</div>
                <div className="modal-sub">
                  {modal === 'edit' ? 'Update course details' : 'Fill in the details for the new course'}
                </div>
              </div>
              <button className="close-btn" onClick={() => setModal(null)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-body">

                {/* Thumbnail Upload */}
                <div>
                  <label className="field-label">Thumbnail {modal === 'create' && <span>*</span>}</label>
                  <div
                    className={`img-upload-zone ${preview ? 'has-img' : ''}`}
                    onClick={() => fileRef.current.click()}
                  >
                    {preview ? (
                      <img src={preview} alt="preview" className="img-preview" />
                    ) : (
                      <>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#6366f1' }}>Click to upload image</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>JPG, PNG, WEBP supported</div>
                      </>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                  {preview && (
                    <button type="button" onClick={() => fileRef.current.click()}
                      style={{ marginTop: 6, fontSize: 11, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      🔄 Change image
                    </button>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="field-label">Title <span>*</span></label>
                  <input className="field-input" type="text" placeholder="e.g. Advanced JavaScript"
                    value={form.title} required
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                </div>

                {/* Description */}
                <div>
                  <label className="field-label">Description</label>
                  <textarea className="field-input" placeholder="Learn advanced JavaScript concepts and techniques"
                    rows={3} value={form.description} style={{ resize: 'vertical' }}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>

                {/* Price */}
                <div>
                  <label className="field-label">Price ($)</label>
                  <input className="field-input" type="number" min={0} step="0.01" placeholder="499.99"
                    value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} />
                </div>

                {/* isFree Toggle */}
                <div style={{ padding: '4px 0' }}>
                  <div className="toggle-wrap">
                    <div>
                      <div className="toggle-label-text">Free Course</div>
                      <div className="toggle-sub">If enabled, price will be ignored</div>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" checked={form.isFree}
                        onChange={e => setForm(p => ({ ...p, isFree: e.target.checked }))} />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>

                {/* Footer */}
                <div className="form-footer">
                  <button type="button" className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
                  <button type="submit" className="btn-save" disabled={saving}>
                    {saving ? '⏳ Saving…' : modal === 'edit' ? '✓ Update Course' : '✓ Create Course'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {delTarget && (
        <div className="modal-overlay" onClick={() => setDelTarget(null)}>
          <div className="del-modal" onClick={e => e.stopPropagation()}>
            <div className="del-icon">🗑️</div>
            <div className="del-title">Delete Course?</div>
            <div className="del-desc">
              Are you sure you want to delete <strong>"{delTarget.title}"</strong>?
              <br />This action cannot be undone.
            </div>
            <div className="del-actions">
              <button className="btn-del-cancel" onClick={() => setDelTarget(null)}>Cancel</button>
              <button className="btn-del-confirm" onClick={handleDelete} disabled={deleting}>
                {deleting ? '⏳ Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Students Modal ── */}
      {studentsModal && (
        <div className="modal-overlay" onClick={() => setStudentsModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div>
                <div className="modal-title">👥 Enrolled Students</div>
                <div className="modal-sub">{studentsModal.title}</div>
              </div>
              <button className="close-btn" onClick={() => setStudentsModal(null)}>×</button>
            </div>

            <div className="students-list">
              {loadingStudents ? (
                <div className="loading-students">⏳ Loading students...</div>
              ) : students.length === 0 ? (
                <div className="loading-students">No students enrolled yet.</div>
              ) : (
                students.map((student, idx) => (
                  <div key={student.id || idx} className="student-item">
                    <div className="student-avatar">
                      {student.profile_image_url
                        ? <img src={student.profile_image_url} alt={student.name || 'Student'} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        : <>{student.name ? student.name.charAt(0).toUpperCase() : '?'}</>
                      }
                    </div>
                    <div className="student-info">
                      <div className="student-name">{student.name || 'Unknown'}</div>
                      {student.email && <div className="student-email">{student.email}</div>}
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
                        {student.enrolled_at ? `Enrolled: ${new Date(student.enrolled_at).toLocaleDateString()}` : null}
                        {student.completed ? ` • Completed` : ''}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? '✓' : '⚠️'} {toast.text}
        </div>
      )}
    </div>
  );
};

export default CourseManager;