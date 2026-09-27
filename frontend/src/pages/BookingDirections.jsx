import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ExternalLink, Map as MapIcon, Bookmark } from 'lucide-react';
import api from '../api/axios';

export default function BookingDirections() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/bookings/${id}`)
      .then(res => {
        setBooking(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load booking directions.');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-12 text-center text-gray-500 font-medium">Loading directions...</div>;
  if (error || !booking) return <div className="p-12 text-center text-red-500 font-medium">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <button 
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-6 transition-colors"
        onClick={() => navigate('/bookings')}
      >
        <ArrowLeft size={18} /> Back to My Bookings
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="bg-blue-600 p-8 text-center text-white">
          <h2 className="text-sm uppercase tracking-widest font-semibold text-blue-200 mb-2">Your Parking Spot</h2>
          <h1 className="text-5xl font-black mb-2">{booking.spot_number}</h1>
          <p className="text-blue-100 font-medium text-lg">
            Nexus Hyderabad • Level {booking.floor_name}
          </p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8 text-sm">
            <div>
              <div className="text-gray-500 font-medium uppercase mb-1">Booking Ref</div>
              <div className="font-bold text-gray-900 font-mono text-base">{booking.booking_reference || 'NX-000000'}</div>
            </div>
            <div>
              <div className="text-gray-500 font-medium uppercase mb-1">Status</div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold bg-green-100 text-green-800">
                {booking.status}
              </div>
            </div>
            <div>
              <div className="text-gray-500 font-medium uppercase mb-1">Vehicle</div>
              <div className="font-bold text-gray-900 text-base">{booking.vehicle_type || 'My Car'}</div>
            </div>
            <div>
              <div className="text-gray-500 font-medium uppercase mb-1">Arrival Time</div>
              <div className="font-bold text-gray-900 text-base">{new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wide">How to find your spot</h3>
            
            <div className="flex flex-col">
              <div className="flex items-start gap-4 pb-6 relative">
                <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-blue-200"></div>
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold z-10">1</div>
                <div className="pt-1">
                  <div className="font-bold text-gray-900">Enter Nexus Hyderabad</div>
                  <div className="text-gray-600">Proceed to the main parking entrance.</div>
                </div>
              </div>
              
              <div className="flex items-start gap-4 pb-6 relative">
                <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-blue-200"></div>
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold z-10">2</div>
                <div className="pt-1">
                  <div className="font-bold text-gray-900">Level {booking.floor_name}</div>
                  <div className="text-gray-600">Follow signs down to parking level {booking.floor_name}.</div>
                </div>
              </div>

              {Array.isArray(booking.directions_note) ? (
                booking.directions_note.map((step, index) => (
                  <div key={index} className="flex items-start gap-4 pb-6 relative last:pb-0">
                    {index < booking.directions_note.length - 1 && (
                      <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-blue-200"></div>
                    )}
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold z-10">
                      {index + 3}
                    </div>
                    <div className="pt-1">
                      <div className="font-bold text-gray-900">
                        {index === booking.directions_note.length - 1 ? `Arrive at Spot ${booking.spot_number}` : step}
                      </div>
                      {index !== booking.directions_note.length - 1 && <div className="text-gray-600">{step}</div>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold z-10">3</div>
                  <div className="pt-1">
                    <div className="font-bold text-gray-900">Arrive at Spot {booking.spot_number}</div>
                    <div className="text-gray-600">{booking.directions_note}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
             <a href="https://maps.google.com/?q=Nexus+Hyderabad+Kukatpally" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors">
               <ExternalLink size={16} /> Google Maps
             </a>
             <button onClick={() => navigate(`/parking`)} className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors border border-blue-200">
               <MapIcon size={16} /> View Full Map
             </button>
             <button onClick={() => navigate('/bookings')} className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors border border-gray-200">
               <Bookmark size={16} /> My Bookings
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
