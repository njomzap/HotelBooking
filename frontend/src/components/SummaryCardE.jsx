import React from "react";

export default function SummaryCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center justify-center">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
}
