import { useState, useEffect } from 'react';
import { X, Calendar, Clock, CreditCard, Car } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function BookingModal({ isOpen, onClose, spot, onSuccess }) {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [duration, setDuration] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && user) {
      api.get('/api/vehicles')
        .then(res => {
          setVehicles(res.data);
          if (res.data.length > 0) setSelectedVehicle(res.data[0].id);
        })
        .catch(err => console.error(err));
    }
  }, [isOpen, user]);

  if (!isOpen || !spot) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="card w-full max-w-md p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
             <X size={24} />
          </button>
          <h2 className="text-xl font-bold mb-4">Login Required</h2>
          <p className="mb-6">You must be logged in to book a parking spot.</p>
          <button onClick={() => navigate('/login?redirect=/book')} className="btn btn-primary w-full">
            Login Now
          </button>
        </div>
      </div>
    );
  }

  const rate = spot.spot_type === 'CAR' || spot.spot_type === 'SUV' || spot.spot_type === 'EV' ? 50 : 20;
  const total = duration * rate;

  const handleConfirm = async () => {
    if (!selectedVehicle) {
      setError('Please add and select a vehicle first.');
      return;
    }
    
    setLoading(true);
    setError('');

    const start_time = new Date();
    const end_time = new Date(start_time.getTime() + duration * 60 * 60 * 1000);

    try {
      const res = await api.post('/api/bookings', {
        spot_id: spot.id,
        vehicle_id: selectedVehicle,
        start_time: start_time.toISOString(),
        end_time: end_time.toISOString(),
        amount: total
      });
      setLoading(false);
      onSuccess(res.data.booking_reference);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to book spot');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="card w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
           <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4">Book Parking Spot</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <div className="mb-4">
          <h3 className="font-bold text-lg">{spot.spot_code}</h3>
          <p className="text-gray-600 text-sm">Type: {spot.spot_type} {spot.is_ev ? '(EV Charging)' : ''}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Select Vehicle</label>
          {vehicles.length === 0 ? (
            <p className="text-sm text-red-600 mb-2">No vehicles found. Please add a vehicle in your profile.</p>
          ) : (
            <select 
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Choose Vehicle --</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.registration_number} ({v.make} {v.model})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">Duration (Hours)</label>
          <div className="flex items-center gap-4">
            <input 
              type="range" min="1" max="12" 
              value={duration} 
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="font-bold text-lg w-12 text-center">{duration}h</span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-600">Rate per hour</span>
            <span>₹{rate}.00</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>₹{total}.00</span>
          </div>
        </div>

        <button 
          className="btn btn-primary w-full flex items-center justify-center gap-2" 
          onClick={handleConfirm}
          disabled={loading || vehicles.length === 0}
        >
          {loading ? 'Processing...' : (
             <>
               <CreditCard size={20} />
               Confirm Booking - ₹{total}.00
             </>
          )}
        </button>
      </div>
    </div>
  );
}
