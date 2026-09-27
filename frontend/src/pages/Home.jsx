import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, ShieldCheck, Clock } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Nexus Hyderabad <br/>
          <span className="text-blue-600">Parking Management</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Experience seamless parking. Tell us when and where you want to park, and our Auto Book system will secure the best available spot for you.
        </p>
        
        <Link 
          to="/parking" 
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          FIND PARKING <ArrowRight size={24} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mt-12">
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
           <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <ShieldCheck size={32} />
           </div>
           <h3 className="text-xl font-bold mb-2">Guaranteed Spot</h3>
           <p className="text-gray-600">Your spot is physically reserved and held for your arrival.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
           <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <Clock size={32} />
           </div>
           <h3 className="text-xl font-bold mb-2">Zero Waiting</h3>
           <p className="text-gray-600">Skip the search. Drive straight to your pre-assigned parking bay.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
           <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <MapPin size={32} />
           </div>
           <h3 className="text-xl font-bold mb-2">Turn-by-turn</h3>
           <p className="text-gray-600">Receive precise internal directions to your exact parking level and row.</p>
        </div>
      </div>
    </div>
  );
}
