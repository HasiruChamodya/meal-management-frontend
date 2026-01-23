'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft } from 'lucide-react';

export default function AccountantPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (user?.role !== 'accountant') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <button onClick={() => navigate('/login')} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-base text-primary hover:text-primary/90">
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <button onClick={() => logout()} className="flex items-center gap-2 text-base text-red-600">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Accountant Dashboard</h1>
        <p className="text-lg text-muted-foreground">Review and approve purchase orders - Coming soon...</p>
      </div>
    </div>
  );
}
