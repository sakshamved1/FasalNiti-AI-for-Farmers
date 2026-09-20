import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // By default, clean slate: unauthenticated (user is null)
  // Farmers and buyers must register first.
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fasalniti_user') || localStorage.getItem('fasalniti_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        localStorage.removeItem('fasalniti_user');
        localStorage.removeItem('fasalniti_user');
      }
    }
    return null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('fasalniti_token') || localStorage.getItem('fasalniti_token') || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('fasalniti_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fasalniti_user');
      localStorage.removeItem('fasalniti_user');
    }
  }, [user]);

  // Login with mobile number or email + password
  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { identifier, password });
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('fasalniti_token', res.data.token);
        localStorage.setItem('fasalniti_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data.message || 'Login failed.' };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || err.message || 'Invalid credentials.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Register new Farmer, Buyer, or FPO
  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('fasalniti_token', res.data.token);
        localStorage.setItem('fasalniti_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data.message || 'Registration failed.' };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || err.message || 'Registration error.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password - Request 6-digit OTP
  const forgotPassword = async (identifier) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { identifier });
      return res.data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Failed to send OTP.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Reset Password - Verify OTP & Set New Password
  const resetPassword = async (identifier, otp, newPassword) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { identifier, otp, newPassword });
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('fasalniti_token', res.data.token);
        localStorage.setItem('fasalniti_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Password reset failed.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Password reset failed.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Forgot Username - Find Account by Email or Name+Location
  const forgotUsername = async (payload) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-username', payload);
      return res.data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Failed to locate account.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('fasalniti_token');
    localStorage.removeItem('fasalniti_user');
    localStorage.removeItem('fasalniti_token');
    localStorage.removeItem('fasalniti_user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem('fasalniti_user', JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem('fasalniti_user');
      localStorage.removeItem('fasalniti_user');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      updateUser, 
      token, 
      loading, 
      login, 
      register, 
      logout,
      forgotPassword,
      resetPassword,
      forgotUsername
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
