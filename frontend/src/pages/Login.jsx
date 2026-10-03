import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState('USER');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await api.post('/api/login', { email, password });
        login(res.data.token, res.data.user);
      } else {
        const res = await api.post('/api/signup', { name, email, password, role });
        login(res.data.token, res.data.user);
      }
      
      const searchParams = new URLSearchParams(location.search);
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', border: '1.5px solid #000', borderRadius: '16px', background: '#fff' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{isLogin ? 'Login to Parking Finder' : 'Create an Account'}</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ padding: '0.75rem', width: '100%', borderRadius: '8px', border: '1px solid #ccc' }}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={role === 'PROVIDER'} onChange={(e) => setRole(e.target.checked ? 'PROVIDER' : 'USER')} />
              Sign up as a Parking Provider
            </label>
          </>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '0.75rem', width: '100%', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '0.75rem', width: '100%', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }}>
          {isLogin ? 'Login' : 'Sign up'}
        </button>
      </form>
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <button onClick={() => setIsLogin(!isLogin)} style={{ textDecoration: 'underline' }}>
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}
