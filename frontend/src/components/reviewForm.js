import React, { useState } from "react";
import axios from "axios";

const AddReviewForm = ({ hotelId, onReviewAdded }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); 
      const res = await axios.post(
        "http://localhost:5000/api/reviews",
        { hotel_id: hotelId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRating(5);
      setComment("");
      if (onReviewAdded) onReviewAdded(res.data); 
    } catch (err) {
      console.error("Error adding review:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-orange-50 p-4 rounded-2xl shadow-md space-y-3">
      <div>
        <label className="font-semibold">Rating:</label>
        <select
          value={rating}
          onChange={(e) => setRating(parseInt(e.target.value))}
          className="ml-2 border px-2 py-1 rounded"
        >
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>{r}⭐</option>
          ))}
        </select>
      </div>
      <div>
        <label className="font-semibold">Comment:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          className="w-full border px-2 py-1 rounded mt-1"
        />
      </div>
      <button
        type="submit"
        className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Add Review"}
      </button>
    </form>
  );
};

export default AddReviewForm;
