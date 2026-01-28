import React from "react";

export default function QuickActionButton({ title, onClick }) {
  return (
    <button
      onClick={onClick} 
      className="bg-orange-500 text-white px-6 py-3 rounded shadow hover:bg-orange-600 transition"
    >
      {title}
    </button>
  );
}
