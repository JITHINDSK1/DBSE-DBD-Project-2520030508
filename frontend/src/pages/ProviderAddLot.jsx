import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ProviderAddLot() {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    vehicle_types: 'Car, Bike',
    capacity: 0,
    floorsCount: 1,
    price_per_hour: 0
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/provider/lots', formData);
      alert('Parking lot created successfully!');
      navigate('/provider/lots');
    } catch(err) {
      alert(err.response?.data?.error || 'Failed to add lot');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="mb-6">
        <Link to="/provider/lots" className="flex items-center gap-2 text-muted hover:text-black">
          <ArrowLeft size={16} /> Back to Lots
        </Link>
      </div>

      <div className="card" style={{ padding: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Add Parking Lot</h1>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Parking Lot Name</label>
            <input required name="name" value={formData.name} onChange={handleChange} className="input w-full" placeholder="e.g. Nexus Mall" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Location / Area</label>
            <input required name="location" value={formData.location} onChange={handleChange} className="input w-full" placeholder="e.g. Kukatpally, Hyderabad" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="input w-full" rows="3" placeholder="Describe the facility..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="block text-sm font-semibold mb-2">Vehicle Types</label>
              <input name="vehicle_types" value={formData.vehicle_types} onChange={handleChange} className="input w-full" placeholder="e.g. Car, Bike" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Price Per Hour (₹)</label>
              <input required type="number" name="price_per_hour" value={formData.price_per_hour} onChange={handleChange} className="input w-full" min="0" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="block text-sm font-semibold mb-2">Total Capacity (Spots)</label>
              <input required type="number" name="capacity" value={formData.capacity} onChange={handleChange} className="input w-full" min="1" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Number of Floors</label>
              <input required type="number" name="floorsCount" value={formData.floorsCount} onChange={handleChange} className="input w-full" min="1" max="10" />
            </div>
          </div>
          
          <div className="mt-4 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
            <button type="submit" disabled={loading} className="btn btn-primary w-full flex justify-center items-center gap-2" style={{ padding: '1rem', fontSize: '1.1rem' }}>
              <Save size={20} /> {loading ? 'Saving...' : 'Create Parking Lot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
