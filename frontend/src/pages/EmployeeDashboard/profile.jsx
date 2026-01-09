import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState({
    username: "",
    name: "",
    email: "",
    birthday: "",
    role: "admin",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` },
  };

  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/users/me",
          authHeaders
        );
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  
  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

 
  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  
  const saveProfile = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/users/me",
        {
          name: profile.name,
          email: profile.email,
          birthday: profile.birthday,
        },
        authHeaders
      );
      alert("Profile updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  
  const changePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    try {
      await axios.put(
        "http://localhost:5000/api/users/change-password",
        passwords,
        authHeaders
      );
      alert("Password updated successfully");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update password");
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      
      <h1 className="text-2xl font-semibold">My Profile</h1>

      
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-medium">Profile Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Username</label>
            <input
              value={profile.username}
              disabled
              className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Role</label>
            <input
              value={profile.role}
              disabled
              className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              name="email"
              type="email"
              value={profile.email}
              onChange={handleProfileChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Birthday</label>
            <input
              name="birthday"
              type="date"
              value={profile.birthday}
              onChange={handleProfileChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <button
          onClick={saveProfile}
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded"
        >
          Save Changes
        </button>
      </div>

     
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-medium">Change Password</h2>

        <div className="space-y-3">
          <input
            type="password"
            name="currentPassword"
            placeholder="Current password"
            value={passwords.currentPassword}
            onChange={handlePasswordChange}
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="password"
            name="newPassword"
            placeholder="New password"
            value={passwords.newPassword}
            onChange={handlePasswordChange}
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            value={passwords.confirmPassword}
            onChange={handlePasswordChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          onClick={changePassword}
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded"
        >
          Update Password
        </button>
      </div>

      
      <div className="flex justify-end">
        <button
          className="text-red-500 hover:underline"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.reload();
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default Profile;
