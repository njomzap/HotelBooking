import React, { useEffect, useState } from "react";
import api from "../../services/tokenService";
import AdminLayout from "../../components/AdminLayout";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    phone: "",
    birthday: "",
    name: "",
  });
  const [newUsername, setNewUsername] = useState("");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/me");
        setUserData({
          username: res.data.username || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          birthday: res.data.birthday || "",
          name: res.data.name || "",
        });
        setNewUsername(res.data.username || "");
      } catch (err) {
        console.error(err);
        alert("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const updateUsername = async () => {
    if (!newUsername.trim()) return alert("Please enter a new username");
    try {
      await api.put("/users/me/username", { username: newUsername });
      alert("Username updated successfully");
      setUserData({ ...userData, username: newUsername });
      setNewUsername("");
    } catch {
      alert("Failed to update username");
    }
  };

  const changePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwords;
    if (!currentPassword || !newPassword || !confirmPassword) return alert("All fields required");
    if (newPassword !== confirmPassword) return alert("Passwords do not match");
    try {
      await api.put("/users/me/password", { currentPassword, newPassword });
      alert("Password updated");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      alert("Failed to update password");
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Delete account?")) return;
    try {
      await api.delete("/users/me");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      navigate("/login");
    } catch {
      alert("Failed to delete account");
    }
  };

  const getInitials = () => (userData.name?.charAt(0) || userData.username?.charAt(0) || "A").toUpperCase();

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not provided";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 -m-6 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-orange-100">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                {getInitials()}
              </div>
              <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {userData.name || userData.username}
                </h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Account Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold">
                    AI
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
                    <p className="text-sm text-gray-500">Your registered details</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                    <p className="font-medium text-gray-900 break-all">{userData.email || "Not provided"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                      <p className="font-medium text-gray-900">{userData.phone || "Not provided"}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Birthday</p>
                      <p className="font-medium text-gray-900">{formatDate(userData.birthday)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Update Username */}
              <div className="bg-white rounded-2xl shadow-md p-6 border border-orange-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-600 font-bold">
                    UN
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Change Username</h2>
                    <p className="text-sm text-gray-500">Update your display name</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    name="newUsername"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter new username"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                  <button
                    onClick={updateUsername}
                    className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Security */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold">
                    PW
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Password</h2>
                    <p className="text-sm text-gray-500">Change your password</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="Current"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-500 focus:outline-none text-sm"
                  />
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="New"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-500 focus:outline-none text-sm"
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-500 focus:outline-none text-sm"
                  />
                  <button
                    onClick={changePassword}
                    className="w-full py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>

              <div className="bg-red-50 rounded-2xl shadow-md p-6 border border-red-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 font-bold">
                    !
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-red-700">Danger Zone</h2>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Delete your account permanently. This cannot be undone.
                </p>
                <button
                  onClick={deleteAccount}
                  className="w-full py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}


