import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Car, PlayCircle, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'
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
    api.get('/api/bookings/me')
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
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.patch(`/api/bookings/${id}/cancel`);
      fetchBookings(); // refresh list
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const filteredBookings = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return <div className="container py-12 text-center text-muted">Loading bookings...</div>;

  return (
    <div className="container py-8 max-w-md" style={{ maxWidth: '900px' }}>
      <h1 className="text-4xl font-bold mb-6">My Bookings</h1>

      <div className="flex gap-2 mb-8" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {['ALL', 'UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 'var(--radius-xl)', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="card text-center py-12">
          <h3 className="text-xl font-bold mb-2">No bookings found</h3>
          <p className="text-muted mb-6">You don't have any {filter !== 'ALL' ? filter.toLowerCase() : ''} bookings.</p>
          <Link to="/book" className="btn btn-primary">Find Parking</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6 fade-in">
          {filteredBookings.map(booking => {
            const isActive = booking.status === 'ACTIVE';
            const isUpcoming = booking.status === 'UPCOMING';
            const isCompleted = booking.status === 'COMPLETED';
            const isCancelled = booking.status === 'CANCELLED';
            
            return (
              <div key={booking.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                      <MapPin size={20} className="text-primary-color" /> Nexus Hyderabad
                    </h3>
                    <div className="text-sm text-muted font-semibold" style={{ fontFamily: 'monospace' }}>Ref: {booking.booking_reference}</div>
                  </div>
                  <div className={`badge flex items-center gap-1 ${
                    isActive ? 'bg-blue-light text-blue-dark border border-blue-200' :
                    isUpcoming ? 'bg-green-light text-green-dark border-green' :
                    isCancelled ? 'bg-red-light text-red-dark border-red' :
                    'bg-gray badge-outline'
                  }`} style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}>
                    {isActive && <PlayCircle size={16} />}
                    {isUpcoming && <CheckCircle size={16} />}
                    {isCancelled && <XCircle size={16} />}
                    {isCompleted && <Info size={16} />}
                    {booking.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6" style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div className="text-xs text-muted mb-1 font-semibold uppercase">Parking Details</div>
                    <div className="font-semibold">{booking.floor_name}, {booking.zone_name}</div>
                    <div className="text-lg font-bold text-primary-color">Spot: {booking.spot_code}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="text-xs text-muted mb-1 font-semibold uppercase">Vehicle</div>
                    <div className="font-bold flex items-center justify-end gap-1 text-lg">
                      <Car size={18} /> {booking.registration_number}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-y py-4 mb-4">
                  <div>
                    <div className="text-xs text-muted mb-1 font-semibold uppercase"><Clock size={12} className="inline mr-1" /> Start</div>
                    <div className="font-semibold text-sm">
                       {new Date(booking.start_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted mb-1 font-semibold uppercase"><Clock size={12} className="inline mr-1" /> End</div>
                    <div className="font-semibold text-sm">
                       {new Date(booking.end_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="text-xs text-muted mb-1 font-semibold uppercase">Amount Paid</div>
                    <div className="font-bold text-xl">₹{booking.amount}</div>
                  </div>
                </div>
                
                {(isUpcoming || isActive) && (
                  <div className="flex justify-end mt-4">
                    <button 
                      className="btn btn-outline"
                      style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                      onClick={() => cancelBooking(booking.id)}
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
