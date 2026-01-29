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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-3xl font-semibold text-gray-900 text-center">
          {currentUsername ? `${currentUsername}'s Profile` : "Profile"}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6 space-y-4 border border-orange-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-semibold">UN</div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Update username</h2>
                <p className="text-sm text-gray-500">Choose a new display name for your bookings.</p>
              </div>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new username"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <button
                onClick={updateUsername}
                className="px-5 py-2 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600"
              >
                Save changes
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 space-y-4 border border-orange-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-semibold">PW</div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Change password</h2>
                <p className="text-sm text-gray-500">Add a strong new password to keep your account safe.</p>
              </div>
            </div>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <input
                type="password"
                placeholder="New password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <button
                onClick={updatePassword}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800"
              >
                Update password
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border border-red-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-red-600">Delete account</h2>
            <p className="text-sm text-gray-500">Your bookings history will be removed permanently.</p>
          </div>
          <button
            onClick={deleteAccount}
            className="px-5 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600"
          >
            Delete my account
          </button>
        </div>
      </div>
    </div>
  );
}



