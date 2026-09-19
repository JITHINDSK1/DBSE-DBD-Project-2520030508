import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Clock, Shield, Star, Navigation } from 'lucide-react';
import { FlowButton } from '../components/ui/FlowButton';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function ParkingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loc, setLoc] = useState(null);
  const [hours, setHours] = useState(1);
  const [error, setError] = useState('');
  
  useEffect(() => {
    api.get(`/api/parkings/${id}`)
      .then(res => setLoc(res.data))
      .catch(err => console.error(err));
      
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('book') === 'true') {
      setIsModalOpen(true);
    }
  }, [id, location.search]);

  const handleBookingConfirm = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/bookings', {
        parkingId: loc._id,
        hours: Number(hours)
      });
      setIsModalOpen(false);
      navigate('/bookings');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book');
    }
  };

  if (!loc) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
      <button 
        className="btn btn-outline mb-4"
        onClick={() => navigate('/')}
      >
        &larr; Back to Search
      </button>

      <div className="card" style={{ padding: '2rem' }}>
        <div className="flex justify-between items-center mb-4">
          <h1 style={{ fontSize: '2rem' }}>{loc.name}</h1>
          <div className="flex items-center gap-1 font-bold" style={{ border: '1px solid #000', padding: '0.5rem 1rem', borderRadius: '999px' }}>
            <Star size={18} fill="currentColor" />
            <span>4.8</span>
          </div>
        </div>

        <p className="text-muted flex items-center gap-2 mb-6" style={{ fontSize: '1.1rem' }}>
          <MapPin size={20} /> {loc.address}, {loc.city}
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ border: '1.5px solid #000', padding: '1rem', borderRadius: '50%' }}>
              <Clock size={24} />
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.9rem' }}>Operating Hours</div>
              <div className="font-semibold">{loc.openTime} - {loc.closeTime}</div>
            </div>
          </div>
          
          <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ border: '1.5px solid #000', padding: '1rem', borderRadius: '50%' }}>
              <Shield size={24} className="text-success" />
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.9rem' }}>Availability</div>
              <div className="font-semibold text-success">{loc.availableSlots} / {loc.totalSlots} slots</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center" style={{ 
          backgroundColor: '#f9fafb', 
          padding: '1.5rem', 
          borderRadius: 'var(--radius-md)',
          border: '1.5px solid var(--border-color)'
        }}>
          <div>
            <div className="text-muted mb-1">Standard Rate</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹{loc.pricePerHour}<span className="text-muted" style={{ fontSize: '1rem', fontWeight: 400 }}>/hour</span></div>
          </div>
          <FlowButton 
            text="Book Now" 
            onClick={() => {
              if (!user) {
                navigate(`/login?redirect=${encodeURIComponent(location.pathname + '?book=true')}`);
              } else {
                setIsModalOpen(true);
              }
            }} 
            style={{ padding: '0.5rem 1.5rem', fontSize: '1rem' }} 
          />
        </div>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', background: '#fff' }}>
            <h2 style={{ marginBottom: '1rem' }}>Book Parking</h2>
            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleBookingConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Duration (Hours)</label>
                <input 
                  type="number" 
                  min="1" 
                  value={hours} 
                  onChange={(e) => setHours(e.target.value)} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                />
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, textAlign: 'right' }}>
                Total: ₹{hours * loc.pricePerHour}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
