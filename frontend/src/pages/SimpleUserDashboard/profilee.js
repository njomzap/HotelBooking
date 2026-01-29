import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/tokenService";

export default function Profile() {
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  const [currentUsername, setCurrentUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);

  // Fetch current username
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/me");
        setCurrentUsername(res.data.username || "");
      } catch (err) {
        console.error(err);
        alert("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Update username
  const updateUsername = async () => {
    if (!newUsername.trim()) {
      alert("Please enter a new username");
      return;
    }

    try {
      await api.put(
        "/users/me/username",
        { username: newUsername }
      );

      alert("Username updated successfully!");
      setCurrentUsername(newUsername);
      setNewUsername("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update username");
    }
  };

  // Update password
  const updatePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    try {
      await api.put(
        "/users/me/password",
        passwords
      );

      alert("Password updated successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update password");
    }
  };

  // Delete account
  const deleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;

    try {
      await api.delete("/users/me");
      alert("Account deleted successfully");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      navigate("/register");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete account");
    }
  };

  if (loading) return <p className="text-center mt-12 text-gray-600">Loading profile...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-24 space-y-10 p-6">
      <h1 className="text-3xl font-bold text-gray-800 text-center">My Profile</h1>

      {/* Username Card */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4 border border-gray-200">
        <h2 className="text-xl font-semibold text-orange-500">Update Username</h2>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            value={currentUsername}
            disabled
            className="w-full md:flex-1 border rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
          />
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Enter new username"
            className="w-full md:flex-1 border rounded-lg px-4 py-2"
          />
          <button
            onClick={updateUsername}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition"
          >
            Save
          </button>
        </div>
      </div>

      {/* Password Card */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4 border border-gray-200">
        <h2 className="text-xl font-semibold text-orange-500">Change Password</h2>
        <div className="flex flex-col gap-3">
          <input
            type="password"
            placeholder="Current password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
          />
          <input
            type="password"
            placeholder="New password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
          />
          <button
            onClick={updatePassword}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition mt-2"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* Delete Account Card */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-3 border border-gray-200">
        <h2 className="text-xl font-semibold text-red-500">Delete Account</h2>
        <p className="text-gray-600">This action is permanent and cannot be undone.</p>
        <button
          onClick={deleteAccount}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition"
        >
          Delete My Account
        </button>
      </div>
    </div>
  );
}



