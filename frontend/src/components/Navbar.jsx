import { Link, useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { NavHeader } from './ui/NavHeader';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, mode, setMode } = useAuth();
  const navigate = useNavigate();

  const handleModeSwitch = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const newMode = mode === 'user' ? 'provider' : 'user';
    setMode(newMode);
    navigate(newMode === 'provider' ? '/provider/lots' : '/');
  };

  return (
    <nav style={{
      backgroundColor: 'var(--surface-color)',
      borderBottom: '1.5px solid var(--border-color)',
      padding: '0.75rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
        
        {/* Left: Logo */}
        <div>
          <Link to="/" className="flex items-center gap-2" style={{ fontWeight: 800, fontSize: '1.25rem', color: '#000000', letterSpacing: '-0.5px' }}>
            <MapPin size={24} />
            <span>Parking Finder</span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <div style={{ justifySelf: 'center' }}>
          <NavHeader />
        </div>

        {/* Right: Auth */}
        <div style={{ justifySelf: 'end' }}>
          <div className="flex items-center gap-4">
            {user && (user.role === 'PROVIDER' || user.role === 'ADMIN') && (
              <button onClick={handleModeSwitch} style={{ fontSize: '0.9rem', fontWeight: 600, textDecoration: 'underline', color: 'var(--text-muted)' }}>
                {mode === 'user' ? 'Switch to Provider' : 'Switch to User'}
              </button>
            )}
            {user ? (
              <div className="flex items-center gap-4">
                <span className="font-semibold">{user.name}</span>
                <button onClick={logout} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                Login / Sign up
              </Link>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}
