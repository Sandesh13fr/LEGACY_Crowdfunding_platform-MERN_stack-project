import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { api } from '../App';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
      // Optionally fetch user data here
      fetchUserData(token);
    }
    setIsLoading(false);
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await api.get('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout();
    }
  };

  const login = (token, userData) => {
    localStorage.setItem('authToken', token);
    setIsLoggedIn(true);
    setUser(userData);
  };

  const loginWithGoogle = async (credential) => {
    try {
      const response = await api.post('/api/google-auth', { credential });
      
      const data = response.data;
      
      if (data && data.token) {
        // Fix: use login function instead of direct state manipulation
        login(data.token, data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Google authentication error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, loginWithGoogle, logout, user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);