import React, { useState, useEffect } from 'react';

const CookieConsentModal = ({ onAccept }) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowModal(true);
    }
  }, []);

  const handleAccept = () => {
    onAccept();
    setShowModal(false);
  };

  return (
    showModal && (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Cookie Consent</h2>
          <p className="mb-6">We use cookies to improve your experience. By using our site, you agree to our use of cookies.</p>
          <button onClick={handleAccept} className="bg-emerald-500 text-white px-4 py-2 rounded">
            Accept
          </button>
        </div>
      </div>
    )
  );
};

export default CookieConsentModal;