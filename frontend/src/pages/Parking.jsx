import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Zap, Accessibility, Map as MapIcon, ChevronRight } from 'lucide-react';

export default function Parking() {
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingError, setBookingError] = useState('');
  
  // Form State
  const [vehicle, setVehicle] = useState('My Car');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [arrival, setArrival] = useState('10:00');
  const [hours, setHours] = useState(2);
  const [isEv, setIsEv] = useState(false);
  const [isAccessible, setIsAccessible] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFloors();
  }, []);

  const fetchFloors = async () => {
    try {
      const res = await api.get('/api/floors/summary');
      setFloors(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAutoBook = async (floorId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setBookingError('');
    try {
      const res = await api.post('/api/bookings/auto', {
        floorId,
        hours: Number(hours),
        vehicleType: vehicle,
        isEv,
        isAccessible
      });
      
      // Navigate to confirmation / directions page
      navigate(`/bookings/${res.data.booking.id}/directions`);
    } catch (err) {
      setBookingError(err.response?.data?.error || 'Failed to auto book');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading parking availability...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-extrabold mb-2 text-gray-900">Nexus Hyderabad Parking</h1>
      <p className="text-gray-600 mb-8 text-lg">Find and reserve your parking spot before you arrive.</p>

      {bookingError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 font-medium">
          {bookingError}
        </div>
      )}

      {/* Booking Parameters Panel */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Vehicle</label>
            <select className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500" value={vehicle} onChange={e => setVehicle(e.target.value)}>
              <option>My Car (Standard)</option>
              <option>Compact Car</option>
              <option>SUV</option>
              <option>Two Wheeler</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
            <input type="date" className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Arrival Time</label>
            <input type="time" className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500" value={arrival} onChange={e => setArrival(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (Hours)</label>
            <select className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500" value={hours} onChange={e => setHours(e.target.value)}>
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="3">3 hours</option>
              <option value="4">4 hours</option>
              <option value="8">Full Day</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-6 border-t border-gray-100 pt-4 mt-2">
           <label className="flex items-center gap-2 text-sm text-gray-700 font-medium cursor-pointer">
              <input type="checkbox" checked={isEv} onChange={e => setIsEv(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
              <Zap size={16} className="text-green-600" /> EV Charging required
           </label>
           <label className="flex items-center gap-2 text-sm text-gray-700 font-medium cursor-pointer">
              <input type="checkbox" checked={isAccessible} onChange={e => setIsAccessible(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
              <Accessibility size={16} className="text-blue-600" /> Accessible parking required
           </label>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6 text-gray-800">Choose your parking level</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {floors.map(floor => (
          <div key={floor.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                 <div>
                   <h3 className="text-2xl font-extrabold text-gray-900">{floor.name}</h3>
                   <p className="text-gray-500 font-medium">Basement Parking</p>
                 </div>
                 <div className="text-right">
                    <div className="text-3xl font-black text-green-600">{floor.available_spots}</div>
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Available</div>
                 </div>
              </div>
              
              <div className="mt-8 space-y-3">
                 <button 
                   onClick={() => handleAutoBook(floor.id)}
                   disabled={floor.available_spots === 0}
                   className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center transition-colors ${
                     floor.available_spots > 0 
                     ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                     : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                   }`}
                 >
                   {floor.available_spots > 0 ? 'AUTO BOOK' : 'FULL'}
                 </button>
                 
                 <div className="flex justify-between items-center px-1">
                    <span className="text-xs text-gray-500 font-medium">Let us find the best available spot.</span>
                    <button 
                      onClick={() => navigate(`/parking/${floor.id}/map`)}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
                    >
                      View Full Map <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
