import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/Unauthorized';
import ExpensePage from './pages/ExpensePage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Admin Routes - Allow all roles for now */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="main_admin,admin,manager,accountant,cashier">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 - Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/expenses" element={<ExpensePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;