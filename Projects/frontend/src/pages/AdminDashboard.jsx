import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Activity, Car, CheckCircle, Database, LayoutDashboard, IndianRupee, PlayCircle, Settings2 } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  
  // Simulator State
  const [floors, setFloors] = useState([]);
  const [simFloor, setSimFloor] = useState('');
  const [zones, setZones] = useState([]);
  const [simZone, setSimZone] = useState('');
  const [spots, setSpots] = useState([]);
  const [simSpot, setSimSpot] = useState('');
  const [simStatus, setSimStatus] = useState('AVAILABLE');
  const [simMessage, setSimMessage] = useState('');
  
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      if (!user || (user.role !== 'ADMIN' && user.role !== 'PROVIDER')) {
        navigate('/');
        return;
      }
      fetchData();
      
      // Load floors for simulator
      api.get('/api/floors/mall/1').then(res => {
         setFloors(res.data.filter(f => f.floor_type === 'PARKING'));
      }).catch(console.error);
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    try {
      const [dashRes, bookRes] = await Promise.all([
        api.get('/api/admin/dashboard'),
        api.get('/api/admin/bookings')
      ]);
      setStats(dashRes.data);
      setBookings(bookRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (simFloor) {
      api.get(`/api/floors/${simFloor}/zones`).then(res => {
         setZones(res.data);
         setSimZone(''); setSimSpot(''); setSpots([]);
      }).catch(console.error);
    }
  }, [simFloor]);

  useEffect(() => {
    if (simZone) {
      api.get(`/api/spots/zone/${simZone}`).then(res => {
         setSpots(res.data);
         setSimSpot('');
      }).catch(console.error);
    }
  }, [simZone]);

  const handleSimulation = async (e) => {
    e.preventDefault();
    if (!simSpot) {
       setSimMessage('Please select a spot.');
       return;
    }
    try {
      await api.post('/api/admin/simulate/spot', {
        spot_id: parseInt(simSpot),
        new_status: simStatus
      });
      setSimMessage(`Successfully simulated spot status to ${simStatus}`);
      fetchData(); // refresh stats
      
      // Auto-clear message after 3 seconds
      setTimeout(() => setSimMessage(''), 3000);
    } catch (err) {
      setSimMessage(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  if (!stats) return <div className="container py-12 text-center text-muted">Loading Dashboard...</div>;

  const totalOccupancy = stats.occupancy.reduce((acc, curr) => acc + curr.total_spots, 0);
  const totalAvailable = stats.occupancy.reduce((acc, curr) => acc + curr.available_spots, 0);

  return (
    <div className="container py-8 fade-in">
      <div className="flex items-center gap-4 mb-8">
        <LayoutDashboard size={32} className="text-primary-color" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="metrics-grid mb-8">
        <div className="card flex items-center gap-4">
           <div className="metric-icon icon-gray" style={{margin:0}}><Car size={24}/></div>
           <div>
              <div className="text-sm font-semibold text-muted uppercase">Total Spots</div>
              <div className="text-2xl font-bold">{totalOccupancy}</div>
           </div>
        </div>
        <div className="card flex items-center gap-4 border-green bg-green-light">
           <div className="metric-icon icon-green" style={{margin:0}}><CheckCircle size={24}/></div>
           <div>
              <div className="text-sm font-semibold text-green-dark uppercase">Available</div>
              <div className="text-2xl font-bold text-green-main">{totalAvailable}</div>
           </div>
        </div>
        <div className="card flex items-center gap-4 border-red bg-red-light">
           <div className="metric-icon icon-red" style={{margin:0}}><Activity size={24}/></div>
           <div>
              <div className="text-sm font-semibold text-red-dark uppercase">Active Bookings</div>
              <div className="text-2xl font-bold text-red-main">{stats.active_bookings}</div>
           </div>
        </div>
        <div className="card flex items-center gap-4">
           <div className="metric-icon" style={{margin:0, background:'#f3e8ff', color:'#9333ea'}}><IndianRupee size={24}/></div>
           <div>
              <div className="text-sm font-semibold text-muted uppercase">Today's Revenue</div>
              <div className="text-2xl font-bold" style={{color:'#9333ea'}}>₹{stats.revenue_today || 0}</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 mb-8">
        {/* Occupancy Chart/Table */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
           <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Database size={20}/> Zone Occupancy</h2>
           <div style={{ overflowX: 'auto' }}>
             <table className="w-full" style={{ borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                   <tr style={{ background: 'var(--bg-color)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Floor</th>
                      <th style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Zone</th>
                      <th style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total</th>
                      <th style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Available</th>
                      <th style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Occupied</th>
                   </tr>
                </thead>
                <tbody>
                   {stats.occupancy.map((occ, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                         <td style={{ padding: '0.75rem', fontWeight: 600 }}>{occ.floor_name}</td>
                         <td style={{ padding: '0.75rem' }}>{occ.zone_name}</td>
                         <td style={{ padding: '0.75rem' }}>{occ.total_spots}</td>
                         <td style={{ padding: '0.75rem' }} className="text-green-main font-semibold">{occ.available_spots}</td>
                         <td style={{ padding: '0.75rem' }} className="text-red-main font-semibold">{occ.occupied_spots}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
           </div>
        </div>

        {/* Simulation Panel */}
        <div className="card" style={{ borderColor: '#bfdbfe', background: '#f8fafc' }}>
           <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#1e40af' }}>
              <Settings2 size={20}/> Occupancy Simulator
           </h2>
           <p className="text-sm text-muted mb-4">
              Demonstrate IoT sensor updates by manually forcing a spot's status.
           </p>
           
           <form onSubmit={handleSimulation} className="flex flex-col gap-4">
              <div>
                 <label className="text-sm font-semibold mb-2" style={{display:'block'}}>1. Floor</label>
                 <select className="w-full" value={simFloor} onChange={(e) => setSimFloor(e.target.value)} required>
                    <option value="">Select Level</option>
                    {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                 </select>
              </div>
              
              <div>
                 <label className="text-sm font-semibold mb-2" style={{display:'block'}}>2. Zone</label>
                 <select className="w-full" value={simZone} onChange={(e) => setSimZone(e.target.value)} required disabled={!simFloor}>
                    <option value="">Select Zone</option>
                    {zones.map(z => <option key={z.id} value={z.id}>{z.zone_name}</option>)}
                 </select>
              </div>

              <div>
                 <label className="text-sm font-semibold mb-2" style={{display:'block'}}>3. Spot</label>
                 <select className="w-full" value={simSpot} onChange={(e) => setSimSpot(e.target.value)} required disabled={!simZone}>
                    <option value="">Select Spot</option>
                    {spots.map(s => <option key={s.id} value={s.id}>{s.spot_code} ({s.status})</option>)}
                 </select>
              </div>

              <div>
                 <label className="text-sm font-semibold mb-2" style={{display:'block'}}>4. Force Status</label>
                 <select className="w-full font-semibold" value={simStatus} onChange={(e) => setSimStatus(e.target.value)} required>
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="RESERVED">RESERVED</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                 </select>
              </div>
              
              <button type="submit" className="btn btn-primary w-full flex items-center justify-center gap-2 mt-2">
                 <PlayCircle size={18}/> Simulate Event
              </button>
           </form>
           {simMessage && (
             <div className="mt-4 p-3 rounded text-sm font-semibold" style={{ background: simMessage.includes('Error') ? '#fef2f2' : '#dcfce7', color: simMessage.includes('Error') ? '#991b1b' : '#166534' }}>
               {simMessage}
             </div>
           )}
        </div>
      </div>

      <div className="card mb-8">
         <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
         <div style={{ overflowX: 'auto' }}>
            <table className="w-full" style={{ borderCollapse: 'collapse', textAlign: 'left' }}>
               <thead>
                  <tr style={{ background: 'var(--bg-color)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                     <th style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Ref</th>
                     <th style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>User</th>
                     <th style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Spot</th>
                     <th style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Start Time</th>
                     <th style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Status</th>
                     <th style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Amount</th>
                  </tr>
               </thead>
               <tbody>
                  {bookings.slice(0, 10).map((b) => (
                     <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{b.booking_reference}</td>
                        <td style={{ padding: '0.75rem' }}>{b.user_name} <br/><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.user_email}</span></td>
                        <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{b.spot_code}</td>
                        <td style={{ padding: '0.75rem' }}>{new Date(b.start_time).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td style={{ padding: '0.75rem' }}>
                           <span className={`badge ${
                              b.status === 'ACTIVE' ? 'bg-blue-light text-blue-dark' :
                              b.status === 'UPCOMING' ? 'bg-green-light text-green-dark' :
                              b.status === 'CANCELLED' ? 'bg-red-light text-red-dark' :
                              'bg-gray text-muted badge-outline'
                           }`}>
                              {b.status}
                           </span>
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }} className="text-green-main">₹{b.amount}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
            {bookings.length === 0 && <div className="text-center py-8 text-muted">No bookings found.</div>}
         </div>
      </div>
    </div>
  );
}
