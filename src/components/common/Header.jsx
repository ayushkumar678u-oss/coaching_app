import { useState, useRef } from 'react';
import NotificationBell from './NotificationBell';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Header props:
 *  title          {string}   - page title
 *  onMenuClick    {fn}       - hamburger click (for mobile)
 *  showMenu       {boolean}  - show hamburger?
 *  menuOpen       {boolean}  - is mobile menu open?
 *  profile        {object}   - { name, email, role, phone, college, education, father_name, address, profile_image }
 *  onProfileLoad  {fn}       - called when drawer opens (to fetch profile if null)
 *  onLogout       {fn}
 *  onProfileSave  {fn(data)} - called after successful profile update
 */
const Header = ({
  title         = 'Dashboard',
  onMenuClick,
  showMenu      = false,
  menuOpen      = false,
  profile       = null,
  loadingProfile= false,
  onProfileLoad,
  onLogout,
  onProfileSave,
}) => {
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [editOpen,   setEditOpen]     = useState(false);
  const [imgZoom,    setImgZoom]      = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [isSaving,   setIsSaving]     = useState(false);
  const [saveMsg,    setSaveMsg]      = useState({ type:'', text:'' });
  const [preview,    setPreview]      = useState(null);
  const [formData,   setFormData]     = useState({
    name:'', father_name:'', phone:'', address:'', college:'', education:'', profile_image:null,
  });
  const fileRef = useRef(null);

const getImageUrl = (filename) => {
  if (!filename) return null;
  if (filename.startsWith('http')) return filename;
  if (filename.startsWith('/')) return `${BASE_URL}${filename}`;
  if (filename.startsWith('uploads/')) return `${BASE_URL}/${filename}`;
  // Fallback: assume it's a relative uploads path
  return `${BASE_URL}/uploads/${filename}`;
};

  const imgSrc   = getImageUrl(profile?.profile_image);
  const initials = (profile?.name || 'A').charAt(0).toUpperCase();

  const openDrawer = () => {
    setDrawerOpen(true);
    onProfileLoad?.();
  };

  const openEdit = () => {
    setPreview(null);
    setSaveMsg({ type:'', text:'' });
    setFormData({
      name:        profile?.name        || '',
      father_name: profile?.father_name || '',
      phone:       profile?.phone       || '',
      address:     profile?.address     || '',
      college:     profile?.college     || '',
      education:   profile?.education   || '',
      profile_image: null,
    });
    setEditOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true); setSaveMsg({ type:'', text:'' });
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k,v]) => {
        if (k === 'profile_image') { if (v) data.append(k, v); }
        else data.append(k, v);
      });
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        method:'PUT', headers:{ Authorization:`Bearer ${token}` }, body:data,
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message||'Update failed'); }
      const result = await res.json();
      onProfileSave?.(result.data);
      setSaveMsg({ type:'success', text:'Profile updated!' });
      setTimeout(() => { setEditOpen(false); setSaveMsg({ type:'', text:'' }); }, 1400);
    } catch (err) {
      setSaveMsg({ type:'error', text: err.message || 'Failed to update' });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Avatar ──
  const AvatarCircle = ({ size=36, src, name }) => {
    const [err, setErr] = useState(false);
    return (
      <div style={{
        width:size, height:size, borderRadius:'50%', flexShrink:0, overflow:'hidden',
        background:'linear-gradient(135deg,#6366f1,#a855f7)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontWeight:800, color:'#fff', fontSize:size/2.7,
      }}>
        {src && !err
          ? <img src={src} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={()=>setErr(true)} />
          : <span>{(name||'A').charAt(0).toUpperCase()}</span>
        }
      </div>
    );
  };

  // ── Info Card ──
  const InfoCard = ({ icon, label, value }) => {
    if (!value) return null;
    return (
      <div style={{
        display:'flex', alignItems:'flex-start', gap:13,
        padding:'12px 15px', background:'#f8fafc',
        borderRadius:12, border:'1px solid #f1f5f9',
      }}>
        <div style={{ width:34, height:34, borderRadius:10, background:'#eef2ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>{icon}</div>
        <div>
          <div style={{ fontSize:9.5, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.09em', fontWeight:700 }}>{label}</div>
          <div style={{ fontSize:13.5, color:'#1e293b', marginTop:3, fontWeight:500 }}>{value}</div>
        </div>
      </div>
    );
  };

  const today = new Date().toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });

  return (
    <>
      {/* ── HEADER BAR ── */}
      <header style={{
        height:64, background:'#fff',
        borderBottom:'1px solid #e8edf4',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 24px', position:'sticky', top:0, zIndex:500,
        boxShadow:'0 1px 8px rgba(0,0,0,0.06)',
      }}>

        {/* Left */}
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          {/* Mobile hamburger */}
          {showMenu && (
            <button
              onClick={onMenuClick}
              style={{
                width:38, height:38, borderRadius:10,
                border:'1px solid #e2e8f0', background:'#f8fafc',
                cursor:'pointer', display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center', gap:5,
                transition:'background 0.15s', flexShrink:0,
              }}
              onMouseEnter={e => e.currentTarget.style.background='#eef2ff'}
              onMouseLeave={e => e.currentTarget.style.background='#f8fafc'}
            >
              {[0,1,2].map(i => (
                <div key={i} style={{
                  height:2, borderRadius:2, background:'#64748b',
                  transition:'all 0.22s',
                  width: menuOpen ? (i===1?0:18) : (i===1?13:18),
                  transform: menuOpen
                    ? (i===0?'translateY(7px) rotate(45deg)': i===2?'translateY(-7px) rotate(-45deg)':'')
                    : 'none',
                }} />
              ))}
            </button>
          )}

          {/* Title */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:4, height:26, borderRadius:3,
              background:'linear-gradient(180deg,#6366f1,#a855f7)',
              boxShadow:'0 2px 8px rgba(99,102,241,0.4)',
            }} />
            <div>
              <h1 style={{ margin:0, fontSize:17, fontWeight:800, color:'#0f172a', letterSpacing:'-0.03em', lineHeight:1.2 }}>{title}</h1>
              <div style={{ fontSize:11, color:'#94a3b8', marginTop:1 }}>{today}</div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {/* NotificationBell Component */}
          <NotificationBell />
          {/* Divider */}
          <div style={{ width:1, height:28, background:'#e2e8f0', margin:'0 4px' }} />
          {/* Avatar pill */}
          <button
            onClick={openDrawer}
            style={{
              display:'flex', alignItems:'center', gap:10,
              background:'transparent', border:'1px solid transparent',
              borderRadius:40, padding:'4px 14px 4px 4px',
              cursor:'pointer', transition:'all 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='#f8fafc'; e.currentTarget.style.borderColor='#e2e8f0'; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent'; }}
          >
            <AvatarCircle size={34} src={imgSrc} name={profile?.name} />
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start' }}>
              <span style={{ fontSize:13, fontWeight:700, color:'#0f172a', lineHeight:1.2, whiteSpace:'nowrap', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis' }}>
                {profile?.name || 'Admin'}
              </span>
              <span style={{ fontSize:10, color:'#94a3b8', textTransform:'capitalize' }}>
                {profile?.role || 'Administrator'}
              </span>
            </div>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ color:'#94a3b8', flexShrink:0 }}>
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── DRAWER OVERLAY ── */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position:'fixed', inset:0, zIndex:959,
            background:'rgba(15,23,42,0.35)', backdropFilter:'blur(4px)',
            animation:'hFade 0.2s ease',
          }}
        />
      )}

      {/* ── PROFILE DRAWER ── */}
      <div style={{
        position:'fixed', top:0, right:0, bottom:0,
        width:'100%', maxWidth:420,
        background:'#fff', zIndex:960,
        boxShadow:'-8px 0 40px rgba(0,0,0,0.12)',
        transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
        transition:'transform 0.34s cubic-bezier(0.4,0,0.2,1)',
        display:'flex', flexDirection:'column', overflowY:'auto',
      }}>
        {loadingProfile ? (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, color:'#94a3b8' }}>
            <div style={{ fontSize:34, animation:'spin 1.2s linear infinite' }}>⏳</div>
            <div style={{ fontSize:14 }}>Loading profile…</div>
          </div>
        ) : profile ? (
          <>
            {/* Cover */}
            <div style={{
              background:'linear-gradient(135deg,#4f46e5 0%,#7c3aed 55%,#a855f7 100%)',
              padding:'20px 24px 26px', position:'relative', overflow:'hidden', flexShrink:0,
            }}>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{
                  position:'absolute', top:16, right:16, width:32, height:32, borderRadius:'50%',
                  background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)',
                  color:'#fff', fontSize:18, cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}
              >×</button>
              <div style={{ position:'absolute', top:-30, right:-20, width:140, height:140, borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }} />
              <div style={{ position:'absolute', bottom:-20, left:20, width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />

              <div style={{ display:'flex', alignItems:'center', gap:18, marginTop:10, position:'relative' }}>
                <div onClick={() => imgSrc && setImgZoom(true)} style={{ position:'relative', flexShrink:0, cursor: imgSrc?'zoom-in':'default' }}>
                  <div style={{
                    width:76, height:76, borderRadius:'50%', overflow:'hidden',
                    border:'3px solid rgba(255,255,255,0.4)',
                    background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:28, fontWeight:800, color:'#fff',
                  }}>
                    {imgSrc
                      ? <img src={imgSrc} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <span>{initials}</span>
                    }
                  </div>
                  {imgSrc && (
                    <div style={{ position:'absolute', bottom:2, right:2, width:20, height:20, borderRadius:'50%', background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize:20, fontWeight:800, color:'#fff', lineHeight:1.2 }}>{profile.name}</div>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,0.65)', marginTop:4 }}>{profile.email}</div>
                  <div style={{ display:'inline-block', marginTop:8, background:'rgba(255,255,255,0.18)', color:'#fff', fontSize:11, fontWeight:700, padding:'3px 11px', borderRadius:20, textTransform:'capitalize', letterSpacing:'0.06em' }}>
                    {profile.role}
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div style={{ flex:1, padding:'22px 22px 0' }}>
              <div style={{ fontSize:10, fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:14 }}>Profile Details</div>
              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                <InfoCard icon="📞" label="Phone"          value={profile.phone} />
                <InfoCard icon="🎓" label="College"        value={profile.college} />
                <InfoCard icon="📖" label="Education"      value={profile.education} />
                <InfoCard icon="👨‍👧" label="Father's Name" value={profile.father_name} />
                <InfoCard icon="📍" label="Address"        value={profile.address} />
              </div>
              {!profile.phone && !profile.college && !profile.education && !profile.father_name && !profile.address && (
                <div style={{ textAlign:'center', padding:'32px 0', color:'#94a3b8', fontSize:13, fontStyle:'italic' }}>No details added yet</div>
              )}
            </div>

            {/* Actions */}
            <div style={{ padding:22, display:'flex', flexDirection:'column', gap:10 }}>
              <button
                onClick={openEdit}
                style={{
                  width:'100%', padding:'13px 0', borderRadius:12, border:'none',
                  background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  boxShadow:'0 4px 14px rgba(99,102,241,0.35)', transition:'opacity 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity='0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity='1'}
              >✏️ Edit Profile</button>
              <button
                onClick={() => setLogoutConfirm(true)}
                style={{
                  width:'100%', padding:'13px 0', borderRadius:12,
                  border:'1.5px solid #fee2e2', background:'#fff',
                  color:'#ef4444', fontSize:14, fontWeight:600, cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
                onMouseLeave={e => e.currentTarget.style.background='#fff'}
              >🚪 Logout</button>
            </div>
          </>
        ) : (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'#94a3b8' }}>
            Could not load profile.
          </div>
        )}
      </div>

      {/* ── IMAGE ZOOM ── */}
      {imgZoom && imgSrc && (
        <div
          onClick={() => setImgZoom(false)}
          style={{ position:'fixed', inset:0, zIndex:990, background:'rgba(0,0,0,0.88)', backdropFilter:'blur(10px)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'zoom-out' }}
        >
          <div style={{ position:'relative' }} onClick={e => e.stopPropagation()}>
            <img src={imgSrc} alt="Profile" style={{ maxWidth:'90vw', maxHeight:'88vh', borderRadius:18, objectFit:'contain', boxShadow:'0 32px 80px rgba(0,0,0,0.6)' }} />
            <button onClick={() => setImgZoom(false)} style={{ position:'absolute', top:-14, right:-14, width:34, height:34, borderRadius:'50%', background:'#1e293b', border:'2px solid #475569', color:'#e2e8f0', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
          </div>
        </div>
      )}

      {/* ── LOGOUT CONFIRMATION MODAL ── */}
      {logoutConfirm && (
        <div
          onClick={() => setLogoutConfirm(false)}
          style={{ position:'fixed', inset:0, zIndex:980, background:'rgba(15,23,42,0.6)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, animation:'hFade 0.18s ease' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background:'#fff', borderRadius:16, boxShadow:'0 24px 64px rgba(0,0,0,0.25)', width:'100%', maxWidth:380, padding:'28px 24px', animation:'slideUp 0.22s ease' }}
          >
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
              <h3 style={{ margin:0, fontSize:18, fontWeight:700, color:'#0f172a', marginBottom:8 }}>Confirm Logout</h3>
              <p style={{ margin:0, fontSize:14, color:'#64748b', lineHeight:1.5 }}>Are you sure you want to logout? You'll need to sign in again to access your account.</p>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button
                onClick={() => setLogoutConfirm(false)}
                style={{
                  flex:1, padding:'11px 0', border:'1.5px solid #e2e8f0', borderRadius:10,
                  background:'#fff', fontSize:13, fontWeight:600, color:'#64748b', cursor:'pointer',
                  transition:'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#cbd5e1'; e.currentTarget.style.background='#f8fafc'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.background='#fff'; }}
              >Cancel</button>
              <button
                onClick={() => { setLogoutConfirm(false); onLogout?.(); }}
                style={{
                  flex:1, padding:'11px 0', border:'none', borderRadius:10,
                  background:'#ef4444', fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer',
                  boxShadow:'0 4px 12px rgba(239,68,68,0.3)', transition:'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background='#dc2626'; e.currentTarget.style.boxShadow='0 6px 16px rgba(239,68,68,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='#ef4444'; e.currentTarget.style.boxShadow='0 4px 12px rgba(239,68,68,0.3)'; }}
              >Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editOpen && (
        <div
          onClick={() => setEditOpen(false)}
          style={{ position:'fixed', inset:0, zIndex:999, background:'rgba(15,23,42,0.55)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, animation:'hFade 0.18s ease' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background:'#fff', borderRadius:20, boxShadow:'0 24px 64px rgba(0,0,0,0.2)', width:'100%', maxWidth:500, maxHeight:'92vh', overflowY:'auto', animation:'slideUp 0.22s ease' }}
          >
            {/* Modal header */}
            <div style={{ padding:'18px 24px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#fff', zIndex:1, borderRadius:'20px 20px 0 0' }}>
              <div>
                <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:'#0f172a' }}>Edit Profile</h2>
                <p style={{ margin:'2px 0 0', fontSize:12, color:'#94a3b8' }}>Update your personal information</p>
              </div>
              <button onClick={() => setEditOpen(false)} style={{ width:32, height:32, borderRadius:'50%', border:'1px solid #e2e8f0', background:'#f8fafc', cursor:'pointer', fontSize:18, color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding:'20px 24px 24px', display:'flex', flexDirection:'column', gap:16 }}>
              {/* Photo upload */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <div style={{ position:'relative' }}>
                  <div style={{ width:88, height:88, borderRadius:'50%', overflow:'hidden', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:800, color:'#fff', border:'4px solid #e0e7ff' }}>
                    {(preview || imgSrc)
                      ? <img src={preview || imgSrc} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <span>{initials}</span>
                    }
                  </div>
                  <button type="button" onClick={() => fileRef.current.click()} style={{ position:'absolute', bottom:2, right:2, width:28, height:28, borderRadius:'50%', background:'#6366f1', border:'2.5px solid #fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>📷</button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => { const f=e.target.files[0]; if(f){setFormData(p=>({...p,profile_image:f})); setPreview(URL.createObjectURL(f));} }} />
                <span style={{ fontSize:11, color:'#94a3b8' }}>Click 📷 to change photo</span>
              </div>

              {/* Fields */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:13 }}>
                {[
                  { label:'Full Name',       name:'name',        type:'text', required:true, full:true },
                  { label:"Father's Name",   name:'father_name', type:'text' },
                  { label:'Phone',           name:'phone',       type:'tel' },
                  { label:'College',         name:'college',     type:'text', full:true },
                  { label:'Education',       name:'education',   type:'text' },
                  { label:'Address',         name:'address',     type:'text' },
                ].map(({ label, name, type, required, full }) => (
                  <div key={name} style={{ gridColumn: full ? '1/-1' : 'auto' }}>
                    <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#64748b', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                      {label}{required && <span style={{ color:'#f43f5e', marginLeft:2 }}>*</span>}
                    </label>
                    <input
                      type={type} name={name} value={formData[name]} required={required}
                      onChange={e => setFormData(p=>({...p,[e.target.name]:e.target.value}))}
                      style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:13, color:'#0f172a', outline:'none', background:'#fafafa', boxSizing:'border-box', transition:'border-color 0.15s, box-shadow 0.15s' }}
                      onFocus={e=>{ e.target.style.borderColor='#6366f1'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.1)'; }}
                      onBlur={e=>{ e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none'; }}
                    />
                  </div>
                ))}
              </div>

              {saveMsg.text && (
                <div style={{ padding:'10px 14px', background: saveMsg.type==='success'?'#f0fdf4':'#fef2f2', border:`1px solid ${saveMsg.type==='success'?'#bbf7d0':'#fecaca'}`, borderRadius:10, fontSize:13, color: saveMsg.type==='success'?'#16a34a':'#dc2626' }}>
                  {saveMsg.type==='success'?'✓':'⚠️'} {saveMsg.text}
                </div>
              )}

              <div style={{ display:'flex', gap:10, paddingTop:4 }}>
                <button type="button" onClick={() => setEditOpen(false)} style={{ flex:1, padding:'11px 0', border:'1.5px solid #e2e8f0', borderRadius:10, background:'#fff', fontSize:13, fontWeight:600, color:'#64748b', cursor:'pointer' }}>Cancel</button>
                <button type="submit" disabled={isSaving} style={{ flex:2, padding:'11px 0', border:'none', borderRadius:10, fontSize:13, fontWeight:700, color:'#fff', cursor: isSaving?'not-allowed':'pointer', background: isSaving?'#a5b4fc':'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: isSaving?'none':'0 4px 12px rgba(99,102,241,0.35)' }}>
                  {isSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes hFade   { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(22px) scale(0.97)} to{opacity:1;transform:none} }
        @keyframes pingDot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.7);opacity:0} }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </>
  );
};

export default Header;