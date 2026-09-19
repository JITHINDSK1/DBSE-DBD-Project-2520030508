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
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        const res = await api.post('/api/auth/login', { email, password });
        login(res.data.token, res.data.user);
      } else {
        const res = await api.post('/api/auth/signup', { name, email, password });
        login(res.data.token, res.data.user);
      }
      
      const searchParams = new URLSearchParams(location.search);
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect);
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.error || 'Invalid credentials. Please try again.');
      } else if (err.request) {
        setError('Unable to connect to authentication server.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center fade-in" style={{ minHeight: '60vh', padding: '2rem' }}>
      <div className="card w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Login to Nexus Parking' : 'Create an Account'}
        </h2>
        
        {error && (
          <div className="error-msg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div>
              <label className="text-sm font-semibold mb-2" style={{ display: 'block' }}>Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full"
              />
            </div>
          )}
          
          <div>
            <label className="text-sm font-semibold mb-2" style={{ display: 'block' }}>Email Address</label>
            <input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-sm font-semibold mb-2" style={{ display: 'block' }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-full mt-4"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign up')}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="font-semibold text-primary-color"
            style={{ textDecoration: 'underline', textUnderlineOffset: '4px' }}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
