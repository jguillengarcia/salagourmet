import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Calendar from './components/Calendar';
import MyReservations from './components/MyReservations';
import { ReservationProvider } from './context/ReservationContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <ReservationProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Calendar />} />
              <Route path="/my-reservations" element={<MyReservations />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
          <Toaster position="top-center" />
        </Router>
      </ReservationProvider>
    </AuthProvider>
  );
}

export default App;