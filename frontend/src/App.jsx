import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';
import ExpenseForm from './pages/ExpenseForm';
import MyExpenses from './pages/MyExpenses';
import PendingApprovals from './pages/PendingApprovals';
import AllExpenses from './pages/AllExpenses';
import ApprovalSettings from './pages/ApprovalSettings';
import Unauthorized from './pages/Unauthorized';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        } 
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Dashboard - Available to all authenticated users */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Profile - Available to all authenticated users */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      
      {/* Employee Routes - Only employees can submit expenses */}
      <Route
        path="/submit-expense"
        element={
          <ProtectedRoute requiredRole="Employee">
            <ExpenseForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-expenses"
        element={
          <ProtectedRoute requiredRole="Employee">
            <MyExpenses />
          </ProtectedRoute>
        }
      />
      
      {/* Manager Routes - Only Managers can approve */}
      <Route
        path="/pending-approvals"
        element={
          <ProtectedRoute requiredRoles={['Manager']}>
            <PendingApprovals />
          </ProtectedRoute>
        }
      />
      
      {/* Admin Routes - Only admins */}
      <Route
        path="/user-management"
        element={
          <ProtectedRoute requiredRole="Admin">
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/all-expenses"
        element={
          <ProtectedRoute requiredRole="Admin">
            <AllExpenses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/approval-settings"
        element={
          <ProtectedRoute requiredRole="Admin">
            <ApprovalSettings />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <div className="App">
          <AppContent />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
