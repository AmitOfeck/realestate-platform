import React from 'react';
import GoogleLogin from './GoogleLogin';
import '../styles/pages/LoginPage.css';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const handleGoogleLoginSuccess = async (credential: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        onLoginSuccess(data.user);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleGoogleLoginError = (error: string) => {
    console.error('Google login error:', error);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">
            🏠 Real Estate Platform
          </h1>
          <p className="login-subtitle">
            Sign in to access property search and analytics
          </p>
        </div>
        
        <div className="login-content">
          <GoogleLogin 
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
