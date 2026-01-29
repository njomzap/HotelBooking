import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/me", authHeaders);
        setUsername(res.data.username);
        setEmail(res.data.email);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch profile");
      }
    };
    fetchProfile();
  }, []);

  const updateUsername = async () => {
    if (!username) return alert("Username cannot be empty");
    try {
      await axios.put(
        "http://localhost:5000/api/users/me/username",
        { username },
        authHeaders
      );
      alert("Username updated successfully");
    } catch {
      alert("Failed to update username");
    }
  };

  const changePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwords;
    if (!currentPassword || !newPassword || !confirmPassword) return alert("All fields are required");
    if (newPassword !== confirmPassword) return alert("Passwords do not match");
    try {
      await axios.put(
        "http://localhost:5000/api/users/me/password",
        { currentPassword, newPassword },
        authHeaders
      );
      alert("Password updated successfully");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      alert("Failed to update password");
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;
    try {
      await axios.delete("http://localhost:5000/api/users/me", authHeaders);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
    } catch {
      alert("Failed to delete account");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-semibold text-gray-900 text-center">
          {username ? `${username}'s Profile` : "Profile"}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6 space-y-4 border border-orange-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-semibold">UN</div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Update username</h2>
                <p className="text-sm text-gray-500">This name appears in internal logs and approvals.</p>
              </div>
            </div>
            <div className="space-y-4">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-200 px-5 py-3 rounded-2xl text-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder="Username"
              />
              <button
                onClick={updateUsername}
                className="w-full px-5 py-3 rounded-2xl bg-orange-500 text-white font-semibold hover:bg-orange-600"
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
                <p className="text-sm text-gray-500">Set a secure credential used for shift operations.</p>
              </div>
            </div>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <input
                type="password"
                placeholder="New password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <button
                onClick={changePassword}
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
            <p className="text-sm text-gray-500">All employee assignments will be removed permanently.</p>
          </div>
          <button
            onClick={deleteAccount}
            className="px-5 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600"
          >
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}
