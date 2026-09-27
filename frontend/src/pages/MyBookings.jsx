import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/bookings');
      return;
    }
    
    if (user) {
      fetchBookings();
    }
  }, [user, authLoading, navigate]);

  const fetchBookings = () => {
    api.get('/api/bookings')
      .then(res => {
        setBookings(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const cancelBooking = async (id) => {
    try {
      await api.patch(`/api/bookings/${id}/cancel`);
      fetchBookings(); // refresh list
    } catch (err) {
      alert('Failed to cancel booking');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No bookings yet</h3>
          <p className="text-muted mb-4">You haven't booked any parking spots.</p>
          <Link to="/" className="btn btn-primary">Find Parking</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {bookings.map(booking => {
            const isConfirmed = booking.status === 'confirmed';
            
            return (
              <div key={booking._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      {booking.floor_name} - Spot {booking.spot_number}
                    </h3>
                  </div>
                  <div style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '999px', 
                    fontSize: '0.85rem', 
                    fontWeight: 600,
                    backgroundColor: isConfirmed ? '#dcfce7' : '#f3f4f6',
                    color: isConfirmed ? '#166534' : '#4b5563',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    {isConfirmed ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {booking.status.toUpperCase()}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>Start Time</div>
                    <div className="font-semibold flex items-center gap-1">
                      <Calendar size={14} /> {new Date(booking.startTime).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>Duration</div>
                    <div className="font-semibold flex items-center gap-1">
                      <Clock size={14} /> {booking.hours} Hours
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>Total Paid</div>
                    <div className="font-bold" style={{ fontSize: '1.1rem' }}>₹{booking.totalPrice}</div>
                  </div>
                </div>
                
                {isConfirmed && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                    <Link
                      to={`/bookings/${booking._id}/directions`}
                      className="btn btn-outline"
                      style={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                    >
                      View Directions
                    </Link>
                    <button 
                      className="btn btn-outline" 
                      style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                      onClick={() => cancelBooking(booking._id)}
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
