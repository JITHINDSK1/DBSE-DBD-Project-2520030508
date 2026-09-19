import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BookParking from './pages/BookParking';

import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
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
              <Route path="/book" element={<BookParking />} />
              <Route path="/bookings" element={<MyBookings />} />

              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Login />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
