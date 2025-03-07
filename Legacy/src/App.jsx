import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Campaigns from './pages/Campaigns';
import Discover from './pages/Discover';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import CommunityChat from './pages/CommunityChat';
import Checkout from './pages/Checkout';
import Loading from './components/Loading';
import Profile from './pages/Profile';
import StartCampaign from './pages/StartCompaign';
import CookieConsentModal from './components/CookieConsentModal';
import axios from 'axios';
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [cookieConsent, setCookieConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent) {
      setCookieConsent(true);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setCookieConsent(true);
  };
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loading />;
  }
  
  return (
    <div className="min-h-screen w-full bg-white">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/community-chat" element={<CommunityChat />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/startCampaign" element={<StartCampaign />} />
        </Routes>
      </main>
      <Footer />
      <CookieConsentModal onAccept={handleAcceptCookies} />
    </div>
  );
}
export const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});
export default App;

