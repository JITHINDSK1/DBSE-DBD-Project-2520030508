import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { ArrowLeft, Info, CreditCard } from 'lucide-react';

export default function BookParking() {
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  
  const [spots, setSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  
  // Booking State (Right Panel)
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [duration, setDuration] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load floors on mount
  useEffect(() => {
    setLoading(true);
    api.get('/api/floors/mall/1')
      .then(res => {
        setFloors(res.data.filter(f => f.floor_type === 'PARKING'));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
      
    if (user) {
      api.get('/api/vehicles').then(res => {
        setVehicles(res.data);
        if (res.data.length > 0) setSelectedVehicle(res.data[0].id);
      }).catch(console.error);
    }
  }, [user]);

  // Load zones when floor selected
  useEffect(() => {
    if (selectedFloor) {
      api.get(`/api/floors/${selectedFloor}/zones`).then(res => {
        setZones(res.data);
        if (res.data.length > 0) setSelectedZone(res.data[0].id);
      }).catch(console.error);
    }
  }, [selectedFloor]);

  // Load spots when zone selected
  useEffect(() => {
    if (selectedZone) {
      fetchSpots();
    }
  }, [selectedZone]);

  const fetchSpots = () => {
      api.get(`/api/spots/zone/${selectedZone}`)
        .then(res => setSpots(res.data))
        .catch(console.error);
  };

  const handleSpotClick = (spot) => {
    setSelectedSpot(spot);
    setBookingError('');
    setBookingSuccess('');
    setDuration(1);
  };

  const handleConfirmBooking = async () => {
    if (!selectedVehicle) {
      setBookingError('Please add and select a vehicle first.');
      return;
    }
    setBookingLoading(true);
    setBookingError('');
    
    const rate = selectedSpot.spot_type === 'BIKE' ? 20 : 50;
    const total = duration * rate;
    const start_time = new Date();
    const end_time = new Date(start_time.getTime() + duration * 60 * 60 * 1000);

    try {
      const res = await api.post('/api/bookings', {
        spot_id: selectedSpot.id,
        vehicle_id: selectedVehicle,
        start_time: start_time.toISOString(),
        end_time: end_time.toISOString(),
        amount: total
      });
      setBookingSuccess(res.data.booking_reference);
      fetchSpots(); // refresh map
    } catch (err) {
      setBookingError(err.response?.data?.error || 'Failed to book spot');
    } finally {
      setBookingLoading(false);
    }
  };

  const getSpotClass = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'spot-available';
      case 'OCCUPIED': return 'spot-occupied';
      case 'RESERVED': return 'spot-reserved';
      case 'MAINTENANCE': return 'spot-maintenance';
      default: return '';
    }
  };

  // Group spots by row for realistic rendering
  const row1 = spots.filter(s => s.spot_row === 1).sort((a,b) => a.spot_column - b.spot_column);
  const row2 = spots.filter(s => s.spot_row === 2).sort((a,b) => a.spot_column - b.spot_column);

  return (
    <div className="container py-8 fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/')} className="btn btn-outline" style={{padding: '0.5rem 1rem'}}>
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-3xl font-bold tracking-tight">Interactive Parking Map</h1>
      </div>

      {/* Navigation Hierarchy */}
      <div className="flex gap-8 mb-8">
        <div style={{ flex: 1 }}>
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">1. Select Level</h3>
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            {floors.map(floor => (
              <button
                key={floor.id}
                className={`btn ${selectedFloor === floor.id ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { setSelectedFloor(floor.id); setSelectedSpot(null); }}
              >
                {floor.name}
              </button>
            ))}
          </div>
        </div>

        {selectedFloor && zones.length > 0 && (
          <div style={{ flex: 1 }}>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">2. Select Zone</h3>
            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
              {zones.map(zone => (
                <button
                  key={zone.id}
                  className={`btn ${selectedZone === zone.id ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => { setSelectedZone(zone.id); setSelectedSpot(null); }}
                >
                  {zone.zone_name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-8">
        
        {/* Main Map Area */}
        <div style={{ gridColumn: 'span 2' }}>
          {selectedZone ? (
            <div className="map-container">
              
              <div className="map-indicator map-entry">ENTRY</div>
              
              <div style={{ minWidth: '600px', margin: '2rem 0' }}>
                {/* Top Driving Lane */}
                <div className="driving-lane">
                  <span className="lane-text">→ → → DRIVING LANE → → →</span>
                </div>
                
                {/* Row 1 */}
                <div className="parking-row">
                  {row1.map(spot => (
                    <div
                      key={spot.id}
                      onClick={() => spot.status === 'AVAILABLE' && handleSpotClick(spot)}
                      className={`parking-spot ${getSpotClass(spot.status)} ${selectedSpot?.id === spot.id ? 'spot-selected' : ''}`}
                    >
                       <span className="spot-id">{spot.spot_code.split('-').pop()}</span>
                       <span className="spot-type">{spot.spot_type}</span>
                       {spot.is_ev && <span className="tag-ev">EV</span>}
                       {spot.is_disabled && <span className="tag-disabled">♿</span>}
                    </div>
                  ))}
                </div>
                
                {/* Divider Line */}
                <div className="map-divider"></div>
                
                {/* Row 2 */}
                <div className="parking-row">
                  {row2.map(spot => (
                    <div
                      key={spot.id}
                      onClick={() => spot.status === 'AVAILABLE' && handleSpotClick(spot)}
                      className={`parking-spot ${getSpotClass(spot.status)} ${selectedSpot?.id === spot.id ? 'spot-selected' : ''}`}
                    >
                       <span className="spot-id">{spot.spot_code.split('-').pop()}</span>
                       <span className="spot-type">{spot.spot_type}</span>
                       {spot.is_ev && <span className="tag-ev">EV</span>}
                    </div>
                  ))}
                </div>

                {/* Bottom Driving Lane */}
                <div className="driving-lane bottom">
                  <span className="lane-text">← ← ← DRIVING LANE ← ← ←</span>
                </div>
              </div>

              <div className="map-indicator map-exit">EXIT</div>
            </div>
          ) : (
            <div className="card text-center text-muted" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Please select a Level and Zone to view the parking map.
            </div>
          )}
          
          <div className="flex justify-center gap-6 mt-4 text-sm text-muted font-semibold">
            <span className="flex items-center gap-2"><div style={{width: 12, height: 12, background: '#dcfce7', border: '2px solid #4ade80'}} /> Available</span>
            <span className="flex items-center gap-2"><div style={{width: 12, height: 12, background: '#fee2e2', border: '2px solid #f87171'}} /> Occupied</span>
            <span className="flex items-center gap-2"><div style={{width: 12, height: 12, background: '#fef9c3', border: '2px solid #facc15'}} /> Reserved</span>
          </div>
        </div>

        {/* Right Panel: Booking Details */}
        <div>
          <div className="card booking-panel shadow-lg">
            <h2 className="text-xl font-bold mb-6" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Booking Details</h2>
            
            {!selectedSpot ? (
               <div className="text-center py-12 text-muted flex flex-col items-center">
                 <Info size={40} className="mb-4" style={{ opacity: 0.5 }} />
                 <p>Select an available spot on the map to proceed with your booking.</p>
               </div>
            ) : bookingSuccess ? (
               <div className="text-center py-8">
                 <div style={{ width: '4rem', height: '4rem', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                 </div>
                 <h3 className="text-2xl font-bold mb-2">Booking Confirmed</h3>
                 <p className="text-muted mb-6">Your spot has been successfully reserved.</p>
                 <div className="receipt-box mb-6 text-left">
                    <p className="text-sm text-muted uppercase tracking-wider">Booking Reference</p>
                    <p className="text-xl font-bold mb-4">{bookingSuccess}</p>
                    <p className="text-sm text-muted uppercase tracking-wider">Spot</p>
                    <p className="text-lg font-bold text-primary-color">{selectedSpot.spot_code}</p>
                 </div>
                 <button onClick={() => navigate('/bookings')} className="btn btn-primary w-full">View My Bookings</button>
               </div>
            ) : !user ? (
               <div className="text-center py-8">
                 <p className="mb-6 text-muted">You must be logged in to reserve this spot.</p>
                 <button onClick={() => navigate('/login?redirect=/book')} className="btn btn-primary w-full">Login to Book</button>
               </div>
            ) : (
               <div className="fade-in">
                 {bookingError && <div className="error-msg">{bookingError}</div>}
                 
                 <div className="flex justify-between items-center mb-6">
                   <div>
                     <p className="text-sm text-muted uppercase tracking-wider">Selected Spot</p>
                     <p className="text-3xl font-bold">{selectedSpot.spot_code}</p>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                     <p className="text-sm text-muted uppercase tracking-wider">Type</p>
                     <p className="font-semibold">{selectedSpot.spot_type} {selectedSpot.is_ev ? '(EV)' : ''}</p>
                   </div>
                 </div>

                 <div className="mb-6">
                    <label className="text-sm font-semibold mb-2" style={{display: 'block'}}>Select Vehicle</label>
                    {vehicles.length === 0 ? (
                      <div className="error-msg">No vehicles found. Please add a vehicle in your profile.</div>
                    ) : (
                      <select 
                        value={selectedVehicle}
                        onChange={(e) => setSelectedVehicle(e.target.value)}
                        className="w-full font-semibold"
                      >
                        <option value="">-- Choose Vehicle --</option>
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.registration_number} ({v.make})
                          </option>
                        ))}
                      </select>
                    )}
                 </div>

                 <div className="mb-6">
                    <label className="text-sm font-semibold mb-2" style={{display: 'block'}}>Duration (Hours)</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" min="1" max="12" 
                        value={duration} 
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        style={{ flex: 1, cursor: 'pointer' }}
                      />
                      <div style={{ background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold' }}>
                        {duration}h
                      </div>
                    </div>
                 </div>

                 <div className="receipt-box mb-6">
                    <div className="flex justify-between items-center mb-2 text-muted">
                      <span>Rate per hour</span>
                      <span className="font-semibold">₹{selectedSpot.spot_type === 'BIKE' ? 20 : 50}.00</span>
                    </div>
                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '1rem 0' }}></div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Total Amount</span>
                      <span className="font-bold text-2xl">₹{duration * (selectedSpot.spot_type === 'BIKE' ? 20 : 50)}.00</span>
                    </div>
                 </div>

                 <button 
                   onClick={handleConfirmBooking}
                   disabled={bookingLoading || vehicles.length === 0}
                   className="btn btn-primary w-full shadow-lg"
                   style={{ padding: '1rem', fontSize: '1.125rem' }}
                 >
                   {bookingLoading ? 'Processing...' : <><CreditCard size={20} style={{marginRight: '0.5rem'}}/> Confirm Reservation</>}
                 </button>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
