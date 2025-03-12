import React, { useState, useEffect } from 'react';
import { api } from '../components/axiosConfig';
import qrImage from '../assets/qr.jpeg';

function Checkout() {
  const [categories, setCategories] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await api.get('/api/campaigns', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        setCampaigns(response.data);
        const uniqueCategories = [...new Set(response.data.map(campaign => campaign.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };

    fetchCampaigns();
  }, []);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedCampaign('');
  };

  const handleCampaignChange = (e) => {
    const selected = e.target.value;
    setSelectedCampaign(selected);
    setQrCodeUrl(`https://payment-processor.com/pay?campaign=${selected}`);
  };

  const filteredCampaigns = campaigns.filter(campaign => campaign.category === selectedCategory);

  return (
    <div className="pt-24 w-screen px-3">
      <section className="py-20 bg-emerald-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-800 mb-6">Checkout</h1>
            <p className="text-xl text-gray-600 mb-8">
              Select a category and campaign to support and complete your payment.
            </p>
            <div className="mb-6">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-black"
              >
                <option value="">Select a Category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            {selectedCategory && (
              <div className="mb-6">
                <select
                  value={selectedCampaign}
                  onChange={handleCampaignChange}
                  className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-black"
                >
                  <option value="">Select a Campaign</option>
                  {filteredCampaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.title}>
                      {campaign.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {/* Always display the QR image from assets */}
            <div className="mb-6">
              <img src={qrImage} alt="QR Code" className="mx-auto w-80 bg-blend-difference rounded-4xl" />
            </div>
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