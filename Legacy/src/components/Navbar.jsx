import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/discover", label: "Discover" },
    { to: "/campaigns", label: "Campaigns" },
    { to: "/community-chat", label: "Community Chat" },
    { to: "/about", label: "About" },
  ];

  const handleDonateClick = () => {
    if (!isLoggedIn) {
      navigate('/signin');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <header className="bg-white py-4 px-6 fixed w-full z-50 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <NavLink
          to="/"
          className="flex items-center text-2xl font-bold text-emerald-600 hover:text-emerald-700 hover:scale-105 transition-transform"
        >
          <img
            src="https://iili.io/2MViMs2.png"
            alt="Logo"
            className="w-12 h-12 object-cover"
          />
          LEGACY
        </NavLink>

        {/* Mobile menu button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-gray-500 hover:text-gray-800 ${
                  isActive ? 'text-gray-600 underline decoration-2 decoration-emerald-700 font-semibold' : ''
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button
            className="bg-emerald-500 text-white px-6 py-2 rounded-full hover:bg-emerald-700 transition-colors"
            onClick={handleDonateClick}
          >
            Donate Now
          </button>
          {isLoggedIn ? (
            <NavLink 
              to="/profile"
              className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-full hover:bg-emerald-700 transition-colors"
            >
              <User className="w-5 h-5" />
              Profile
            </NavLink>
          ) : (
            <NavLink
              to="/signin"
              className="bg-emerald-500 text-white px-6 py-2 rounded-full hover:bg-emerald-700 transition-colors"
            >
              Login
            </NavLink>
          )}
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg md:hidden">
            <nav className="flex flex-col p-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `py-2 text-gray-600 hover:text-emerald-600 ${
                      isActive ? 'text-emerald-600 font-semibold' : ''
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <button
                className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-full hover:bg-emerald-700 transition-colors"
                onClick={handleDonateClick}
              >
                Donate Now
              </button>
              {isLoggedIn ? (
                <NavLink
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="mt-4 text-xl bg-emerald-200 text-center px-2 py-2 rounded-full hover:bg-emerald-700 transition-colors font-black flex items-center justify-center gap-2"
                >
                  <User className="w-5 h-5" />
                  Profile
                </NavLink>
              ) : (
                <NavLink
                  to="/signin"
                  onClick={() => setIsOpen(false)}
                  className="mt-4 text-xl bg-emerald-200 text-center px-2 py-2 rounded-full hover:bg-emerald-700 transition-colors font-black"
                >
                  Login
                </NavLink>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;