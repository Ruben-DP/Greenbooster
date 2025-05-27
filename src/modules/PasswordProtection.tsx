"use client";

import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

const PasswordProtection = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Simple password - you can change this
  const CORRECT_PASSWORD = 'DuurzameEddy25';

  useEffect(() => {
    // Check if user is already authenticated
    const auth = localStorage.getItem('app-authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('app-authenticated', 'true');
      setError('');
    } else {
                  setError('Onjuist wachtwoord');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('app-authenticated');
  };

  if (isLoading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="loading">Laden...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Lock size={48} className="auth-icon" />
            <h1>Duurzaamheidsversneller</h1>
            <p>Voer het wachtwoord in om toegang te krijgen</p>
          </div>

          <div className="auth-form">
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Voer wachtwoord in"
                className={`password-input ${error ? 'error' : ''}`}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && <div className="error-message">Onjuist wachtwoord</div>}

            <button type="button" onClick={handleSubmit} className="submit-button" disabled={!password}>
              Toegang tot applicatie
            </button>
          </div>
        </div>

        <style jsx>{`
          .auth-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f6f6f8;
            padding: 20px;
            width:100dvw;
          }

          .auth-card {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            width: 100%;
            max-width: 400px;
          }

          .auth-header {
            text-align: center;
            margin-bottom: 32px;
          }

          .auth-icon {
            color: #0f5da8;
            margin-bottom: 16px;
          }

          .auth-header h1 {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 8px 0;
          }

          .auth-header p {
            color: #6b7280;
            margin: 0;
            font-size: 14px;
          }

          .auth-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .password-field {
            position: relative;
            display: flex;
            align-items: center;
          }

          .password-input {
            width: 100%;
            padding: 12px 48px 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.2s;
            outline: none;
          }

          .password-input:focus {
            border-color: #0f5da8;
          }

          .password-input.error {
            border-color: #ef4444;
          }

          .password-toggle {
            position: absolute;
            right: 12px;
            background: none;
            border: none;
            color: #6b7280;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .password-toggle:hover {
            color: #374151;
            background-color: #f3f4f6;
          }

          .error-message {
            color: #ef4444;
            font-size: 14px;
            text-align: center;
            margin: -10px 0 0 0;
          }

          .submit-button {
            background-color: #0f5da8;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
          }

          .submit-button:hover:not(:disabled) {
            background-color: #0d4a8a;
          }

          .submit-button:disabled {
            background-color: #9ca3af;
            cursor: not-allowed;
          }

          .loading {
            text-align: center;
            padding: 40px;
            color: #6b7280;
          }
        `}</style>
      </div>
    );
  }

  // User is authenticated, show the app with logout option
  return (
    <div>
      {/* Optional logout button in header */}
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        zIndex: 1000 
      }}>
        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.2)',
            borderRadius: '4px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          Uitloggen
        </button>
      </div>
      {children}
    </div>
  );
};

export default PasswordProtection;