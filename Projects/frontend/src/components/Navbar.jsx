import { Link, useNavigate } from 'react-router-dom';
import { MapPin, User as UserIcon } from 'lucide-react';
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
    const newMode = mode === 'user' ? 'admin' : 'user';
    setMode(newMode);
    navigate(newMode === 'admin' ? '/admin/dashboard' : '/');
  };

  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'PROVIDER');

  return (
    <nav style={{
      backgroundColor: 'var(--surface-color)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.75rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: '2rem' }}>
        
        {/* Left: Logo */}
        <div>
          <Link to="/" className="flex items-center gap-2 text-gray-900 hover:opacity-80 transition-opacity">
            <div className="bg-primary text-white p-1.5 rounded-lg">
              <MapPin size={22} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.5px' }}>Nexus Hyderabad</span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <div style={{ justifySelf: 'center' }}>
          <NavHeader />
        </div>

        {/* Right: Auth */}
        <div style={{ justifySelf: 'end' }}>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <button 
                onClick={handleModeSwitch} 
                className="text-sm font-semibold text-gray-500 hover:text-gray-900 underline underline-offset-4"
              >
                {mode === 'user' ? 'Admin Dashboard' : 'User View'}
              </button>
            )}
            
            {user ? (
              <div className="flex items-center gap-4 border-l pl-4">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-100 p-1.5 rounded-full text-gray-600">
                    <UserIcon size={18} />
                  </div>
                  <span className="font-semibold text-sm hidden sm:block">{user.name}</span>
                </div>
                <button 
                  onClick={() => {
                    logout();
                    navigate('/');
                  }} 
                  className="btn btn-outline text-sm px-3 py-1.5"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary text-sm px-4 py-2 shadow-sm font-semibold">
                Login / Sign up
              </Link>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}
