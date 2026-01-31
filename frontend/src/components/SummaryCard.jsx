import React from "react";

export default function SummaryCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
      <p className="text-sm uppercase tracking-wide text-gray-400">{title}</p>
      <p className="text-3xl font-semibold text-gray-900 mt-2">{value}</p>
    </div>
  );
}
