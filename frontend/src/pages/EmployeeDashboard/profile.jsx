import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [username, setUsername] = useState("");
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Fetch current username
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/me", authHeaders);
        setUsername(res.data.username);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch user info");
      }
    };
    fetchProfile();
  }, []);

  // Update username
  const updateUsername = async () => {
    if (!username) return alert("Username cannot be empty");

    try {
      await axios.put(
        "http://localhost:5000/api/users/me/username",
        { username },
        authHeaders
      );
      alert("Username updated successfully");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update username");
    }
  };

  // Change password
  const changePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!currentPassword || !newPassword || !confirmPassword)
      return alert("All password fields are required");

    if (newPassword !== confirmPassword)
      return alert("New password and confirm password do not match");

    try {
      await axios.put(
        "http://localhost:5000/api/users/me/password",
        { currentPassword, newPassword },
        authHeaders
      );
      alert("Password updated successfully");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update password");
    }
  };

  // Delete account
  const deleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

    try {
      await axios.delete("http://localhost:5000/api/users/me", authHeaders);
      alert("Account deleted successfully");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete account");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-6">
      <h1 className="text-2xl font-semibold">My Profile</h1>

      {/* Username */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-medium">Change Username</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <button
            onClick={updateUsername}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-medium">Change Password</h2>
        <input
          type="password"
          name="currentPassword"
          placeholder="Current password"
          value={passwords.currentPassword}
          onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="password"
          name="newPassword"
          placeholder="New password"
          value={passwords.newPassword}
          onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm new password"
          value={passwords.confirmPassword}
          onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        <button
          onClick={changePassword}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
        >
          Update Password
        </button>
      </div>

      {/* Delete Account */}
      <div className="flex justify-end">
        <button
          onClick={deleteAccount}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Profile;

