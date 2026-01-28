import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [username, setUsername] = useState("");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/me", authHeaders);
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
      await axios.put("http://localhost:5000/api/users/me/username", { username }, authHeaders);
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
      await axios.put("http://localhost:5000/api/users/me/password", { currentPassword, newPassword }, authHeaders);
      alert("Password updated");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      alert("Failed to update password");
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Delete account?")) return;
    try {
      await axios.delete("http://localhost:5000/api/users/me", authHeaders);
      localStorage.removeItem("token");
      navigate("/login");
    } catch {
      alert("Failed to delete account");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold">Profile</h1>

        <div className="bg-white p-6 rounded border space-y-4">
          <h2 className="font-medium">Change Username</h2>
          <div className="flex gap-2">
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="border px-3 py-2 rounded flex-1" />
            <button onClick={updateUsername} className="bg-orange-500 text-white px-4 py-2 rounded">Save</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded border space-y-4">
          <h2 className="font-medium">Change Password</h2>
          <input type="password" placeholder="Current" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} className="w-full border px-3 py-2 rounded" />
          <input type="password" placeholder="New" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} className="w-full border px-3 py-2 rounded" />
          <input type="password" placeholder="Confirm" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} className="w-full border px-3 py-2 rounded" />
          <button onClick={changePassword} className="bg-orange-500 text-white px-4 py-2 rounded">Update Password</button>
        </div>

        <div className="flex justify-end">
          <button onClick={deleteAccount} className="bg-red-500 text-white px-4 py-2 rounded">Delete Account</button>
        </div>
      </div>
    </AdminLayout>
  );
}


