import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Activity, Car, CheckCircle, Database, LayoutDashboard, IndianRupee, PlayCircle, Settings2 } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
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

  const handleSimulation = async (e) => {
    e.preventDefault();
    try {
      // Find spot id by code (simplified, usually we'd have a dropdown)
      // For this demo, let's just assume we need spot ID or we can fetch spots
      // Let's assume the user enters the ID directly, or we can just fetch all spots and find the ID.
      // We will need to fetch spot by code in backend if we want to use code, but backend expects spot_id.
      // Let's modify the backend /simulate/spot endpoint or just assume the user inputs the numeric ID for now.
      
      // Since it's a demo, let's just make the user enter the spot ID (1-20).
      await api.post('/api/admin/simulate/spot', {
        spot_id: parseInt(simSpot),
        new_status: simStatus
      });
      setSimMessage(`Successfully simulated spot ${simSpot} to ${simStatus}`);
      fetchData(); // refresh stats
    } catch (err) {
      setSimMessage(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  if (!stats) return <div className="p-8 text-center">Loading Dashboard...</div>;

  const totalOccupancy = stats.occupancy.reduce((acc, curr) => acc + curr.total_spots, 0);
  const totalAvailable = stats.occupancy.reduce((acc, curr) => acc + curr.available_spots, 0);
  const totalOccupied = stats.occupancy.reduce((acc, curr) => acc + curr.occupied_spots, 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '2rem' }}>
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard size={32} className="text-primary" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6 bg-white border shadow-sm flex items-center gap-4">
           <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Car size={24}/></div>
           <div>
              <div className="text-sm text-gray-500 font-semibold">Total Spots (Demo)</div>
              <div className="text-2xl font-bold">{totalOccupancy}</div>
           </div>
        </div>
        <div className="card p-6 bg-white border shadow-sm flex items-center gap-4">
           <div className="p-3 bg-green-100 text-green-600 rounded-lg"><CheckCircle size={24}/></div>
           <div>
              <div className="text-sm text-gray-500 font-semibold">Available</div>
              <div className="text-2xl font-bold text-green-600">{totalAvailable}</div>
           </div>
        </div>
        <div className="card p-6 bg-white border shadow-sm flex items-center gap-4">
           <div className="p-3 bg-red-100 text-red-600 rounded-lg"><Activity size={24}/></div>
           <div>
              <div className="text-sm text-gray-500 font-semibold">Active Bookings</div>
              <div className="text-2xl font-bold text-red-600">{stats.active_bookings}</div>
           </div>
        </div>
        <div className="card p-6 bg-white border shadow-sm flex items-center gap-4">
           <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><IndianRupee size={24}/></div>
           <div>
              <div className="text-sm text-gray-500 font-semibold">Today's Revenue</div>
              <div className="text-2xl font-bold text-purple-600">₹{stats.revenue_today || 0}</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Occupancy Chart/Table */}
        <div className="lg:col-span-2 card p-6 border shadow-sm bg-white">
           <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Database size={20}/> Zone Occupancy</h2>
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-gray-50 border-b border-t">
                    <th className="p-3 text-sm text-gray-600">Floor</th>
                    <th className="p-3 text-sm text-gray-600">Zone</th>
                    <th className="p-3 text-sm text-gray-600">Total</th>
                    <th className="p-3 text-sm text-gray-600">Available</th>
                    <th className="p-3 text-sm text-gray-600">Occupied</th>
                 </tr>
              </thead>
              <tbody>
                 {stats.occupancy.map((occ, idx) => (
                    <tr key={idx} className="border-b">
                       <td className="p-3 font-semibold">{occ.floor_name}</td>
                       <td className="p-3">{occ.zone_name}</td>
                       <td className="p-3">{occ.total_spots}</td>
                       <td className="p-3 text-green-600 font-semibold">{occ.available_spots}</td>
                       <td className="p-3 text-red-600 font-semibold">{occ.occupied_spots}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>

        {/* Simulation Panel */}
        <div className="card p-6 border shadow-sm bg-white border-blue-200">
           <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-800">
              <Settings2 size={20}/> Occupancy Simulator
           </h2>
           <p className="text-sm text-gray-600 mb-4">
              Demonstrate IoT sensor updates by manually forcing a spot's status.
           </p>
           
           <form onSubmit={handleSimulation} className="space-y-4">
              <div>
                 <label className="block text-sm font-semibold mb-1">Spot ID (e.g. 1-20)</label>
                 <input 
                    type="number" required min="1"
                    className="w-full border p-2 rounded" 
                    value={simSpot} onChange={(e) => setSimSpot(e.target.value)} 
                 />
              </div>
              <div>
                 <label className="block text-sm font-semibold mb-1">New Status</label>
                 <select 
                    className="w-full border p-2 rounded"
                    value={simStatus} onChange={(e) => setSimStatus(e.target.value)}
                 >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="RESERVED">RESERVED</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                 </select>
              </div>
              <button type="submit" className="btn btn-primary w-full flex items-center justify-center gap-2">
                 <PlayCircle size={18}/> Simulate Event
              </button>
           </form>
           {simMessage && <div className="mt-4 text-sm bg-blue-50 p-2 text-blue-800 rounded">{simMessage}</div>}
        </div>
      </div>

      <div className="card p-6 border shadow-sm bg-white mb-8">
         <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-gray-50 border-b border-t">
                     <th className="p-3 text-sm text-gray-600">Ref</th>
                     <th className="p-3 text-sm text-gray-600">User</th>
                     <th className="p-3 text-sm text-gray-600">Spot</th>
                     <th className="p-3 text-sm text-gray-600">Start Time</th>
                     <th className="p-3 text-sm text-gray-600">Status</th>
                     <th className="p-3 text-sm text-gray-600">Amount</th>
                  </tr>
               </thead>
               <tbody>
                  {bookings.slice(0, 10).map((b) => (
                     <tr key={b.id} className="border-b text-sm">
                        <td className="p-3 font-mono text-gray-500">{b.booking_reference}</td>
                        <td className="p-3">{b.user_name} <br/><span className="text-xs text-gray-500">{b.user_email}</span></td>
                        <td className="p-3 font-bold">{b.spot_code}</td>
                        <td className="p-3">{new Date(b.start_time).toLocaleString()}</td>
                        <td className="p-3">
                           <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              b.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                              b.status === 'UPCOMING' ? 'bg-green-100 text-green-800' :
                              b.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                           }`}>
                              {b.status}
                           </span>
                        </td>
                        <td className="p-3 font-semibold text-green-700">₹{b.amount}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
            {bookings.length === 0 && <div className="p-4 text-center text-gray-500">No bookings found.</div>}
         </div>
      </div>
    </div>
  );
}
