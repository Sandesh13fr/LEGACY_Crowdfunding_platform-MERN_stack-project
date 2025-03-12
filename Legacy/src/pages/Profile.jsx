import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../App";

function Profile() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    profilePicture: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef();
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/signin");
    }
  }, [isLoggedIn, navigate]);

  // Fetch user data on component mount
  useEffect(() => {
    if (isLoggedIn) {
      fetchUserData();
    }
  }, [isLoggedIn]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token found");
      }

      // Using axios properly
      const response = await api.get("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // With axios, data is in response.data
      const data = response.data;
      
      setUserData(data);
      setNewName(data.name || "");
      setPreviewUrl(data.profilePicture || "");
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load profile information");
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword && newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("name", newName);
      if (newPassword) {
        formData.append("password", newPassword);
      }
      if (newProfilePicture) {
        formData.append("profilePicture", newProfilePicture);
      }

      // Using axios properly
      const response = await api.put("/api/profile/update", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // With axios, data is in response.data
      const responseData = response.data;
      
      setSuccess("Profile updated successfully");
      setUserData((prev) => ({
        ...prev,
        name: newName,
        profilePicture: responseData.profilePicture || prev.profilePicture,
      }));
      setIsEditing(false);
      setNewPassword("");
      setConfirmNewPassword("");
      setNewProfilePicture(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.error || "Error updating profile");
    }
  };
  const getProfileImageUrl = (url) => {
    if (!url) return "https://placehold.co/300x300?font=raleway&text=ProfilePicture";
    if (url.includes("localhost:5000")) {
      return url.replace("https://legacy-api-rbyi.onrender.com", "http://localhost:5000");
    }
    return url.startsWith("http") ? url : `https://legacy-api-rbyi.onrender.com${url}`;
  };

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {!isEditing ? (
            <div>
              <div className="flex flex-col items-center mb-6">
                <div className="mb-4">
                 
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                  Name
                </h2>
                <p className="text-gray-600">{userData.name}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                  Email
                </h2>
                <p className="text-gray-600">{userData.email}</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-emerald-500 text-white px-6 py-2 rounded-md hover:bg-emerald-600"
                >
                  Edit Profile
                </button>
                <button
                  onClick={logout}
                  className="border border-red-500 text-red-500 px-6 py-2 rounded-md hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile}>
              <div className="flex flex-col items-center mb-6">
                <div className="mb-4 relative">
                 <img
  src={getProfileImageUrl(userData.profilePicture)}
  alt="Profile"
  className="w-32 h-32 rounded-full object-cover border-2 border-emerald-500"
/>
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="absolute bottom-0 right-0 bg-emerald-500 text-white p-2 rounded-full shadow-md hover:bg-emerald-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Click the camera icon to change your profile picture
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={userData.email}
                  disabled
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 bg-gray-100 leading-tight"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-emerald-500 text-white px-6 py-2 rounded-md hover:bg-emerald-600"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setNewName(userData.name);
                    setNewPassword("");
                    setConfirmNewPassword("");
                    setError("");
                    setNewProfilePicture(null);
                    setPreviewUrl(userData.profilePicture || "");
                  }}
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
