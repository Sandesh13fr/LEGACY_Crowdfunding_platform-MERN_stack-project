import React, { useState, useRef, useEffect } from 'react';
import { Heart, Apple, Users, Stethoscope, GraduationCap, Play, ArrowRight } from 'lucide-react';
import CountUp from 'react-countup';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../App';

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const modalRef = useRef(null);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await api.get("/api/campaigns");
        setCampaigns(response.data);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };

    fetchCampaigns();
  }, []);

  const handleWatchVideoClick = () => {
    setIsModalOpen(true);
  };

  const handleOutsideClick = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isModalOpen]);

  const handleDonateClick = (campaignTitle) => {
    if (!isLoggedIn) {
      navigate('/signin');
    } else {
      navigate(`/checkout`);
    }
  };

  return (
    <div className='pt-24 w-screen px-3'>
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-emerald-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl font-bold text-gray-800 leading-tight mb-6">
                Create Your Legacy Through Giving
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Join us in making a difference. Every contribution counts towards creating a better world for those in need.
              </p>
              <div className="flex gap-4">
                <button 
                  className="bg-emerald-600 text-white px-8 py-3 rounded-full hover:bg-emerald-700 transition-colors flex items-center gap-2"
                  onClick={() => handleDonateClick('')}
                >
                  Donate Now <Heart className="w-5 h-5" />
                </button>
                <button 
                  className="border-2 border-emerald-600 text-emerald-600 px-8 py-3 rounded-full hover:bg-emerald-50 transition-colors flex items-center gap-2"
                  onClick={handleWatchVideoClick}
                >
                  Watch Video <Play className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-8 mt-12">
                <div>
                  <h3 className="text-4xl font-bold text-emerald-600 mb-2">
                    <CountUp end={15} suffix="K+" duration={2.5} />
                  </h3>
                  <p className="text-gray-600">Volunteers</p>
                </div>
                <div>
                  <h3 className="text-4xl font-bold text-emerald-600 mb-2">
                    <CountUp end={100} suffix="+" duration={2.5} />
                  </h3>
                  <p className="text-gray-600">Campaigns</p>
                </div>
                <div>
                  <h3 className="text-4xl font-bold text-emerald-600 mb-2">
                    <CountUp end={600} suffix="+" duration={2.5} />
                  </h3>
                  <p className="text-gray-600">Events</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800"
                alt="Helping hands"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=200"
                  alt="Volunteer"
                  className="w-16 h-16 rounded-full"
                />
              </div>
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=200"
                  alt="Volunteer"
                  className="w-16 h-16 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Program to Empower Others</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We focus on key areas where we can make the biggest impact, working together with communities to create lasting change.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Apple, title: "Healthy Food", description: "Providing nutritious meals to those in need" },
              { icon: Stethoscope, title: "Medical Help", description: "Access to quality healthcare services" },
              { icon: Users, title: "Social Service", description: "Building stronger communities together" },
              { icon: GraduationCap, title: "Education", description: "Empowering through knowledge" }
            ].map((program, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <program.icon className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{program.title}</h3>
                <p className="text-gray-600 mb-4">{program.description}</p>
                <a href="#" className="text-emerald-600 font-medium flex items-center gap-2 hover:text-emerald-700">
                  Read More <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-20 bg-emerald-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Featured Campaigns</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Support our ongoing campaigns and help us make a difference in people's lives.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {campaigns.map((campaign, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg">
                <img src={`data:${campaign.posterImage.contentType};base64,${campaign.posterImage.data}`} alt={campaign.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">{campaign.title}</h3>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Goal: ${campaign.goalAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full" 
                        style={{ width: `${(campaign.raised / campaign.goalAmount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <button className="w-full bg-emerald-600 text-white py-2 rounded-full hover:bg-emerald-700 transition-colors" onClick={() => handleDonateClick(campaign.title)} >
                    Donate Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Create Your Legacy Through Giving
              </h2>
              <p className="text-white/90 mb-8">
                Your contribution can make a real difference in someone's life. Join us in our mission to create positive change.
              </p>
              <button 
                className="bg-white text-emerald-600 px-8 py-3 rounded-full hover:bg-emerald-50 transition-colors"
                onClick={() => handleDonateClick('')}
              >
                Donate Now
              </button>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800"
                alt="Donation"
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gradient-to-bl from-slate-50 to-green-200 bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg overflow-hidden  max-w-3xl w-90 h-50 sm:w-300 md:w-170 md:h-85 shadow-lg shadow-emerald-600">
            <div className="relative pb-9/16">
            <iframe className="w-full h-50 md:h-85 border border-red-300" src="https://www.youtube.com/embed/voF1plqqZJA?si=yYQ0FEXBQeQS3DYE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;