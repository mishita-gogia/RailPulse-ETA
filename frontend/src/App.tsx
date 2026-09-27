import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TrainDetails from './pages/TrainDetails';
import LiveTrains from './pages/LiveTrains';
import PassengerView from './pages/PassengerView';
import ControlRoom from './pages/ControlRoom';
import Analytics from './pages/Analytics';
import Network from './pages/Network';
import Alerts from './pages/Alerts';
import About from './pages/About';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute allowedRoles={['control_room']}>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/trains" element={
            <ProtectedRoute allowedRoles={['control_room']}>
              <Layout><LiveTrains /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/trains/:trainId" element={
            <ProtectedRoute allowedRoles={['control_room', 'passenger']}>
              <Layout><TrainDetails /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/passenger" element={
            <ProtectedRoute allowedRoles={['passenger']}>
              <Layout><PassengerView /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/control-room" element={
            <ProtectedRoute allowedRoles={['control_room']}>
              <Layout><ControlRoom /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={['control_room']}>
              <Layout><Analytics /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/network" element={
            <ProtectedRoute allowedRoles={['control_room']}>
              <Layout><Network /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/alerts" element={
            <ProtectedRoute allowedRoles={['control_room']}>
              <Layout><Alerts /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/about" element={
            <ProtectedRoute allowedRoles={['control_room', 'passenger']}>
              <Layout><About /></Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
