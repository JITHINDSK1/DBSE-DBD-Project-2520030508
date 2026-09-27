import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { MapPin, ArrowLeft } from 'lucide-react';
import BookingModal from '../components/BookingModal';

export default function BookParking() {
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  
  const [spots, setSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load floors on mount
  useEffect(() => {
    setLoading(true);
    // Hardcoding mall_id = 1
    api.get('/api/floors/mall/1')
      .then(res => {
        // Filter to show only PARKING floors for booking
        setFloors(res.data.filter(f => f.floor_type === 'PARKING'));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Load zones when floor selected
  useEffect(() => {
    if (selectedFloor) {
      setLoading(true);
      api.get(`/api/floors/${selectedFloor}/zones`)
        .then(res => {
          setZones(res.data);
          if (res.data.length > 0) {
              setSelectedZone(res.data[0].id);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [selectedFloor]);

  // Load spots when zone selected
  useEffect(() => {
    if (selectedZone) {
      setLoading(true);
      fetchSpots();
    }
  }, [selectedZone]);

  const fetchSpots = () => {
      api.get(`/api/spots/zone/${selectedZone}`)
        .then(res => {
          setSpots(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
  };

  const handleSpotClick = (spot) => {
    setSelectedSpot(spot);
    setIsModalOpen(true);
  };

  const getSpotColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return '#86efac'; // Green
      case 'OCCUPIED': return '#fca5a5';  // Red
      case 'RESERVED': return '#fde047';  // Yellow
      case 'MAINTENANCE': return '#d1d5db'; // Gray
      default: return '#e5e7eb';
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
      <button onClick={() => navigate('/')} className="btn btn-outline mb-6 flex items-center gap-2">
        <ArrowLeft size={16} /> Back to Mall
      </button>

      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Interactive Parking Map</h1>

      {/* Floor Selector */}
      <div className="mb-8">
        <h3 className="font-semibold mb-3">1. Select Level</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {floors.map(floor => (
            <button
              key={floor.id}
              className={`btn ${selectedFloor === floor.id ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedFloor(floor.id)}
              style={{ minWidth: '120px' }}
            >
              {floor.name}
            </button>
          ))}
          {floors.length === 0 && !loading && <div>No parking floors available.</div>}
        </div>
      </div>

      {/* Zone Selector */}
      {selectedFloor && (
        <div className="mb-8">
          <h3 className="font-semibold mb-3">2. Select Zone</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {zones.map(zone => (
              <button
                key={zone.id}
                className={`btn ${selectedZone === zone.id ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedZone(zone.id)}
              >
                {zone.zone_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Spots Grid */}
      {selectedZone && (
        <div>
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-semibold">3. Select a Spot</h3>
             <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1"><div style={{width: 12, height: 12, borderRadius: '50%', backgroundColor: getSpotColor('AVAILABLE')}}></div> Available</span>
                <span className="flex items-center gap-1"><div style={{width: 12, height: 12, borderRadius: '50%', backgroundColor: getSpotColor('OCCUPIED')}}></div> Occupied</span>
                <span className="flex items-center gap-1"><div style={{width: 12, height: 12, borderRadius: '50%', backgroundColor: getSpotColor('RESERVED')}}></div> Reserved</span>
             </div>
          </div>
          
          <div className="card p-6 bg-gray-50 border">
            {loading ? (
              <div className="text-center py-8">Loading spots...</div>
            ) : spots.length === 0 ? (
              <div className="text-center py-8 text-muted">No spots configured for this zone.</div>
            ) : (
              <div style={{
                display: 'grid',
                // Calculate grid columns based on max column_number in spots
                gridTemplateColumns: `repeat(${Math.max(...spots.map(s => s.spot_column), 5)}, 1fr)`,
                gap: '1rem',
              }}>
                {spots.map(spot => (
                  <div
                    key={spot.id}
                    onClick={() => handleSpotClick(spot)}
                    style={{
                      gridRow: spot.spot_row,
                      gridColumn: spot.spot_column,
                      backgroundColor: getSpotColor(spot.status),
                      height: '80px',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: spot.status === 'AVAILABLE' ? 'pointer' : 'not-allowed',
                      opacity: spot.status === 'AVAILABLE' ? 1 : 0.7,
                      border: '2px solid rgba(0,0,0,0.1)',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'transform 0.1s',
                      transform: 'scale(1)',
                    }}
                    onMouseEnter={(e) => {
                      if (spot.status === 'AVAILABLE') e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                       e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <span className="font-bold text-gray-800">{spot.spot_code}</span>
                    <span className="text-xs text-gray-600 font-semibold mt-1">{spot.spot_type}</span>
                    {spot.is_ev && <span className="text-xs bg-green-200 text-green-800 px-1 rounded mt-1">EV</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedSpot && (
        <BookingModal 
           isOpen={isModalOpen}
           onClose={() => setIsModalOpen(false)}
           spot={selectedSpot}
           onSuccess={() => {
               setIsModalOpen(false);
               fetchSpots(); // Refresh spot status to see RESERVED immediately
           }}
        />
      )}
    </div>
  );
}
