import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DietClerkPage from './pages/DietClerkPage';
import AdminPage from './pages/AdminPage';
import SubjectClerkPage from './pages/SubjectClerkPage';
import AccountantPage from './pages/AccountantPage';
import KitchenPage from './pages/KitchenPage';
import HomePage from './pages/HomePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Protected Routes */}
          <Route path="/diet-clerk" element={<DietClerkPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/subject-clerk" element={<SubjectClerkPage />} />
          <Route path="/accountant" element={<AccountantPage />} />
          <Route path="/kitchen" element={<KitchenPage />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
