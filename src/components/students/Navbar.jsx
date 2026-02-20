import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600&display=swap');

  .student-navbar * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }

  .student-navbar {
    width: 100%;
    background: linear-gradient(90deg,#667eea 0%,#764ba2 60%,#f093fb 100%);
    color: #fff;
    box-shadow: 0 6px 20px rgba(99,102,241,0.18);
    top: 0;
    z-index: 100;
  }

  /* ── Top bar ── */
  .student-navbar-inner {
    display: flex;
    align-items: center;
    padding: 12px 24px;
    gap: 16px;
  }

  /* Brand */
  .student-brand { display: flex; align-items: center; gap: 12px; flex-shrink: 0; text-decoration: none; color: #fff; }
  .student-logo {
    width: 42px; height: 42px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.15); font-size: 20px; flex-shrink: 0;
  }
  .student-brand-title { font-family: 'Playfair Display', serif; font-weight: 600; font-size: 16px; line-height: 1.2; }
  .student-brand-sub   { font-size: 10px; opacity: 0.8; }

  /* Desktop nav */
  .student-nav {
    display: flex; gap: 4px; align-items: center; margin-left: auto;
  }
  .student-link {
    padding: 9px 13px; border-radius: 10px;
    color: rgba(255,255,255,0.88); text-decoration: none;
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 14px; font-weight: 500;
    transition: background 0.15s, transform 0.1s;
    white-space: nowrap;
  }
  .student-link:hover  { background: rgba(255,255,255,0.12); transform: translateY(-1px); }
  .student-link.active { background: rgba(255,255,255,0.2); color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.1); }

  /* Hamburger button */
  .student-hamburger {
    display: none;
    flex-direction: column; justify-content: center; align-items: center;
    gap: 5px; width: 40px; height: 40px;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 10px; cursor: pointer;
    margin-left: auto; flex-shrink: 0;
    padding: 0;
  }
  .student-hamburger span {
    display: block; width: 20px; height: 2px;
    background: #fff; border-radius: 2px;
    transition: transform 0.25s, opacity 0.25s;
    transform-origin: center;
  }
  .student-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .student-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .student-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  /* Mobile drawer */
  .student-mobile-nav {
    display: none;
    flex-direction: column;
    gap: 4px;
    padding: 10px 16px 16px;
    border-top: 1px solid rgba(255,255,255,0.12);
    animation: slideDown 0.22s ease;
  }
  .student-mobile-nav.open { display: flex; }

  .student-mobile-link {
    padding: 11px 14px; border-radius: 10px;
    color: rgba(255,255,255,0.9); text-decoration: none;
    display: flex; align-items: center; gap: 10px;
    font-size: 14px; font-weight: 500;
    transition: background 0.15s;
  }
  .student-mobile-link:hover  { background: rgba(255,255,255,0.1); }
  .student-mobile-link.active { background: rgba(255,255,255,0.2); color: #fff; }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Responsive breakpoints ── */
  @media (max-width: 900px) {
    .student-nav        { display: none; }
    .student-hamburger  { display: flex; }
  }

  @media (max-width: 480px) {
    .student-navbar-inner { padding: 10px 16px; }
    .student-brand-title  { font-size: 14px; }
  }
`;

const NAV_LINKS = [
  { to: '/student/home',             label: 'Home',     icon: '🏠' },
  { to: '/student/courses',          label: 'Courses',  icon: '📚' },
  { to: '/student/videos',           label: 'Videos',   icon: '🎬' },
  { to: '/student/notes',            label: 'Notes',    icon: '📝' },
  { to: '/student/payments-history', label: 'Payments', icon: '💳' },
  { to: '/student/support',          label: 'Support',  icon: '📞' },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    'student-link' + (isActive ? ' active' : '');

  const mobileLinkClass = ({ isActive }) =>
    'student-mobile-link' + (isActive ? ' active' : '');

  return (
    <div className="student-navbar">
      <style>{styles}</style>

      {/* ── Top bar ── */}
      <div className="student-navbar-inner">

        {/* Brand */}
        <div className="student-brand">
          <div className="student-logo">🎓</div>
          <div>
            <div className="student-brand-title">EduStudent</div>
            <div className="student-brand-sub">Learning</div>
          </div>
        </div>

        {/* Desktop nav links */}
        <nav className="student-nav">
          {NAV_LINKS.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              {icon} {label}
            </NavLink>
          ))}
        </nav>

        {/* Hamburger (mobile) */}
        <button
          className={`student-hamburger ${open ? 'open' : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      <nav className={`student-mobile-nav ${open ? 'open' : ''}`}>
        {NAV_LINKS.map(({ to, label, icon }) => (
          <NavLink
            key={to} to={to}
            className={mobileLinkClass}
            onClick={() => setOpen(false)}
          >
            <span style={{ fontSize: 18 }}>{icon}</span> {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Navbar;