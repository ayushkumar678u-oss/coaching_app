import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  {
   
    items: [
      { label: 'Dashboard', emoji: '📊', path: '/adminDashboard/dashboard' },
    ],
  },
  {
   
    items: [
      { label: 'Sliders',   emoji: '🖼️', path: '/adminDashboard/sliders' },
    ],
  },
    {
   
    items: [
      { label: 'Course',   emoji: '�', path: '/adminDashboard/course' },
    ],
  },
  {
   
    items: [
      { label: 'Payments',   emoji: '💳', path: '/adminDashboard/payments' },
    ],
  },
  {
   
    items: [
      { label: 'Support',   emoji: '📞', path: '/adminDashboard/support' },
    ],
  },
];

export const SIDEBAR_COLLAPSED_W = 72;
export const SIDEBAR_EXPANDED_W  = 256;
export const COLLAPSED_W = 72;
export const EXPANDED_W  = 256;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600&display=swap');

  .sidebar-root * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'DM Sans', sans-serif; }

  .sidebar-root {
    --accent: #fbbf24;
    --text-muted: rgba(255,255,255,0.55);
    --glass-border: rgba(255,255,255,0.18);
  }

  .sidebar-aside {
    position: fixed; top: 0; left: 0; bottom: 0;
    display: flex; flex-direction: column;
    overflow-x: hidden; overflow-y: auto;
    z-index: 40;
    background: linear-gradient(160deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    border-right: 1px solid var(--glass-border);
    box-shadow: 4px 0 40px rgba(102,126,234,0.35);
    transition: width 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s ease;
  }

  .sidebar-aside::before {
    content: '';
    position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none; z-index: 0;
  }
  .sidebar-aside > * { position: relative; z-index: 1; }

  .brand-row {
    height: 68px; display: flex; align-items: center; gap: 12px;
    padding: 0 16px; border-bottom: 1px solid var(--glass-border);
    flex-shrink: 0; background: rgba(255,255,255,0.06); backdrop-filter: blur(8px);
  }

  .logo-circle {
    width: 38px; height: 38px; border-radius: 10px;
    background: rgba(255,255,255,0.2); border: 1.5px solid rgba(255,255,255,0.4);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3);
  }

  .brand-text-title {
    font-family: 'Playfair Display', serif;
    font-size: 16px; font-weight: 600; color: #fff; letter-spacing: 0.02em;
  }
  .brand-text-sub {
    font-size: 10px; color: var(--text-muted);
    letter-spacing: 0.08em; text-transform: uppercase; margin-top: 1px;
  }

  .toggle-btn {
    margin-left: auto; flex-shrink: 0;
    width: 28px; height: 28px; border-radius: 8px;
    background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25);
    color: #fff; cursor: pointer; font-size: 18px;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s;
  }
  .toggle-btn:hover { background: rgba(255,255,255,0.25); }

  .section-label {
    font-size: 9px; font-weight: 600; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.1em;
    padding: 14px 18px 6px;
  }
  .section-divider { height: 1px; background: var(--glass-border); margin: 8px 14px; }

  .nav-item {
    display: flex; align-items: center; gap: 12px;
    margin: 2px 10px; border-radius: 10px;
    cursor: pointer; transition: background 0.15s, transform 0.12s;
    position: relative; overflow: hidden;
  }
  .nav-item::before {
    content: ''; position: absolute; inset: 0; opacity: 0;
    background: rgba(255,255,255,0.08); transition: opacity 0.15s; border-radius: 10px;
  }
  .nav-item:hover::before { opacity: 1; }
  .nav-item:active { transform: scale(0.98); }

  .nav-item.active {
    background: rgba(255,255,255,0.22);
    box-shadow: 0 2px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.3);
  }
  .nav-item.active::after {
    content: ''; position: absolute;
    right: 0; top: 20%; bottom: 20%;
    width: 3px; border-radius: 2px 0 0 2px;
    background: var(--accent); box-shadow: 0 0 10px var(--accent);
  }

  .nav-icon {
    width: 34px; height: 34px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; flex-shrink: 0;
    background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18);
    transition: background 0.15s, transform 0.15s;
  }
  .nav-item:hover .nav-icon { background: rgba(255,255,255,0.2); transform: scale(1.05); }
  .nav-item.active .nav-icon { background: rgba(255,255,255,0.25); border-color: rgba(255,255,255,0.4); }

  .nav-label {
    font-size: 13.5px; font-weight: 500; color: rgba(255,255,255,0.85);
    white-space: nowrap; overflow: hidden;
    transition: opacity 0.2s, max-width 0.3s;
  }
  .nav-item.active .nav-label { color: #fff; font-weight: 600; }

  .user-card-wrap {
    padding: 12px 10px; border-top: 1px solid var(--glass-border);
    flex-shrink: 0; background: rgba(255,255,255,0.05);
  }
  .user-card {
    display: flex; align-items: center; gap: 10px;
    padding: 10px; border-radius: 10px;
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.18);
    backdrop-filter: blur(8px);
  }
  .user-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(251,191,36,0.4); border: 2px solid rgba(255,255,255,0.3);
  }
  .user-name { font-size: 12.5px; font-weight: 600; color: #fff; }
  .user-role { font-size: 10px; color: var(--text-muted); margin-top: 1px; }

  .expand-fab {
    position: fixed; top: 22px; z-index: 41;
    width: 26px; height: 26px; border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: 2px solid rgba(255,255,255,0.4); color: #fff;
    cursor: pointer; font-size: 14px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px rgba(102,126,234,0.5);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .expand-fab:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(102,126,234,0.65); }

  .mobile-backdrop {
    position: fixed; inset: 0; z-index: 38;
    background: rgba(76,29,149,0.4); backdrop-filter: blur(2px);
  }

  .fade-text { overflow: hidden; white-space: nowrap; transition: opacity 0.25s, max-width 0.3s; }
`;

const Sidebar = ({ collapsed = false, onToggle, userName = 'Admin', userRole = 'Administrator' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hovered,  setHovered]  = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isActive = (path) =>
    location.pathname === path ||
    (path === '/adminDashboard/dashboard' && location.pathname === '/adminDashboard');

  const handleNav = (path) => {
    navigate(path);
    if (isMobile && !collapsed) onToggle?.();
  };

  const hiddenMobile = isMobile && collapsed;
  const iconOnly     = !isMobile && collapsed;

  return (
    <div className="sidebar-root">
      <style>{styles}</style>

      {isMobile && !collapsed && (
        <div className="mobile-backdrop" onClick={onToggle} />
      )}

      <aside
        className="sidebar-aside"
        style={{
          width: iconOnly ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W,
          transform: hiddenMobile ? 'translateX(-100%)' : 'translateX(0)',
        }}
      >
        {/* Brand */}
        <div className="brand-row">
          <div className="logo-circle">🎓</div>
          <div className="fade-text" style={{ opacity: iconOnly ? 0 : 1, maxWidth: iconOnly ? 0 : 180 }}>
            <div className="brand-text-title">EduAdmin</div>
            <div className="brand-text-sub">Management</div>
          </div>
          {!iconOnly && (
            <button className="toggle-btn" onClick={onToggle} title="Collapse">‹</button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          {NAV_ITEMS.map((group, gi) => (
            <div key={gi} style={{ marginBottom: 4 }}>
              {!iconOnly
                ? <div className="section-label">{group.section}</div>
                : gi > 0 ? <div className="section-divider" /> : null
              }
              {group.items.map((item, ii) => {
                const active = isActive(item.path);
                const key    = `${gi}-${ii}`;
                return (
                  <div
                    key={ii}
                    className={`nav-item${active ? ' active' : ''}`}
                    onClick={() => handleNav(item.path)}
                    onMouseEnter={() => setHovered(key)}
                    onMouseLeave={() => setHovered(null)}
                    title={iconOnly ? item.label : ''}
                    style={{ padding: iconOnly ? '10px 0 10px 19px' : '10px 10px' }}
                  >
                    <div className="nav-icon">{item.emoji}</div>
                    <span
                      className="nav-label"
                      style={{ opacity: iconOnly ? 0 : 1, maxWidth: iconOnly ? 0 : 160 }}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User card */}
        <div className="user-card-wrap">
          <div className="user-card">
            <div className="user-avatar">{(userName || 'A').charAt(0).toUpperCase()}</div>
            <div className="fade-text" style={{ opacity: iconOnly ? 0 : 1, maxWidth: iconOnly ? 0 : 160 }}>
              <div className="user-name">{userName}</div>
              <div className="user-role">{userRole}</div>
            </div>
          </div>
        </div>
      </aside>

      {iconOnly && (
        <button
          className="expand-fab"
          style={{ left: SIDEBAR_COLLAPSED_W - 13 }}
          onClick={onToggle}
          title="Expand sidebar"
        >›</button>
      )}
    </div>
  );
};

export default Sidebar;