import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../axiosConfig'; // Import the Axios configuration

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
      const response = await axios.get('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token might be invalid or expired
        logout();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem('authToken', token);
    setIsLoggedIn(true);
    setUser(userData);
  };

  const loginWithGoogle = async (credential) => {
    try {
      const response = await axios.post('/api/google-auth', { credential });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        setIsLoggedIn(true);
        setUser(data.user);
        return true;
      } else {
        const error = await response.json();
        console.error('Google login failed:', error);
        return false;
      }
    } catch (error) {
      console.error('Error during Google login:', error);
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