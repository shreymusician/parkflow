import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import RequestParking from './pages/RequestParking';
import Reservations from './pages/Reservations';
import Sessions from './pages/Sessions';
import Notifications from './pages/Notifications';
import Heatmap from './pages/Heatmap';
import AdminDashboard from './pages/AdminDashboard';
import ParkingPass from './pages/ParkingPass';
import SimulationDashboard from './pages/SimulationDashboard';
import DemoOverview from './pages/DemoOverview';
import CompleteProfile from './pages/CompleteProfile';
import Profile from './pages/Profile';
import ProtectedRoute from './routes/ProtectedRoute';
import { SocketProvider } from './contexts/SocketContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes - User */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute forbidAdmin={true}><Profile /></ProtectedRoute>} />
            <Route path="/complete-profile" element={<ProtectedRoute forbidAdmin={true}><CompleteProfile /></ProtectedRoute>} />
            <Route path="/vehicles" element={<ProtectedRoute forbidAdmin={true}><Vehicles /></ProtectedRoute>} />
            <Route path="/request-parking" element={<ProtectedRoute forbidAdmin={true}><RequestParking /></ProtectedRoute>} />
            <Route path="/reservations" element={<ProtectedRoute forbidAdmin={true}><Reservations /></ProtectedRoute>} />
            <Route path="/sessions" element={<ProtectedRoute forbidAdmin={true}><Sessions /></ProtectedRoute>} />
            <Route path="/heatmap" element={<ProtectedRoute><Heatmap /></ProtectedRoute>} />
            <Route path="/pass" element={<ProtectedRoute forbidAdmin={true}><ParkingPass /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

            {/* Protected Routes - Admin */}
            <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/simulation" element={<ProtectedRoute requireAdmin={true}><SimulationDashboard /></ProtectedRoute>} />
            <Route path="/demo" element={<ProtectedRoute requireAdmin={true}><DemoOverview /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <ToastContainer
          position="bottom-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastStyle={{
            borderRadius: '14px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
            border: '1px solid rgba(226,232,240,0.8)',
          }}
        />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
