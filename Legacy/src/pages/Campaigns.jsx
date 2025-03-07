import React, { useState, useEffect } from "react";
import { Heart, Share2, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from '../App';

function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await api.get("//api/campaigns");
        setCampaigns(response.data);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };

    fetchCampaigns();
  }, []);

  const handleStartCampaignClick = () => {
    if (!isLoggedIn) {
      navigate("/signin");
    } else {
      navigate("/startCampaign"); // Example navigation to start campaign page
    }
  };

  const handleDonateClick = () => {
    if (!isLoggedIn) {
      navigate("/signin");
    } else {
      navigate("/checkout"); // Example navigation to donate page
    }
  };

  return (
    <div className="pt-24 w-screen">
      {/* Hero Section */}
      <section className="py-20 bg-emerald-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-800 mb-6">
              Active Campaigns
            </h1>
            <p className="text-xl text-gray-600">
              Support our ongoing initiatives and help us create lasting change
              in communities worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Campaigns Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((campaign, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="relative">
                  <img
                    src={`data:${campaign.posterImage.contentType};base64,${campaign.posterImage.data}`}
                    alt={campaign.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-emerald-600">
                    {campaign.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {campaign.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {campaign.shortDescription}
                  </p>
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Goal: ₹{campaign.goalAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (campaign.raised / campaign.goalAmount) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {campaign.daysLeft} days left
                      </span>
                    </div>
                    <button className="text-emerald-600 hover:text-emerald-700">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    className="w-full bg-emerald-600 text-white py-3 rounded-full hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 hover:text-amber-300"
                    onClick={handleDonateClick}
                  >
                    <Heart className="w-5 h-5" /> Support This Campaign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Start Campaign Section */}
      <section className="py-20 bg-emerald-600">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Start Your Own Campaign
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Have a cause you're passionate about? Start your own fundraising
              campaign and make a difference in your community.
            </p>
            <button
              className="bg-white text-emerald-600 px-8 py-3 rounded-full hover:bg-emerald-50 transition-colors"
              onClick={handleStartCampaignClick}
            >
              Start a Campaign
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Campaigns;
