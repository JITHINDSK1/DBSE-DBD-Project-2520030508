import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Building, Car, Bike, Navigation, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Home() {
  const [mall, setMall] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
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
    <div className="home-container fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg"></div>
        <div className="container hero-content text-center">
          <h1 className="hero-title">Nexus Hyderabad Parking</h1>
          <p className="hero-subtitle">
            Find your parking spot before you arrive. Check availability, choose your parking level, and reserve a spot before you reach the mall.
          </p>
          <div className="hero-actions">
            <button onClick={() => navigate('/book')} className="btn btn-primary btn-lg shadow-lg">
              Find Parking <ArrowRight size={20} />
            </button>
            <a href="#mall-info" className="btn btn-outline btn-lg shadow-sm">
              <Building size={20} /> View Mall Info
            </a>
          </div>
        </div>
      </section>

      {/* Live Metrics Section */}
      <section className="metrics-section py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="section-title">Live Parking Status</h2>
            <p className="section-subtitle">Real-time availability across all parking levels</p>
          </div>

          {loading ? (
            <div className="text-center text-muted py-12">Loading live data from sensors...</div>
          ) : mall ? (
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon icon-gray"><Car size={24} /></div>
                <h3 className="metric-label">Total Capacity</h3>
                <div className="metric-value">{mall.stats.total || 0}</div>
              </div>
              
              <div className="metric-card bg-green-light border-green">
                <div className="metric-icon icon-green"><div className="status-dot dot-green" /></div>
                <h3 className="metric-label text-green-dark">Available</h3>
                <div className="metric-value text-green-main">{mall.stats.available || 0}</div>
              </div>

              <div className="metric-card bg-red-light border-red">
                <div className="metric-icon icon-red"><div className="status-dot dot-red" /></div>
                <h3 className="metric-label text-red-dark">Occupied</h3>
                <div className="metric-value text-red-main">{mall.stats.occupied || 0}</div>
              </div>

              <div className="metric-card bg-yellow-light border-yellow">
                <div className="metric-icon icon-yellow"><div className="status-dot dot-yellow" /></div>
                <h3 className="metric-label text-yellow-dark">Reserved</h3>
                <div className="metric-value text-yellow-main">{mall.stats.reserved || 0}</div>
              </div>
            </div>
          ) : (
            <div className="error-card">
              Error connecting to mall sensors. Please ensure backend services are running.
            </div>
          )}
        </div>
      </section>

      {/* Features / Levels Preview */}
      <section className="features-section py-16 bg-gray border-y">
        <div className="container">
          <div className="features-grid">
            <div className="card feature-card">
              <h3 className="card-title">Parking Levels</h3>
              <ul className="feature-list">
                <li><span className="font-semibold">Basement 1</span> <span className="badge badge-gray">2 Zones</span></li>
                <li className="text-muted"><span className="font-semibold">Basement 2</span> <span className="badge badge-outline">Coming Soon</span></li>
              </ul>
            </div>
            
            <div className="card feature-card">
              <h3 className="card-title">Specialized Parking</h3>
              <ul className="feature-list">
                <li>
                   <div className="icon-badge bg-green-light text-green-dark">EV</div>
                   <span className="font-semibold">EV Charging Bays</span>
                </li>
                <li>
                   <div className="icon-badge bg-blue-light text-blue-dark">♿</div>
                   <span className="font-semibold">Accessible Parking</span>
                </li>
              </ul>
            </div>
            
            <div className="card feature-card">
              <h3 className="card-title">Pricing</h3>
              <ul className="feature-list">
                <li><span className="font-semibold flex items-center gap-2"><Car size={16}/> 4-Wheeler</span> <span className="font-bold">₹50/hr</span></li>
                <li><span className="font-semibold flex items-center gap-2"><Bike size={16}/> 2-Wheeler</span> <span className="font-bold">₹20/hr</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Mall Info Section */}
      <section id="mall-info" className="mall-info-section py-20 bg-white">
        <div className="container text-center max-w-md mx-auto">
          <Building size={48} className="mx-auto text-primary-color mb-6" />
          <h2 className="section-title mb-4">Nexus Hyderabad</h2>
          <p className="text-lg text-muted mb-8">
            Kukatpally, Hyderabad, Telangana 500072
          </p>
          <div className="flex justify-center">
             <a 
               href="https://maps.google.com/?q=Nexus+Hyderabad+Kukatpally" 
               target="_blank" 
               rel="noreferrer"
               className="btn btn-outline flex items-center gap-2 shadow-sm"
             >
               <Navigation size={18} /> Open in Google Maps
             </a>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="footer bg-dark text-gray-400 py-8 text-center text-sm">
        <div className="container">
          <p className="mb-2">© 2026 Nexus Hyderabad Parking Prototype.</p>
          <p className="opacity-75">
            * Note: Parking-space positions and live occupancy in this academic prototype are simulated for demonstration. <br/>
            Mall metadata and capacities are based on official Nexus Select Trust reporting.
          </p>
        </div>
      </footer>
    </div>
  );
}
