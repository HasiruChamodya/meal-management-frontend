'use client';

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  {
    id: 'diet-clerk',
    name: 'Diet Clerk',
    description: 'Enter daily meal counts and cycle information',
    icon: '🍽️',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Manage system settings and user accounts',
    icon: '⚙️',
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'subject-clerk',
    name: 'Subject Clerk',
    description: 'Manage pricing and purchase orders',
    icon: '💰',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'accountant',
    name: 'Accountant',
    description: 'Review and approve purchase orders',
    icon: '📊',
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'kitchen',
    name: 'Kitchen Staff',
    description: 'View meal preparation details',
    icon: '👨‍🍳',
    color: 'from-red-500 to-red-600',
  },
];

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.role) {
      // Redirect to appropriate dashboard if user is already logged in
      navigate(`/${user.role}`);
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="text-lg text-muted-foreground mb-4">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Hospital Meal Management System
          </h1>
          <p className="text-xl text-muted-foreground">
            Select your role to access the dashboard
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => navigate(`/${role.id}`)}
              className="p-8 bg-card border border-border rounded-lg hover:shadow-lg hover:border-primary transition-all duration-300 text-left"
            >
              <div className={`text-5xl mb-4 ${role.color}`}>{role.icon}</div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{role.name}</h2>
              <p className="text-base text-muted-foreground mb-6">{role.description}</p>
              <div className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Access Dashboard
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
