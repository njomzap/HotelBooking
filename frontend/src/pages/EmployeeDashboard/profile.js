import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

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
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
    } catch {
      alert("Failed to delete account");
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <div className="bg-white p-6 rounded border space-y-4">
        <h2 className="font-medium">Account Info</h2>
        <p><strong>Email:</strong> {email}</p>
        <div className="flex gap-2 mt-2">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border px-3 py-2 rounded flex-1"
            placeholder="Username"
          />
          <button
            onClick={updateUsername}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Save
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded border space-y-4">
        <h2 className="font-medium">Change Password</h2>
        <input
          type="password"
          placeholder="Current Password"
          value={passwords.currentPassword}
          onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="password"
          placeholder="New Password"
          value={passwords.newPassword}
          onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={passwords.confirmPassword}
          onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <button
          onClick={changePassword}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          Update Password
        </button>
      </div>

      <div className="flex justify-end">
        <button
          onClick={deleteAccount}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
