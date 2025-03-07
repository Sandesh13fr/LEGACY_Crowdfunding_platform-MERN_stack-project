import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Footer() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleDonateClick = () => {
    if (!isLoggedIn) {
      navigate('/signin');
    } else {
      navigate('/checkout'); // Example navigation to donate page
    }
  };

  return (
    <section className="bg-white w-screen bg-gradient-to-t from-gray-50 to-emerald-50 border-t-1 border-emerald-500">
      <div className="max-w-screen-xl px-4 py-12 mx-auto space-y-8 overflow-hidden sm:px-6 lg:px-8">
        <nav className="flex flex-wrap justify-center -mx-5 -my-2">
          <div className="px-5 py-2">
            <Link to="/" className="text-base leading-6 text-gray-500 hover:text-gray-900 hover:underline hover:decoration-emerald-400 hover:decoration-2">
              Home
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/discover" className="text-base leading-6 text-gray-500 hover:text-gray-900 hover:underline hover:decoration-emerald-400 hover:decoration-2">
              Discover
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/campaigns" className="text-base leading-6 text-gray-500 hover:text-gray-900 hover:underline hover:decoration-emerald-400 hover:decoration-2">
              Campaigns
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/about" className="text-base leading-6 text-gray-500 hover:text-gray-900 hover:underline hover:decoration-emerald-400 hover:decoration-2">
              About us
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/community-chat" className="text-base leading-6 text-gray-500 hover:text-gray-900 hover:underline hover:decoration-emerald-400 hover:decoration-2">
              Community Chat
            </Link>
          </div>
        </nav>
        <div className="flex items-center justify-center my-2">
          <button className="bg-emerald-500 py-4 px-10 rounded-4xl font-semibold text-2xl border border-emerald-500 mt-4" onClick={handleDonateClick}>Donate now!!</button>
        </div>
        <p className="mt-8 text-base leading-6 text-center text-gray-400 underline">
          &copy; <span className="font-black decoration-0 font-mono text-2xl text-emerald-400">Legacy</span> For the community &hearts;.
        </p>
      </div>
    </section>
  );
}

export default Footer;