'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(undefined);

// Mock user database (replace with backend API in production)
const MOCK_USERS = {
  dietclerk: { password: 'Password123', role: 'diet-clerk', name: 'Diet Clerk' },
  admin: { password: 'Password123', role: 'admin', name: 'Administrator' },
  subjectclerk: { password: 'Password123', role: 'subject-clerk', name: 'Subject Clerk' },
  accountant: { password: 'Password123', role: 'accountant', name: 'Accountant' },
  kitchen: { password: 'Password123', role: 'kitchen', name: 'Kitchen Staff' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('hospital_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('hospital_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (username, password) => {
    const userRecord = MOCK_USERS[username];

    if (userRecord && userRecord.password === password) {
      const userData = {
        username,
        role: userRecord.role,
        name: userRecord.name,
      };
      setUser(userData);
      localStorage.setItem('hospital_user', JSON.stringify(userData));
      navigate(`/${userRecord.role}`);
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hospital_user');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
