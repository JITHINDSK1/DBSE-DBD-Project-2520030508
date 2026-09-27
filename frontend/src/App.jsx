import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BookingDirections from './pages/BookingDirections';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import Parking from './pages/Parking';
import FullParkingMap from './pages/FullParkingMap';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main className="container" style={{ padding: '2rem 1rem' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/parking" element={<Parking />} />
              <Route path="/parking/:floorId/map" element={<FullParkingMap />} />
              <Route path="/bookings" element={<MyBookings />} />
              <Route path="/bookings/:id/directions" element={<BookingDirections />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Login />} />

            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
