import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Car, PlayCircle, Info } from 'lucide-react';
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
            const isActive = booking.status === 'ACTIVE';
            const isUpcoming = booking.status === 'UPCOMING';
            const isCompleted = booking.status === 'COMPLETED';
            const isCancelled = booking.status === 'CANCELLED';
            
            return (
              <div key={booking.id} className="card p-6 border shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      Forum Sujana Mall
                    </h3>
                    <div className="text-sm text-gray-500 font-mono">Ref: {booking.booking_reference}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    isActive ? 'bg-blue-100 text-blue-800' :
                    isUpcoming ? 'bg-green-100 text-green-800' :
                    isCancelled ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {isActive && <PlayCircle size={14} />}
                    {isUpcoming && <CheckCircle size={14} />}
                    {isCancelled && <XCircle size={14} />}
                    {isCompleted && <Info size={14} />}
                    {booking.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border mb-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Parking Details</div>
                    <div className="font-semibold">{booking.floor_name}, {booking.zone_name}</div>
                    <div className="text-lg font-bold text-primary">Spot: {booking.spot_code}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Vehicle</div>
                    <div className="font-semibold flex items-center justify-end gap-1">
                      <Car size={14} /> {booking.registration_number}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Start Time</div>
                    <div className="font-semibold text-sm">
                       {new Date(booking.start_time).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">End Time</div>
                    <div className="font-semibold text-sm">
                       {new Date(booking.end_time).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Total Paid</div>
                    <div className="font-bold text-lg">₹{booking.amount}</div>
                  </div>
                </div>
                
                {(isUpcoming || isActive) && (
                  <div className="flex justify-end mt-4 pt-4 border-t">
                    <button 
                      className="btn btn-outline text-red-600 border-red-600 hover:bg-red-50"
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
