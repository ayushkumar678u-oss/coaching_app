import { useState, useEffect, useRef } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ── CSS ── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

  .sl-root {
    font-family: 'Outfit', sans-serif;
    background: #f0f4ff;
    min-height: 100vh;
    padding: 32px 28px;
    color: #1a1d2e;
  }
  .sl-root * { box-sizing: border-box; margin: 0; padding: 0; }

  /* Header */
  .sl-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 28px; flex-wrap: wrap; gap: 12px;
  }
  .sl-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(20px, 2.5vw, 28px); font-weight: 800; line-height: 1;
  }
  .sl-subtitle { font-size: 13px; color: #7b82a0; margin-top: 5px; }

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

  /* Grid */
  .sl-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  /* Slider Card */
  .sl-card {
    background: #fff; border: 1px solid #e4e9f7; border-radius: 18px;
    overflow: hidden; transition: transform 0.2s, box-shadow 0.2s;
    animation: fadeUp 0.4s both;
  }
  .sl-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(99,102,241,0.12); }

  .sl-card-img {
    width: 100%; height: 180px; object-fit: cover;
    background: linear-gradient(135deg, #ede9ff, #dbeafe);
    display: flex; align-items: center; justify-content: center;
    font-size: 48px; color: #c7d2fe;
  }
  .sl-card-img img { width: 100%; height: 100%; object-fit: cover; }

  .sl-card-body { padding: 16px 18px 18px; }
  .sl-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 8px; }

  .sl-card-title { font-size: 15px; font-weight: 700; color: #1a1d2e; line-height: 1.3; }
  .sl-card-desc  { font-size: 12.5px; color: #7b82a0; line-height: 1.5; margin-bottom: 10px; }

  .sl-card-meta {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    font-size: 11px; color: #94a3b8; margin-bottom: 14px;
  }
  .sl-card-meta span { display: flex; align-items: center; gap: 4px; }

  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 600; flex-shrink: 0;
  }
  .badge.active   { background: #d1fae5; color: #059669; }
  .badge.inactive { background: #fee2e2; color: #dc2626; }

  .sl-card-actions { display: flex; gap: 8px; }

  .btn-icon {
    flex: 1; padding: 8px 0; border-radius: 10px; border: none;
    font: 600 12px 'Outfit', sans-serif; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 5px;
    transition: opacity 0.15s, transform 0.1s;
  }
  .btn-icon:hover { opacity: 0.85; transform: scale(1.03); }
  .btn-edit   { background: #eef2ff; color: #6366f1; }
  .btn-delete { background: #fee2e2; color: #dc2626; }

  /* Empty state */
  .sl-empty {
    grid-column: 1/-1; text-align: center;
    padding: 80px 0; color: #94a3b8;
  }
  .sl-empty-icon { font-size: 56px; margin-bottom: 14px; opacity: 0.5; }
  .sl-empty-text { font-size: 15px; font-weight: 500; }
  .sl-empty-sub  { font-size: 13px; margin-top: 5px; }

  /* Skeleton */
  .skeleton {
    background: linear-gradient(90deg,#e8ecf8 25%,#f4f6fd 50%,#e8ecf8 75%);
    background-size: 200% 100%; border-radius: 8px;
    animation: shimmer 1.3s infinite;
  }

  /* Modal overlay */
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

  /* Form */
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

  /* Image upload zone */
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

  /* Toggle switch */
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

  /* Form footer */
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

  /* Toast */
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

  /* Delete confirm modal */
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

  /* Animations */
  @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
  @keyframes shimmer   { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes slideUp   { from{opacity:0;transform:translateY(22px) scale(0.97)} to{opacity:1;transform:none} }
  @keyframes slideInRight { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:none} }
`;

/* ── Helpers ── */
const token = () => localStorage.getItem('token');
const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

const getImageUrl = (filename) => {
  if (!filename) return null;
  if (filename.startsWith('http')) return filename;
  if (filename.startsWith('/')) return `${BASE_URL}${filename}`;
  if (filename.startsWith('uploads/')) return `${BASE_URL}/${filename}`;
  return `${BASE_URL}/uploads/sliders/${filename}`;
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

/* ── Main Component ── */
const SliderManager = () => {
  const [sliders,   setSliders]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(null); // null | 'create' | 'edit'
  const [editData,  setEditData]  = useState(null);
  const [delTarget, setDelTarget] = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [toast,     showToast]    = useToast();
  const fileRef = useRef(null);

  /* Form state */
  const EMPTY_FORM = { title: '', description: '', link: '', order_index: 1, active: true, image: null };
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [preview, setPreview] = useState(null);

  /* ── Fetch All ── */
  const fetchSliders = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/api/sliders`, { headers: authHeaders() });
      const json = await res.json();
      setSliders(json.data ?? json.sliders ?? json ?? []);
    } catch (e) {
      showToast('error', 'Failed to load sliders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSliders(); }, []);

  /* ── Open Create Modal ── */
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setPreview(null);
    setModal('create');
  };

  /* ── Open Edit Modal ── */
  const openEdit = async (slider) => {
    setForm({
      title:       slider.title       || '',
      description: slider.description || '',
      link:        slider.link        || '',
      order_index: slider.order_index ?? 1,
      active:      slider.active == 1 || slider.active === true,
      image:       null,
    });
    setPreview(getImageUrl(slider.image));
    setEditData(slider);
    setModal('edit');
  };

  /* ── Handle Image Pick ── */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(p => ({ ...p, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  /* ── Submit (Create / Update) ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title',       form.title);
      fd.append('description', form.description);
      fd.append('link',        form.link);
      fd.append('order_index', form.order_index);
      fd.append('active',      form.active ? 1 : 0);
      if (form.image) fd.append('image', form.image);

      const isEdit = modal === 'edit';
      const url    = isEdit ? `${BASE_URL}/api/sliders/${editData.id}` : `${BASE_URL}/api/sliders`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers: authHeaders(), body: fd });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Request failed'); }

      showToast('success', isEdit ? 'Slider updated!' : 'Slider created!');
      setModal(null);
      fetchSliders();
    } catch (err) {
      showToast('error', err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!delTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/sliders/${delTarget.id}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Delete failed');
      showToast('success', 'Slider deleted');
      setDelTarget(null);
      fetchSliders();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setDeleting(false);
    }
  };

  /* ── Render ── */
  return (
    <div className="sl-root">
      <style>{css}</style>

      {/* Header */}
      <div className="sl-header">
        <div>
          <div className="sl-title">🖼️ Slider Manager</div>
          <div className="sl-subtitle">
            {loading ? 'Loading…' : `${sliders.length} slider${sliders.length !== 1 ? 's' : ''} total`}
          </div>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          ＋ Add Slider
        </button>
      </div>

      {/* Grid */}
      <div className="sl-grid">
        {loading ? (
          Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : sliders.length === 0 ? (
          <div className="sl-empty">
            <div className="sl-empty-icon">🖼️</div>
            <div className="sl-empty-text">No sliders yet</div>
            <div className="sl-empty-sub">Click "Add Slider" to create your first one</div>
          </div>
        ) : (
          sliders.map((s, i) => (
            <div className="sl-card" key={s.id} style={{ animationDelay: `${i * 0.06}s` }}>
              {/* Image */}
              <div className="sl-card-img">
                {s.image
                  ? <img src={getImageUrl(s.image)} alt={s.title} />
                  : <span>🖼️</span>
                }
              </div>

              {/* Body */}
              <div className="sl-card-body">
                <div className="sl-card-top">
                  <div className="sl-card-title">{s.title}</div>
                  <span className={`badge ${s.active == 1 || s.active === true ? 'active' : 'inactive'}`}>
                    {s.active == 1 || s.active === true ? '● Active' : '○ Inactive'}
                  </span>
                </div>

                {s.description && (
                  <div className="sl-card-desc" style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {s.description}
                  </div>
                )}

                <div className="sl-card-meta">
                  {s.link && (
                    <span>
                      🔗 <a href={s.link} target="_blank" rel="noreferrer" style={{ color: '#6366f1', textDecoration: 'none' }}>
                        {s.link.replace(/^https?:\/\//, '').slice(0, 30)}{s.link.length > 33 ? '…' : ''}
                      </a>
                    </span>
                  )}
                  <span>📌 Order: {s.order_index}</span>
                </div>

                <div className="sl-card-actions">
                  <button className="btn-icon btn-edit" onClick={() => openEdit(s)}>✏️ Edit</button>
                  <button className="btn-icon btn-delete" onClick={() => setDelTarget(s)}>🗑️ Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{modal === 'edit' ? '✏️ Edit Slider' : '➕ Create Slider'}</div>
                <div className="modal-sub">
                  {modal === 'edit' ? 'Update slider details' : 'Fill in the details for the new slider'}
                </div>
              </div>
              <button className="close-btn" onClick={() => setModal(null)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-body">

                {/* Image Upload */}
                <div>
                  <label className="field-label">Image {modal === 'create' && <span>*</span>}</label>
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
                  <input className="field-input" type="text" placeholder="Homepage Hero"
                    value={form.title} required
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                </div>

                {/* Description */}
                <div>
                  <label className="field-label">Description</label>
                  <textarea className="field-input" placeholder="Welcome to the coaching app"
                    rows={3} value={form.description} style={{ resize: 'vertical' }}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>

                {/* Link */}
                <div>
                  <label className="field-label">Link URL</label>
                  <input className="field-input" type="url" placeholder="https://example.com"
                    value={form.link}
                    onChange={e => setForm(p => ({ ...p, link: e.target.value }))} />
                </div>

                {/* Order Index */}
                <div>
                  <label className="field-label">Order Index</label>
                  <input className="field-input" type="number" min={1} placeholder="1"
                    value={form.order_index}
                    onChange={e => setForm(p => ({ ...p, order_index: parseInt(e.target.value) || 1 }))} />
                </div>

                {/* Active Toggle */}
                <div style={{ padding: '4px 0' }}>
                  <div className="toggle-wrap">
                    <div>
                      <div className="toggle-label-text">Active</div>
                      <div className="toggle-sub">Show this slider on the website</div>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" checked={form.active}
                        onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>

                {/* Footer */}
                <div className="form-footer">
                  <button type="button" className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
                  <button type="submit" className="btn-save" disabled={saving}>
                    {saving ? '⏳ Saving…' : modal === 'edit' ? '✓ Update Slider' : '✓ Create Slider'}
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
            <div className="del-title">Delete Slider?</div>
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

      {/* ── Toast ── */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? '✓' : '⚠️'} {toast.text}
        </div>
      )}
    </div>
  );
};

export default SliderManager;