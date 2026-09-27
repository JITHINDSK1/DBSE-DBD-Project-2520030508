import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import FloorMap from '../components/FloorMap';
import { ArrowLeft } from 'lucide-react';

export default function FullParkingMap() {
  const { floorId } = useParams();
  const [floor, setFloor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFloorSummary = async () => {
      try {
        const res = await api.get('/api/floors/summary');
        const currentFloor = res.data.find(f => f.id.toString() === floorId);
        setFloor(currentFloor);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchFloorSummary();
  }, [floorId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading map...</div>;
  if (!floor) return <div className="p-8 text-center text-red-500">Floor not found</div>;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <Link to="/parking" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4 transition-colors">
            <ArrowLeft size={18} className="mr-2" /> Back to Parking
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">{floor.name} Parking Map</h1>
          <p className="text-gray-600 mt-1">Manual spot selection mode</p>
        </div>
        
        <div className="flex gap-4 bg-gray-50 px-6 py-3 rounded-xl border border-gray-200">
           <div className="text-center">
             <div className="text-sm font-semibold text-gray-500 uppercase">Available</div>
             <div className="text-xl font-bold text-green-600">{floor.available_spots}</div>
           </div>
           <div className="w-px bg-gray-300"></div>
           <div className="text-center">
             <div className="text-sm font-semibold text-gray-500 uppercase">Occupied</div>
             <div className="text-xl font-bold text-red-600">{floor.booked_spots}</div>
           </div>
           <div className="w-px bg-gray-300"></div>
           <div className="text-center">
             <div className="text-sm font-semibold text-gray-500 uppercase">Total</div>
             <div className="text-xl font-bold text-gray-700">{floor.total_spots}</div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[500px] overflow-x-auto">
        <FloorMap floorId={floorId} />
      </div>
    </div>
  );
}
