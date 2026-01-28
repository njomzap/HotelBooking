import React from "react";

export default function QuickActionButton({ title, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-lg shadow transition flex items-center justify-center font-semibold"
    >
      {title}
    </button>
  );
}
