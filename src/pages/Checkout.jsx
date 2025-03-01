import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Checkout() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get('https://api.jsonbin.io/v3/b/67b703c6e41b4d34e49547f2', {
          headers: {
            'X-Master-Key': '$2a$10$v4h9uOW0ZweYtzqRJzm9QudGIHaLspZQmdcCdmM5ubwvtz6l84nGC'
          }
        });
        setCampaigns(response.data.record);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };

    fetchCampaigns();
  }, []);

  const handleCampaignChange = (e) => {
    const selected = e.target.value;
    setSelectedCampaign(selected);
    setQrCodeUrl(`https://payment-processor.com/pay?campaign=${selected}`);
  };

  return (
    <div className="pt-24 w-screen px-3">
      <section className="py-20 bg-emerald-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-800 mb-6">Checkout</h1>
            <p className="text-xl text-gray-600 mb-8">
              Select a campaign to support and complete your payment.
            </p>
            <div className="mb-6">
              <select
                value={selectedCampaign}
                onChange={handleCampaignChange}
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-black"
              >
                <option value="">Select a Campaign</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.title}>
                    {campaign.title}
                  </option>
                ))}
              </select>
            </div>
            {selectedCampaign && (
              <div className="mb-6">
                <QRCode value={qrCodeUrl} size={256} />
              </div>
            )}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Thank You!</h2>
              <p className="text-gray-600">
                "The best way to find yourself is to lose yourself in the service of others." - Mahatma Gandhi
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Checkout;