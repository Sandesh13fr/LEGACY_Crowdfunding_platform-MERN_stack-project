import React, { useState } from 'react';

const StartCampaign = () => {
  const [campaignName, setCampaignName] = useState('');
  const [posterImage, setPosterImage] = useState(null);
  const [goalAmount, setGoalAmount] = useState('');
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        // Check if the image dimensions are 800x600
        if (img.width === 800 && img.height === 600) {
          setPosterImage(file);
          setError('');
        } else {
          setError('Image must be 800x600 pixels.');
        }
      };
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!campaignName || !posterImage || !goalAmount || !title || !shortDescription || !deadline || !category) {
      setError('Please fill in all fields.');
      return;
    }

    const formData = new FormData();
    formData.append('campaignName', campaignName);
    formData.append('posterImage', posterImage);
    formData.append('goalAmount', goalAmount);
    formData.append('title', title);
    formData.append('shortDescription', shortDescription);
    formData.append('deadline', deadline);
    formData.append('category', category);

    try {
      const token = localStorage.getItem('authToken'); // Assuming the token is stored in localStorage
      const response = await fetch('/campaigns', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Campaign created successfully!');
      } else {
        alert('Failed to create campaign.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while creating the campaign.');
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Start a New Campaign</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Campaign Name:
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Title:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Short Description:
              </label>
              <textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Goal Amount:
              </label>
              <input
                type="number"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Deadline:
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Select a category</option>
                <option value="Education">Education</option>
                <option value="Environment">Environment</option>
                <option value="Health">Health</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Sports">Sports</option>
                <option value="Community Development">Community Development</option>
                <option value="Technology">Technology</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Upload Poster Image (800x600):
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs italic">{error}</p>}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-emerald-500 text-white px-6 py-2 rounded-md hover:bg-emerald-600"
              >
                Start Campaign
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StartCampaign;