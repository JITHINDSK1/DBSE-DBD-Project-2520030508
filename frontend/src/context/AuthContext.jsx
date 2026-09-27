import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setModeState] = useState(localStorage.getItem('pf_mode') || 'user');

  const setMode = (newMode) => {
    localStorage.setItem('pf_mode', newMode);
    setModeState(newMode);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/api/me')
        .then(res => {
          setUser(res.data);
        })
        .catch(err => {
          console.error('Failed to fetch user', err);
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setMode('user'); // Reset to user mode on logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, mode, setMode }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

