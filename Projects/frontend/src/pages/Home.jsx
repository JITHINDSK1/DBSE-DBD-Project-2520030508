import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Building, Car, Bike, Navigation } from 'lucide-react';
import { FlowButton } from '../components/ui/FlowButton';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Home() {
  const [mall, setMall] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    // Assume mall id 1 is Forum Sujana Mall
    api.get('/api/malls/1')
      .then(res => {
        setMall(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-1.5px', background: 'linear-gradient(90deg, var(--text-color), var(--primary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Forum Sujana Mall Parking
        </h1>
        <p className="text-muted" style={{ fontSize: '1.25rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          Find your parking spot before you arrive. View real-time availability and reserve your spot instantly.
        </p>

        {loading ? (
           <div>Loading live data...</div>
        ) : mall ? (
          <div className="card" style={{ padding: '2rem', borderRadius: '24px', boxShadow: 'var(--shadow-md)', textAlign: 'left' }}>
            <div className="flex items-center justify-between mb-6 border-b pb-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{mall.name}</h2>
                <div className="text-muted flex items-center gap-1">
                  <MapPin size={16} /> {mall.location}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center bg-gray-50 p-3 rounded-xl border">
                  <div className="text-sm text-muted mb-1 flex items-center gap-1 justify-center"><Car size={14}/> Capacity</div>
                  <div className="font-bold text-lg">{mall.four_wheeler_capacity}</div>
                </div>
                <div className="text-center bg-gray-50 p-3 rounded-xl border">
                  <div className="text-sm text-muted mb-1 flex items-center gap-1 justify-center"><Bike size={14}/> Capacity</div>
                  <div className="font-bold text-lg">{mall.two_wheeler_capacity}</div>
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Live Simulation Status</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <div className="card flex flex-col items-center justify-center p-4" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <div className="text-sm font-semibold" style={{ color: '#166534' }}>AVAILABLE</div>
                <div className="text-3xl font-bold" style={{ color: '#15803d' }}>{mall.stats.available || 0}</div>
              </div>
              <div className="card flex flex-col items-center justify-center p-4" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
                <div className="text-sm font-semibold" style={{ color: '#991b1b' }}>OCCUPIED</div>
                <div className="text-3xl font-bold" style={{ color: '#b91c1c' }}>{mall.stats.occupied || 0}</div>
              </div>
              <div className="card flex flex-col items-center justify-center p-4" style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
                <div className="text-sm font-semibold" style={{ color: '#92400e' }}>RESERVED</div>
                <div className="text-3xl font-bold" style={{ color: '#b45309' }}>{mall.stats.reserved || 0}</div>
              </div>
              <div className="card flex flex-col items-center justify-center p-4" style={{ backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' }}>
                <div className="text-sm font-semibold" style={{ color: '#374151' }}>TOTAL SIMULATED</div>
                <div className="text-3xl font-bold" style={{ color: '#4b5563' }}>{mall.stats.total || 0}</div>
              </div>
            </div>

            <div className="flex justify-center">
              <FlowButton 
                text="Book a Parking Spot" 
                onClick={() => navigate('/book')}
                style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}
              />
            </div>
          </div>
        ) : (
          <div>Error loading mall data. Make sure backend is seeded.</div>
        )}
      </div>
      
      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <p className="text-muted text-sm">
          * Note: Individual parking zones, spot numbers, and live occupancy are simulated for academic demonstration. <br/>
          Mall metadata and official capacities are sourced from Forum Sujana Mall documentation.
        </p>
      </div>
    </div>
  );
}
