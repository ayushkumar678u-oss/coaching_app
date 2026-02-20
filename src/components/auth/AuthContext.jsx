import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiFetch from '../../api/fetch';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    const name = localStorage.getItem('name');

    if (token && role) {
      setUser({ token, role, email, name });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const { id, name, email: userEmail, role, profile_image, token } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('email', userEmail);
      localStorage.setItem('name', name);

      setUser({ id, name, email: userEmail, role, profile_image, token });

      if (role === 'admin') {
        navigate('/adminDashboard');
      } else if (role === 'student') {
        navigate('/student');
      }
    } catch (error) {
      console.error('Login error', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      navigate('/login');
    } catch (error) {
      console.error('Registration error', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);