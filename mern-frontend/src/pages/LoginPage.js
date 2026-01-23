'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Hospital } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    const success = login(username, password);
    if (!success) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-border rounded-lg bg-card shadow-lg">
        <div className="p-8 space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
              <Hospital className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Hospital Meal Management</h1>
          <p className="text-base text-muted-foreground">Sign in to access your dashboard</p>
        </div>

        <div className="p-8 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-base font-medium text-foreground">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-14 text-base px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-base font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 text-base px-4 py-2 pr-12 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 text-base text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full h-14 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
            >
              Sign In
            </button>

            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-base text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              >
                Forgot your password?
              </Link>
            </div>
          </form>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm font-medium mb-3 text-foreground">Demo Credentials:</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Diet Clerk:</strong> dietclerk / Password123
              </p>
              <p>
                <strong>Admin:</strong> admin / Password123
              </p>
              <p>
                <strong>Subject Clerk:</strong> subjectclerk / Password123
              </p>
              <p>
                <strong>Accountant:</strong> accountant / Password123
              </p>
              <p>
                <strong>Kitchen:</strong> kitchen / Password123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
