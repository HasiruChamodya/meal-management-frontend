'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordRequirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not meet requirements');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    // In production, this would call your backend API
    console.log('Password reset:', { password });
    setSuccess(true);

    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-border rounded-lg bg-card shadow-lg">
        <div className="p-8">
          {!success ? (
            <>
              <div className="space-y-4 mb-8">
                <h1 className="text-3xl font-bold text-foreground">Create New Password</h1>
                <p className="text-base text-muted-foreground">
                  Enter a strong password to secure your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-base font-medium text-foreground">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-14 text-base px-4 py-2 pr-12 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-base font-medium text-foreground">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-14 text-base px-4 py-2 pr-12 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-foreground">Password Requirements:</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className={passwordRequirements.minLength ? 'text-success' : 'text-muted-foreground'}>
                        {passwordRequirements.minLength ? '✓' : '○'}
                      </span>
                      <span className={passwordRequirements.minLength ? 'text-success' : 'text-muted-foreground'}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={passwordRequirements.hasUppercase ? 'text-success' : 'text-muted-foreground'}>
                        {passwordRequirements.hasUppercase ? '✓' : '○'}
                      </span>
                      <span className={passwordRequirements.hasUppercase ? 'text-success' : 'text-muted-foreground'}>
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={passwordRequirements.hasLowercase ? 'text-success' : 'text-muted-foreground'}>
                        {passwordRequirements.hasLowercase ? '✓' : '○'}
                      </span>
                      <span className={passwordRequirements.hasLowercase ? 'text-success' : 'text-muted-foreground'}>
                        One lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={passwordRequirements.hasNumber ? 'text-success' : 'text-muted-foreground'}>
                        {passwordRequirements.hasNumber ? '✓' : '○'}
                      </span>
                      <span className={passwordRequirements.hasNumber ? 'text-success' : 'text-muted-foreground'}>
                        One number
                      </span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 text-base text-red-600 bg-red-50 border border-red-200 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isPasswordValid || !passwordsMatch}
                  className="w-full h-14 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground rounded-lg transition-colors"
                >
                  Reset Password
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success/10">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-foreground">Password Reset Successful</h1>

              <p className="text-base text-muted-foreground">
                Your password has been successfully reset. You will be redirected to the login page in a moment.
              </p>

              <div className="animate-spin inline-block">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
