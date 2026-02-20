import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import { useAuth } from '../components/auth/AuthContext';
import Navbar from '../components/students/Navbar';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StudentDashboard = () => {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Load profile when drawer opens
  const handleProfileLoad = useCallback(async () => {
    if (profile) return;

    setLoadingProfile(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch profile');

      const json = await res.json();
      setProfile(json.data ?? json);
    } catch (err) {
      console.error('Profile fetch error:', err);

      // fallback to auth context data
      setProfile({
        name: user?.name || 'Student',
        email: user?.email || '',
        role: user?.role || 'student',
      });
    } finally {
      setLoadingProfile(false);
    }
  }, [profile, user]);

  const handleProfileSave = useCallback((updated) => {
    setProfile(updated);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header */}
      <Header
        title="Student Dashboard"
        profile={profile}
        loadingProfile={loadingProfile}
        onProfileLoad={handleProfileLoad}
        onProfileSave={handleProfileSave}
        onLogout={logout}
      />

      {/* Navbar below header */}
      <Navbar />

      {/* Page Content */}
      <main style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
        <Outlet context={{ isDashboard: true }} />
      </main>
    </div>
  );
};

export default StudentDashboard;
