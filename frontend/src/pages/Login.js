import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/tokenService';

export default function Login({ setRole }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post('/users/login', {
        username: formData.username,
        password: formData.password
      });

      // Store access token in localStorage (short-lived)
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data.id);

      // Log token storage (for debugging)
      console.log('🔑 TOKENS CREATED & STORED:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📱 ACCESS TOKEN:');
      console.log('   Token:', res.data.accessToken);
      console.log('   Type: Bearer Token');
      console.log('   Storage: localStorage');
      console.log('   Expires: 15 minutes');
      console.log('');
      console.log('🔄 REFRESH TOKEN:');
      console.log('   Token: [Stored in httpOnly cookie]');
      console.log('   Type: HttpOnly Cookie');
      console.log('   Storage: Browser Cookie (httpOnly)');
      console.log('   Expires: 7 days');
      console.log('');
      console.log('👤 USER INFO:');
      console.log('   Role:', res.data.role);
      console.log('   User ID:', res.data.id);
      console.log('   Username:', formData.username);
      console.log('   Timestamp:', new Date().toISOString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');

      if (setRole) setRole(res.data.role);

      alert(res.data.message);

      // Add a small delay to ensure state is set before navigation
      setTimeout(() => {
        if (res.data.role === 'admin') navigate('/admin-dashboard');
        else if (res.data.role === 'employee') navigate('/employee-dashboard');
        else if (res.data.role === 'user') navigate('/user-dashboard');
        else navigate('/');
      }, 100);

    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-orange-500 mb-6 text-center">Login</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Don’t have an account?{' '}
          <Link to="/register" className="text-orange-500 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
