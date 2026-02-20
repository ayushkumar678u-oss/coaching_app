import { useState, useEffect, useRef } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

  .nm-root {
    font-family: 'Outfit', sans-serif;
    background: #f0f4ff;
    min-height: 100vh;
    padding: 32px 28px;
    color: #1a1d2e;
  }
  .nm-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .nm-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 28px; flex-wrap: wrap; gap: 12px;
  }
  .nm-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(20px, 2.5vw, 28px); font-weight: 800; line-height: 1;
  }
  .nm-subtitle { font-size: 13px; color: #7b82a0; margin-top: 5px; }

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

  .nm-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .nm-card {
    background: #fff; border: 1px solid #e4e9f7; border-radius: 14px;
    padding: 18px; display: flex; flex-direction: column; gap: 12px;
  }
  .nm-card:hover { box-shadow: 0 8px 20px rgba(99,102,241,0.1); }

  .nm-card-icon {
    width: 48px; height: 48px; border-radius: 10px;
    background: #eef2ff; display: flex; align-items: center; justify-content: center;
    font-size: 24px;
  }

  .nm-card-title { font-weight: 700; color: #1a1d2e; }
  .nm-card-meta { font-size: 12px; color: #94a3b8; }

  .nm-card-actions {
    display: flex; gap: 8px; margin-top: 8px;
  }

  .btn-icon {
    flex: 1; padding: 8px 0;
    border-radius: 8px;
    border: none;
    font: 600 11px 'Outfit', sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: opacity 0.15s;
  }
  .btn-icon:hover { opacity: 0.85; }
  .btn-edit { background: #eef2ff; color: #6366f1; }
  .btn-delete { background: #fee2e2; color: #dc2626; }

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
  .modal-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }

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

  .file-upload-zone {
    border: 2px dashed #c7d2fe; border-radius: 12px;
    padding: 20px; text-align: center;
    cursor: pointer; transition: border-color 0.15s, background 0.15s;
    background: #fafbff;
  }
  .file-upload-zone:hover { border-color: #6366f1; background: #eef2ff; }
  .file-upload-zone.has-file { border-style: solid; border-color: #6366f1; }

  .file-name { font-size: 12px; color: #6366f1; margin-top: 8px; }

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
  .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

  .toast {
    position: fixed; bottom: 28px; right: 28px; z-index: 100;
    padding: 12px 20px; border-radius: 12px;
    font: 600 13px 'Outfit', sans-serif;
    display: flex; align-items: center; gap: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    animation: slideInRight 0.3s ease;
  }
  .toast.success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
  .toast.error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

  .empty-state {
    text-align: center; padding: 60px 20px; color: #94a3b8;
  }
  .empty-icon { font-size: 48px; margin-bottom: 12px; }
  .empty-text { font-size: 15px; font-weight: 500; }

  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes slideUp { from{opacity:0;transform:translateY(22px) scale(0.97)} to{opacity:1;transform:none} }
  @keyframes slideInRight { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:none} }
`;

const token = () => localStorage.getItem('token');
const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

const getFileUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? `${BASE_URL}${url}` : `${BASE_URL}/${url}`;
};

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

const NotesManager = ({ courseId, courseName, onClose }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, showToast] = useToast();
  const fileRef = useRef(null);

  const [form, setForm] = useState({ title: '', file: null });
  const [fileName, setFileName] = useState('');

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/notes/${courseId}`, { headers: authHeaders() });
      const json = await res.json();
      console.debug('fetchNotes response:', json);
      const notesWithUrls = (json.data ?? []).map(n => {
        const resolved = getFileUrl(n.file_url);
        console.debug(`Note ${n.id}: ${n.file_url} → ${resolved}`);
        return {
          ...n,
          file_url_resolved: resolved,
        };
      });
      setNotes(notesWithUrls);
    } catch (e) {
      console.error('fetchNotes error:', e);
      showToast('error', 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, [courseId]);

  const openCreate = () => {
    setForm({ title: '', file: null });
    setFileName('');
    setEditData(null);
    setModal('create');
  };

  const openEdit = (note) => {
    setForm({ title: note.title, file: null });
    setFileName('');
    setEditData(note);
    setModal('edit');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(p => ({ ...p, file }));
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isEdit = modal === 'edit';
      let res;

      if (isEdit) {
        // Edit: use JSON if no new file, FormData if file is being replaced
        if (form.file) {
          // File replacement: use FormData
          const fd = new FormData();
          fd.append('title', form.title);
          fd.append('file', form.file);
          console.debug('📝 Edit notes with file:', form.title);
          res = await fetch(`${BASE_URL}/api/notes/edit/${editData.id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: fd,
          });
        } else {
          // Title only: use JSON
          const body = { title: form.title };
          console.debug('📝 Edit notes title only:', form.title);
          res = await fetch(`${BASE_URL}/api/notes/edit/${editData.id}`, {
            method: 'PUT',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
        }
      } else {
        const fd = new FormData();
        fd.append('title', form.title);
        if (form.file) fd.append('file', form.file);

        res = await fetch(`${BASE_URL}/api/notes/${courseId}`, {
          method: 'POST',
          headers: authHeaders(),
          body: fd,
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save');
      }

      showToast('success', isEdit ? 'Notes updated!' : 'Notes uploaded!');
      setModal(null);
      setFileName('');
      fetchNotes();
    } catch (err) {
      console.error('❌ Submit error:', err);
      showToast('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (notesId) => {
    if (!confirm('Delete these notes?')) return;
    try {
      const url = `${BASE_URL}/api/notes/${notesId}`;
      console.debug('🗑️ Deleting notes:', notesId, 'URL:', url);
      const res = await fetch(url, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const json = await res.json().catch(() => null);
      console.debug('Delete response:', res.status, json);
      if (!res.ok) {
        throw new Error(json?.message || `Delete failed (${res.status})`);
      }
      showToast('success', 'Notes deleted');
      fetchNotes();
    } catch (err) {
      console.error('❌ Delete error:', err);
      showToast('error', err.message);
    }
  };

  return (
    <div className="nm-root">
      <style>{css}</style>

      <div className="nm-header">
        <div>
          <div className="nm-title">📄 Study Notes</div>
          <div className="nm-subtitle">{courseName}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" onClick={openCreate}>＋ Add Notes</button>
          <button className="btn-primary" onClick={onClose} style={{ background: '#94a3b8' }}>← Back</button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <div className="empty-text">No study notes uploaded yet</div>
        </div>
      ) : (
        <div className="nm-grid">
          {notes.map(n => (
            <div key={n.id} className="nm-card">
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div className="nm-card-icon">📎</div>
                <div style={{ flex: 1 }}>
                  <div className="nm-card-title">{n.title}</div>
                  <div className="nm-card-meta">{new Date(n.created_at || Date.now()).toLocaleDateString()}</div>
                  {n.file_url_resolved && (
                    <a href={n.file_url_resolved} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#6366f1', marginTop: 4, display: 'block' }}>
                      📥 Preview
                    </a>
                  )}
                </div>
              </div>
              <div className="nm-card-actions">
                <button className="btn-icon btn-edit" onClick={() => openEdit(n)}>✏️ Edit</button>
                <button className="btn-icon btn-delete" onClick={() => handleDelete(n.id)}>🗑️ Del</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{modal === 'edit' ? '✏️ Edit Notes' : '➕ Add Study Notes'}</div>
                <div className="modal-sub">{modal === 'edit' ? 'Update note details' : 'Upload new study notes'}</div>
              </div>
              <button className="close-btn" onClick={() => setModal(null)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-body">
                {modal === 'create' && (
                  <div>
                    <label className="field-label">PDF File <span>*</span></label>
                    <div className={`file-upload-zone ${fileName ? 'has-file' : ''}`} onClick={() => fileRef.current.click()}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#6366f1' }}>Click to upload PDF</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>PDF only</div>
                      {fileName && <div className="file-name">Selected: {fileName}</div>}
                    </div>
                    <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileChange} />
                  </div>
                )}

                <div>
                  <label className="field-label">Title <span>*</span></label>
                  <input className="field-input" type="text" placeholder="e.g. Chapter 1 - Basics" required
                    value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                </div>

                <div className="form-footer">
                  <button type="button" className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
                  <button type="submit" className="btn-save" disabled={saving}>
                    {saving ? '⏳ Saving…' : modal === 'edit' ? '✓ Update' : '✓ Upload'}
                  </button>
                </div>
              </div>
            </form>
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

export default NotesManager;
