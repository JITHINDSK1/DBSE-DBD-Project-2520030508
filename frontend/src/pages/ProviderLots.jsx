import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import api from '../api/axios';

export default function ProviderLots() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = () => {
    setLoading(true);
    api.get('/api/provider/lots')
      .then(res => {
        setLots(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this parking lot?')) return;
    try {
      await api.delete(`/api/provider/lots/${id}`);
      fetchLots();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete lot');
    }
  };

  if (loading) return <div className="text-center py-12">Loading your lots...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Provider Dashboard</h1>
          <p className="text-muted mt-1">Manage your parking locations</p>
        </div>
        <Link to="/provider/add-lot" className="btn btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Parking Lot
        </Link>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {lots.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="text-xl font-bold mb-2">No parking lots found</h3>
            <p className="text-muted">You haven't added any parking locations yet.</p>
          </div>
        ) : (
          lots.map(lot => (
            <div key={lot.id} className="card flex justify-between items-center" style={{ padding: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{lot.name}</h3>
                <div className="text-muted flex items-center gap-2 mb-3 text-sm">
                  <MapPin size={14} /> {lot.location}
                </div>
                <div className="flex gap-4">
                  <div>
                    <div className="text-xs text-muted uppercase tracking-wider">Capacity</div>
                    <div className="font-semibold">{lot.capacity} spots</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted uppercase tracking-wider">Available</div>
                    <div className="font-semibold text-success">{lot.availableSlots} spots</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted uppercase tracking-wider">Price</div>
                    <div className="font-semibold">₹{lot.price_per_hour}/hr</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="btn btn-outline flex items-center gap-2">
                  <Edit2 size={16} /> Manage
                </button>
                <button className="btn btn-outline text-danger hover:bg-danger hover:text-white" onClick={() => handleDelete(lot.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
