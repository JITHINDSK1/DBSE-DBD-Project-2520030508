import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    setLoading(true);
    api.get('/api/provider/bookings')
      .then(res => {
        setBookings(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  if (loading) return <div className="text-center py-12">Loading bookings...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="mb-8">
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Provider Bookings</h1>
        <p className="text-muted mt-1">View all bookings across your parking lots</p>
      </div>

      <div className="card" style={{ overflowX: 'auto', padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: '#f9fafb' }}>
              <th className="p-4 font-semibold text-sm">Booking Ref</th>
              <th className="p-4 font-semibold text-sm">User</th>
              <th className="p-4 font-semibold text-sm">Parking Lot</th>
              <th className="p-4 font-semibold text-sm">Spot Details</th>
              <th className="p-4 font-semibold text-sm">Date & Time</th>
              <th className="p-4 font-semibold text-sm">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-muted">No bookings found for your lots.</td>
              </tr>
            ) : (
              bookings.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td className="p-4 font-mono text-sm font-semibold">{b.reference}</td>
                  <td className="p-4">
                    <div className="font-semibold">{b.user_name}</div>
                    <div className="text-xs text-muted">{b.user_email}</div>
                  </td>
                  <td className="p-4 font-semibold">{b.parking_name}</td>
                  <td className="p-4">
                    <div className="text-sm">F: {b.floor_name}</div>
                    <div className="text-xs text-muted">Z: {b.zone_name} | S: {b.spot_name}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">{new Date(b.start_time).toLocaleDateString()}</div>
                    <div className="text-xs text-muted">{new Date(b.start_time).toLocaleTimeString()}</div>
                  </td>
                  <td className="p-4">
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      backgroundColor: b.status === 'confirmed' ? '#dcfce7' : '#f3f4f6',
                      color: b.status === 'confirmed' ? '#166534' : '#4b5563',
                    }}>
                      {b.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
