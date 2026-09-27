import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FlowButton } from './ui/FlowButton';

export default function FloorMap({ floorId }) {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [spotDetail, setSpotDetail] = useState(null);
  const [hours, setHours] = useState(1);
  const [bookingError, setBookingError] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!floorId) return;
    setLoading(true);
    api.get(`/api/floors/${floorId}/spots`)
      .then(res => {
        setSpots(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [floorId]);

  const handleSpotClick = async (spot) => {
    if (spot.status === 'booked') return;
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      const res = await api.get(`/api/spots/${spot.id}`);
      setSpotDetail(res.data);
      setSelectedSpotId(spot.id);
      setHours(1);
      setBookingError('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookingConfirm = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/bookings', {
        spotId: spotDetail.id,
        hours: Number(hours)
      });
      // Navigate to the directions page
      navigate(`/bookings/${res.data.id}/directions`);
    } catch (err) {
      setBookingError(err.response?.data?.error || 'Failed to book');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading spots...</div>;

  // Group by row
  const rows = {};
  spots.forEach(spot => {
    if (!rows[spot.row_label]) rows[spot.row_label] = [];
    rows[spot.row_label].push(spot);
  });

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
        {Object.keys(rows).map(rowLabel => (
          <div key={rowLabel} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ width: '30px', fontWeight: 'bold' }}>{rowLabel}</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {rows[rowLabel].map(spot => {
                const isBooked = spot.status === 'booked';
                return (
                  <button
                    key={spot.id}
                    onClick={() => handleSpotClick(spot)}
                    disabled={isBooked}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                      backgroundColor: isBooked ? '#ef4444' : '#22c55e',
                      color: 'white',
                      cursor: isBooked ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}
                    title={spot.spot_number}
                  >
                    {spot.col_position}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedSpotId && spotDetail && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', background: '#fff' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Book Spot {spotDetail.spot_number}</h2>
            


            {bookingError && <div style={{ color: 'red', marginBottom: '1rem' }}>{bookingError}</div>}
            
            <form onSubmit={handleBookingConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Duration (Hours)</label>
                <input 
                  type="number" 
                  min="1" 
                  value={hours} 
                  onChange={(e) => setHours(e.target.value)} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, textAlign: 'right' }}>
                Total: ₹{hours * spotDetail.price_per_hour}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSelectedSpotId(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
