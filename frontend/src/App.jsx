import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';

import MyBookings from './pages/MyBookings';
import Login from './pages/Login';

import { AuthProvider } from './context/AuthContext';

import ParkingDetails from './pages/ParkingDetails';
import ProviderLots from './pages/ProviderLots';
import ProviderAddLot from './pages/ProviderAddLot';
import ProviderBookings from './pages/ProviderBookings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main className="container" style={{ padding: '2rem 1rem' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/bookings" element={<MyBookings />} />
              <Route path="/parking/:id" element={<ParkingDetails />} />

              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Login />} />

              {/* Provider Routes */}
              <Route path="/provider/lots" element={<ProviderLots />} />
              <Route path="/provider/add-lot" element={<ProviderAddLot />} />
              <Route path="/provider/bookings" element={<ProviderBookings />} />
            </Routes>
          </main>

        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
