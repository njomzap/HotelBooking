import React from 'react';
import { Link } from 'react-router-dom';

export default function SimpleUserDashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Welcome to BookYourStay</h1>
      <p className="mb-6 text-gray-700">Find the best hotels at the best prices!</p>

      <Link
        to="/user/hotels"
        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
      >
        Browse Hotels
      </Link>
    </div>
  );
}


