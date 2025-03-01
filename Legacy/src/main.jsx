import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import axios from './axiosConfig'; // Import the Axios configuration
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);

// Replace with your actual Google Client ID
const GOOGLE_CLIENT_ID = '456711469433-pot8stpf78vu8bgql71c4ae2nf9libf2.apps.googleusercontent.com';

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);