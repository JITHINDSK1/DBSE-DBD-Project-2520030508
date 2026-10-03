import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { FlowButton } from '../components/ui/FlowButton';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Home() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('nearest'); // 'nearest', 'price', 'available'
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendUrl, setBackendUrl] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const filters = [
    { label: 'Nearest first', value: 'nearest' },
    { label: 'Price: low → high', value: 'price' },
    { label: 'Most slots available', value: 'available' }
  ];

  useEffect(() => {
    setLoading(true);
    const lat = 17.4475;
    const lng = 78.3850;
    
    const url = `/api/parkings?sort=${sortBy}&lat=${lat}&lng=${lng}`;
    setBackendUrl(api.defaults.baseURL + url);

    api.get(url)
      .then(res => {
        setLocations(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [sortBy]);

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(search.toLowerCase()) || 
    loc.area.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-1px' }}>
          Find a place to leave the car.
        </h1>
        <p className="text-muted" style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
          Live availability from verified parking operators across the city.
        </p>

        <div className="card" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', borderRadius: '999px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '0.5rem 1rem' }}>
            <Search className="text-muted" />
          </div>
          <input 
            type="text" 
            placeholder="Search an area, landmark or parking name" 
            style={{ flex: 1, border: 'none', padding: '1rem', fontSize: '1.1rem', outline: 'none', background: 'transparent' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Find spots
          </button>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '1rem',
        overflowX: 'auto',
        paddingBottom: '1rem',
        marginBottom: '2rem',
        scrollbarWidth: 'none'
      }}>
        <div className="flex items-center gap-2" style={{ borderRight: '2px solid var(--border-color)', paddingRight: '1rem', marginRight: '0.5rem' }}>
          <SlidersHorizontal size={18} />
          <span className="font-semibold">Sort by</span>
        </div>
        
        {filters.map(filter => (
          <button 
            key={filter.value}
            className={`btn ${sortBy === filter.value ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSortBy(filter.value)}
            style={{ whiteSpace: 'nowrap', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            {filter.label} {filter.value === 'nearest' && <ChevronDown size={14} style={{ marginLeft: '4px' }} />}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {filteredLocations.map(loc => (
          <div key={loc._id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{loc.name}</h3>
                <div className="text-muted flex items-center gap-1" style={{ fontSize: '0.95rem' }}>
                  <MapPin size={16} /> {loc.area}, Hyderabad
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 mb-4" style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>Availability</div>
                <div className="font-bold" style={{ color: loc.availableSlots < 10 ? 'var(--danger-color)' : 'var(--success-color)' }}>
                  {loc.availableSlots} slots
                </div>
              </div>
              <div style={{ width: '1px', height: '30px', backgroundColor: 'var(--border-color)' }}></div>
              <div style={{ textAlign: 'right' }}>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>Price</div>
                <div className="font-bold">₹{loc.pricePerHour}/hr</div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2" style={{ gap: '1rem' }}>
              <div>
                <FlowButton 
                  text="Book Now" 
                  onClick={() => {
                    const destination = `/parking/${loc._id}?book=true`;
                    if (!user) {
                      navigate(`/login?redirect=${encodeURIComponent(destination)}`);
                    } else {
                      navigate(destination);
                    }
                  }} 
                  style={{ padding: '0.4rem 1.2rem', fontSize: '0.9rem' }} 
                />
              </div>
              <Link to={`/parking/${loc._id}`} className="text-muted" style={{ fontSize: '0.85rem', textDecoration: 'underline', whiteSpace: 'nowrap' }}>
                View details
              </Link>
            </div>
          </div>
        ))}
        {!loading && filteredLocations.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', backgroundColor: '#f9fafb', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No parking spots found</h3>
            <p className="text-muted mb-4">Backend URL called: <br /><code>{backendUrl}</code></p>
            <p className="text-muted">Ensure your backend is running and seeded.</p>
          </div>
        )}
      </div>
    </div>
  );
}
