'use client';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // In production, this would call your backend API
    console.log('Password reset email sent to:', email);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-border rounded-lg bg-card shadow-lg">
        <div className="p-8">
          {!submitted ? (
            <>
              <Link to="/login" className="flex items-center gap-2 text-primary hover:text-primary/90 mb-6 font-medium">
                <ArrowLeft className="h-5 w-5" />
                Back to Login
              </Link>

              <div className="space-y-4 mb-8">
                <h1 className="text-3xl font-bold text-foreground">Reset Password</h1>
                <p className="text-base text-muted-foreground">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-base font-medium text-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-14 text-base pl-12 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
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
                  Send Reset Link
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success/10">
                  <Mail className="w-8 h-8 text-success" />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-foreground">Check Your Email</h1>

              <p className="text-base text-muted-foreground">
                We've sent a password reset link to <strong>{email}</strong>
              </p>

              <p className="text-base text-muted-foreground">
                Click the link in the email to reset your password. The link will expire in 24 hours.
              </p>

              <Link
                to="/login"
                className="inline-block w-full h-14 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors flex items-center justify-center"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
