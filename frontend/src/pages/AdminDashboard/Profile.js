import React, { useEffect, useState } from "react";
import api from "../../services/tokenService";
import AdminLayout from "../../components/AdminLayout";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const [username, setUsername] = useState("");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/me");
        setUsername(res.data.username);
      } catch {
        alert("Failed to fetch profile");
      }
    };
    fetchProfile();
  }, []);

  const updateUsername = async () => {
    if (!username) return alert("Username cannot be empty");
    try {
      await api.put("/users/me/username", { username });
      alert("Username updated successfully");
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

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 -m-6 p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <h1 className="text-3xl font-semibold text-gray-900 text-center">
            {username ? `${username}'s Profile` : "Profile"}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow p-6 space-y-4 border border-orange-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-semibold">UN</div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Change username</h2>
                  <p className="text-sm text-gray-500">Keep your admin identity fresh for audit logs.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                <button
                  onClick={updateUsername}
                  className="self-start px-5 py-2 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600"
                >
                  Save changes
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6 space-y-4 border border-orange-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-semibold">PW</div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Update password</h2>
                  <p className="text-sm text-gray-500">Choose a unique passphrase for stronger security.</p>
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

          <div className="bg-white rounded-2xl shadow p-6 border border-red-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-red-600">Delete account</h2>
                <p className="text-sm text-gray-500">This action cannot be undone and removes admin access entirely.</p>
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
      </div>
    </AdminLayout>
  );
}


