import { useState, useRef } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ── CSS ── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

  .km-root {
    font-family: 'Outfit', sans-serif;
    background: #f0f4ff;
    min-height: 100vh;
    padding: 32px 28px;
    color: #1a1d2e;
  }
  .km-root * { box-sizing: border-box; margin: 0; padding: 0; }

  /* Header */
  .km-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 28px; flex-wrap: wrap; gap: 12px;
  }
  .km-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(20px, 2.5vw, 28px); font-weight: 800; line-height: 1;
  }
  .km-subtitle { font-size: 13px; color: #7b82a0; margin-top: 5px; }

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
  .km-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 20px;
  }

  /* Key Card */
  .km-card {
    background: #fff; border: 1px solid #e4e9f7; border-radius: 18px;
    padding: 24px; transition: transform 0.2s, box-shadow 0.2s;
    animation: fadeUp 0.4s both;
  }
  .km-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(99,102,241,0.12); }

  .km-card-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px; gap: 10px;
  }
  .km-card-title { font-size: 15px; font-weight: 700; color: #1a1d2e; line-height: 1.3; }
  .km-card-desc { font-size: 12px; color: #7b82a0; margin-top: 3px; }

  .km-key-display {
    background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px;
    padding: 12px 14px; margin: 12px 0; font-family: 'Courier New', monospace;
    font-size: 12px; color: #0f172a; word-break: break-all; 
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
  }

  .km-key-text { 
    flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .km-icon-btn {
    width: 32px; height: 32px; border-radius: 8px; border: none;
    background: #eef2ff; color: #6366f1; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s, transform 0.1s;
    flex-shrink: 0; font-size: 16px;
  }
  .km-icon-btn:hover { background: #dbeafe; transform: scale(1.05); }

  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 600; flex-shrink: 0;
  }
  .badge.active { background: #d1fae5; color: #059669; }
  .badge.inactive { background: #fee2e2; color: #dc2626; }

  .km-meta {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    font-size: 11px; color: #94a3b8; margin: 12px 0;
  }
  .km-meta span { display: flex; align-items: center; gap: 4px; }

  .km-actions { 
    display: flex; gap: 8px; margin-top: 14px;
  }

  .btn-secondary {
    flex: 1; padding: 8px 0; border-radius: 10px; border: 1.5px solid #e2e8f0;
    background: #fff; font: 600 12px 'Outfit', sans-serif; color: #64748b;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;
    transition: background 0.15s;
  }
  .btn-secondary:hover { background: #f8fafc; }

  .btn-danger {
    flex: 1; padding: 8px 0; border-radius: 10px; border: none;
    background: #fee2e2; font: 600 12px 'Outfit', sans-serif; color: #dc2626;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;
    transition: background 0.15s;
  }
  .btn-danger:hover { background: #fecaca; }

  /* Empty state */
  .km-empty {
    grid-column: 1/-1; text-align: center;
    padding: 80px 0; color: #94a3b8;
  }
  .km-empty-icon { font-size: 56px; margin-bottom: 14px; opacity: 0.5; }
  .km-empty-text { font-size: 15px; font-weight: 500; }
  .km-empty-sub { font-size: 13px; margin-top: 5px; }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(15,23,42,0.5); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px; animation: fadeIn 0.18s ease;
  }
  .modal-box {
    background: #fff; border-radius: 22px; width: 100%; max-width: 480px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18);
    animation: slideUp 0.22s ease;
  }
  .modal-header {
    padding: 24px; border-bottom: 1px solid #f1f5f9;
  }
  .modal-title { font-size: 17px; font-weight: 700; color: #0f172a; }
  .modal-sub { font-size: 12px; color: #94a3b8; margin-top: 4px; }

  .modal-body { padding: 24px; }

  .field-label {
    display: block; font-size: 10px; font-weight: 700; color: #64748b;
    text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;
  }
  .field-label span { color: #f43f5e; margin-left: 2px; }

  .field-input {
    width: 100%; padding: 10px 13px;
    border: 1.5px solid #e2e8f0; border-radius: 10px;
    font: 400 13px 'Outfit', sans-serif; color: #0f172a;
    background: #fafafa; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    margin-bottom: 14px;
  }
  .field-input:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }

  .modal-footer {
    display: flex; gap: 10px; padding: 16px 24px; border-top: 1px solid #f1f5f9;
  }

  .btn-cancel {
    flex: 1; padding: 11px 0; border: 1.5px solid #e2e8f0; border-radius: 10px;
    background: #fff; font: 600 13px 'Outfit', sans-serif; color: #64748b;
    cursor: pointer; transition: background 0.15s;
  }
  .btn-cancel:hover { background: #f8fafc; }

  .btn-save {
    flex: 1.5; padding: 11px 0; border: none; border-radius: 10px;
    font: 700 13px 'Outfit', sans-serif; color: #fff; cursor: pointer;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
    transition: opacity 0.15s;
  }
  .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

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
  .toast.error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

  /* Skeleton */
  .skeleton {
    background: linear-gradient(90deg,#e8ecf8 25%,#f4f6fd 50%,#e8ecf8 75%);
    background-size: 200% 100%; border-radius: 8px;
    animation: shimmer 1.3s infinite;
  }

  /* Animations */
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes slideUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
  @keyframes slideInRight { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:none} }
`;

/* ── Helpers ── */
const token = () => localStorage.getItem('token');
const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).catch(() => {});
};

const generateKey = () => {
  return 'sk_' + Math.random().toString(36).substr(2, 32) + Date.now().toString(36);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const maskKey = (key) => {
  if (!key) return '';
  return key.substring(0, 10) + '...' + key.substring(key.length - 8);
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

/* ── Main Component ── */
const KeyManager = () => {
  const [keys, setKeys] = useState([
    { id: 1, name: 'Production API', key: import.meta.env.VITE_STRIPE_LIVE_KEY || '[Add VITE_STRIPE_LIVE_KEY to .env]', created: new Date(Date.now() - 86400000 * 30), active: true, lastUsed: new Date(Date.now() - 3600000) },
    { id: 2, name: 'Development', key: import.meta.env.VITE_STRIPE_TEST_KEY || '[Add VITE_STRIPE_TEST_KEY to .env]', created: new Date(Date.now() - 86400000 * 15), active: true, lastUsed: new Date(Date.now() - 7200000) },
  ]);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, showToast] = useToast();
  const [newKeyName, setNewKeyName] = useState('');

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      showToast('error', 'Please enter a key name');
      return;
    }

    setSaving(true);
    try {
      const newKey = {
        id: keys.length + 1,
        name: newKeyName,
        key: generateKey(),
        created: new Date(),
        active: true,
        lastUsed: null,
      };
      setKeys([newKey, ...keys]);
      showToast('success', 'API key generated successfully!');
      setNewKeyName('');
      setModal(false);
    } catch (err) {
      showToast('error', err.message || 'Failed to generate key');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleKey = (id) => {
    setKeys(keys.map(k => k.id === id ? { ...k, active: !k.active } : k));
    showToast('success', 'Key status updated');
  };

  const handleDeleteKey = (id) => {
    setKeys(keys.filter(k => k.id !== id));
    showToast('success', 'API key deleted');
  };

  return (
    <div className="km-root">
      <style>{css}</style>

      {/* Header */}
      <div className="km-header">
        <div>
          <div className="km-title">🔑 API Keys</div>
          <div className="km-subtitle">Manage your API keys for integrations</div>
        </div>
        <button className="btn-primary" onClick={() => setModal(true)}>
          ＋ Generate Key
        </button>
      </div>

      {/* Grid */}
      <div className="km-grid">
        {keys.length === 0 ? (
          <div className="km-empty">
            <div className="km-empty-icon">🔑</div>
            <div className="km-empty-text">No API keys yet</div>
            <div className="km-empty-sub">Generate your first API key to get started</div>
          </div>
        ) : (
          keys.map((k, i) => (
            <div className="km-card" key={k.id} style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="km-card-header">
                <div>
                  <div className="km-card-title">{k.name}</div>
                  <div className="km-card-desc">
                    {k.active ? '✓ Active' : '✗ Inactive'}
                  </div>
                </div>
                <span className={`badge ${k.active ? 'active' : 'inactive'}`}>
                  {k.active ? '● Live' : '○ Disabled'}
                </span>
              </div>

              <div className="km-key-display">
                <span className="km-key-text">{maskKey(k.key)}</span>
                <button
                  className="km-icon-btn"
                  onClick={() => { copyToClipboard(k.key); showToast('success', 'Copied!'); }}
                  title="Copy full key"
                >
                  📋
                </button>
              </div>

              <div className="km-meta">
                <span>📅 Created {formatDate(k.created)}</span>
                {k.lastUsed && <span>⏱️ Last used {formatDate(k.lastUsed)}</span>}
              </div>

              <div className="km-actions">
                <button
                  className="btn-secondary"
                  onClick={() => handleToggleKey(k.id)}
                >
                  {k.active ? '🔒 Disable' : '🔓 Enable'}
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDeleteKey(k.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Generate Key Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">🔑 Generate New API Key</div>
              <div className="modal-sub">Create a new API key for integrations</div>
            </div>

            <form onSubmit={handleGenerateKey}>
              <div className="modal-body">
                <div>
                  <label className="field-label">Key Name <span>*</span></label>
                  <input
                    className="field-input"
                    type="text"
                    placeholder="e.g., Production API, Mobile App"
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div style={{ background: '#eef2ff', border: '1px solid #dbeafe', borderRadius: 10, padding: '12px 14px', fontSize: 12, color: '#1e40af' }}>
                  💡 <strong>Tip:</strong> Store your API key in a secure location. You won't be able to see it again after closing this dialog.
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? '⏳ Generating…' : '✓ Generate Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? '✓' : '⚠️'} {toast.text}
        </div>
      )}
    </div>
  );
};

export default KeyManager;
