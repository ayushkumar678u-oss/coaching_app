import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar, { SIDEBAR_COLLAPSED_W, SIDEBAR_EXPANDED_W } from '../components/admin/Sidebar';
import Header from '../components/common/Header';
import { useAuth } from '../components/auth/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const [collapsed,      setCollapsed]      = useState(false);
  const [profile,        setProfile]        = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isMobile]                          = useState(window.innerWidth < 768);

  const sidebarW = isMobile ? 0 : (collapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W);

  // Called when the user opens the profile drawer
  const handleProfileLoad = useCallback(async () => {
    if (profile) return; // already loaded, skip
    setLoadingProfile(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const json = await res.json();
      setProfile(json.data ?? json);
    } catch (err) {
      console.error('Profile fetch error:', err);
      // Fallback to auth context data so drawer never shows "Could not load"
      setProfile({
        name:  user?.name  || 'Admin',
        email: user?.email || '',
        role:  user?.role  || 'admin',
      });
    } finally {
      setLoadingProfile(false);
    }
  }, [profile, user]);

  const handleProfileSave = useCallback((updated) => {
    setProfile(updated);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4ff' }}>

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(prev => !prev)}
        userName={user?.name || 'Admin'}
        userRole={user?.role || 'Administrator'}
      />

      <div
        style={{
          marginLeft: sidebarW,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
        }}
      >
        <Header
          title="Dashboard"
          showMenu={isMobile}
          menuOpen={!collapsed}
          onMenuClick={() => setCollapsed(prev => !prev)}
          profile={profile}
          loadingProfile={loadingProfile}
          onProfileLoad={handleProfileLoad}
          onProfileSave={handleProfileSave}
          onLogout={logout}
        />
         

        <main style={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AdminDashboard;