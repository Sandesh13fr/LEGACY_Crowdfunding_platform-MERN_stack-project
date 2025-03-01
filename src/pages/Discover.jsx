import React, { useState, useEffect } from 'react';
import { Heart, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Discover() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get('https://api.jsonbin.io/v3/b/67b70ec1acd3cb34a8e9890e', {
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

  const handleSupportClick = () => {
    if (!isLoggedIn) {
      navigate('/signin');
    } else {
      // Handle the support action
    }
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === '' || campaign.category === selectedCategory)
  );

  return (
    <div className="pt-24 w-screen">
      {/* Hero Section */}
      <section className="py-20 bg-emerald-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-800 mb-6">Discover Campaigns</h1>
            <p className="text-xl text-gray-600">
              Search and support our ongoing initiatives to create lasting change in communities worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-10">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-black"
              />
              <Search className="absolute top-3 right-4 w-5 h-5 text-gray-400" />
            </div>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-black"
              >
                <option value="">All Categories</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Environment">Environment</option>
                <option value="Community Development">Community</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Campaigns Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCampaigns.map((campaign, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img src={campaign.image} alt={campaign.title} className="w-full h-48 object-cover" />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-emerald-600">
                    {campaign.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">{campaign.title}</h3>
                  <p className="text-gray-600 mb-6">{campaign.description}</p>
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Raised: ${campaign.raised.toLocaleString()}</span>
                      <span>Goal: ${campaign.goal.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full" 
                        style={{ width: `${(campaign.raised / campaign.goal) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <button 
                    className="w-full bg-emerald-600 text-white py-3 rounded-full hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 hover:text-amber-300"
                    onClick={handleSupportClick}
                  >
                    <Heart className="w-5 h-5" /> Support This Campaign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Discover;