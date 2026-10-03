import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Info, CheckCircle, Car, Navigation } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { openDirections } from '../utils/directions';

export default function ParkingDetails() {
  const { id } = useParams();
  const [parking, setParking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [hours, setHours] = useState(1);
  const [bookingConfirmed, setBookingConfirmed] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedSpot, setSelectedSpot] = useState(null);

  useEffect(() => {
    api.get(`/api/parkings/${id}`)
      .then(res => {
        setParking(res.data);
        if(res.data.floors && res.data.floors.length > 0) {
          setSelectedFloor(res.data.floors[0]);
          if(res.data.floors[0].zones && res.data.floors[0].zones.length > 0) {
            setSelectedZone(res.data.floors[0].zones[0]);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleBook = async () => {
    if (!user) {
      navigate(`/login?redirect=/parking/${id}`);
      return;
    }
    
    setBooking(true);
    try {
      const payload = {
        lotId: id,
        hours,
        spotId: selectedSpot ? selectedSpot.id : null
      };
      const res = await api.post('/api/bookings', payload);
      setBookingConfirmed({
        reference: res.data.reference,
        parkingName: res.data.parkingName || parking.name,
        location: res.data.location || res.data.area || parking.area || parking.location,
        hours,
        spotName: selectedSpot ? `${selectedFloor?.name || ''}-${selectedZone?.name || ''}-${selectedSpot.name}` : 'Auto-Assigned'
      });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to book');
      setBooking(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading details...</div>;
  if (!parking) return <div className="text-center py-12">Parking not found</div>;

  const handleFloorChange = (f) => {
    setSelectedFloor(f);
    setSelectedZone(f.zones?.[0] || null);
    setSelectedSpot(null);
  };

  if (bookingConfirmed) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <div className="card text-center" style={{ padding: '2.5rem' }}>
          <CheckCircle size={48} color="var(--success-color, #16a34a)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Booking Confirmed!</h2>
          <p className="text-muted mb-4">Reference: <strong>{bookingConfirmed.reference}</strong></p>

          <div style={{ backgroundColor: '#f9fafb', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'left', marginBottom: '1.5rem' }}>
            <div className="font-bold text-lg mb-1">{bookingConfirmed.parkingName}</div>
            <div className="text-muted text-sm flex items-center gap-1 mb-2">
              <MapPin size={14} /> {bookingConfirmed.location}
            </div>
            <div className="text-sm"><strong>Duration:</strong> {bookingConfirmed.hours} Hour(s)</div>
            <div className="text-sm"><strong>Spot:</strong> {bookingConfirmed.spotName}</div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              className="btn btn-primary flex items-center gap-2"
              onClick={() => openDirections(bookingConfirmed.parkingName, bookingConfirmed.location)}
            >
              <Navigation size={18} /> Show Directions
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/bookings')}
            >
              My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{parking.name}</h1>
        <div className="text-muted flex items-center gap-2 mb-6" style={{ fontSize: '1.1rem' }}>
          <MapPin size={18} /> {parking.area}
        </div>
        
        <p className="mb-6">{parking.description || 'Premium parking facility.'}</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card bg-light">
            <div className="text-muted mb-1 flex items-center gap-2"><Clock size={16}/> Price</div>
            <div className="font-bold text-xl">₹{parking.pricePerHour}/hr</div>
          </div>
          <div className="card bg-light">
            <div className="text-muted mb-1 flex items-center gap-2"><Info size={16}/> Capacity</div>
            <div className="font-bold text-xl">{parking.capacity} slots</div>
          </div>
        </div>
      </div>
      
      {parking.floors && parking.floors.length > 0 && (
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Select a Spot</h2>
          
          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Floor/Level</label>
              <select className="input" value={selectedFloor?.id || ''} onChange={(e) => handleFloorChange(parking.floors.find(f => f.id == e.target.value))}>
                {parking.floors.map(f => {
                  const availableCount = f.zones?.reduce((acc, z) => 
                    acc + (z.spots?.filter(s => Boolean(s.is_available) || s.status === 'AVAILABLE').length || 0), 0) || 0;
                  return (
                    <option key={f.id} value={f.id}>
                      {f.name} ({availableCount} available)
                    </option>
                  );
                })}
              </select>
            </div>
            {selectedFloor && selectedFloor.zones && selectedFloor.zones.length > 0 && (
              <div>
                <label className="block text-sm font-semibold mb-2">Zone</label>
                <select className="input" value={selectedZone?.id || ''} onChange={(e) => {
                  setSelectedZone(selectedFloor.zones.find(z => z.id == e.target.value));
                  setSelectedSpot(null);
                }}>
                  {selectedFloor.zones.map(z => {
                    const availableCount = z.spots?.filter(s => Boolean(s.is_available) || s.status === 'AVAILABLE').length || 0;
                    return (
                      <option key={z.id} value={z.id}>
                        {z.name} ({availableCount} available)
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          {selectedZone && selectedZone.spots && (
            <div>
              {(() => {
                const availableSpots = selectedZone.spots.filter(s => Boolean(s.is_available) || s.status === 'AVAILABLE');
                return (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-semibold">Available parking spots ({availableSpots.length} available)</label>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '1rem' }}>
                      {availableSpots.map(spot => {
                        const isSelected = selectedSpot?.id === spot.id;
                        return (
                          <button 
                            key={spot.id}
                            onClick={() => setSelectedSpot(spot)}
                            style={{
                              padding: '1rem',
                              borderRadius: '8px',
                              border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                              backgroundColor: isSelected ? '#eff6ff' : 'white',
                              color: 'black',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            <Car size={20} opacity={1} />
                            <span className="font-semibold text-sm">{spot.name}</span>
                          </button>
                        );
                      })}
                    </div>
                    {availableSpots.length === 0 && (
                      <p className="text-muted mt-2 text-sm">No available spots in this zone.</p>
                    )}
                    <p className="text-muted text-xs mt-4" style={{ fontStyle: 'italic', opacity: 0.85 }}>
                      Showing currently accessible parking spaces based on application availability data.
                    </p>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Confirm Booking</h2>
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">Duration (Hours)</label>
          <input 
            type="number" 
            min="1" 
            max="24"
            className="input w-full" 
            value={hours} 
            onChange={(e) => setHours(Number(e.target.value))}
          />
        </div>
        
        <div className="flex justify-between items-center mb-6 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          <span className="font-semibold">Total Price:</span>
          <span className="text-2xl font-bold">₹{parking.pricePerHour * hours}</span>
        </div>

        <button 
          className="btn btn-primary w-full" 
          style={{ padding: '1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
          onClick={handleBook}
          disabled={booking || (parking.floors?.length > 0 && !selectedSpot)}
        >
          {booking ? 'Booking...' : <><CheckCircle size={20} /> Auto Book</>}
        </button>
        {parking.floors?.length > 0 && !selectedSpot && (
          <p className="text-center text-sm text-danger mt-3">Please select a spot or use Auto Book to let us pick one.</p>
        )}
      </div>
    </div>
  );
}
