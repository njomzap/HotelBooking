import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AddReviewForm from "./reviewForm";

const ReviewsList = ({ hotelId }) => {
  const [reviews, setReviews] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("accessToken"));

  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const userId = Number(localStorage.getItem("userId"));

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(!!localStorage.getItem("accessToken"));
    };

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/reviews/${hotelId}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  }, [hotelId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleReviewAdded = () => {
    fetchReviews();
  };

  const startEditing = (review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating || 5);
    setEditComment(review.comment || "");
  };

  const cancelEditing = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment("");
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/reviews/${id}`,
        { rating: editRating, comment: editComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      cancelEditing();
      fetchReviews();
    } catch (err) {
      console.error("Error updating review:", err);
      alert("Failed to update review. Make sure you are authorized.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReviews();
    } catch (err) {
      console.error("Error deleting review:", err);
      alert("Failed to delete review. Make sure you are authorized.");
    }
  };

  return (
    <div className="space-y-8">
   
      {isLoggedIn ? (
        <div>
          <h3 className="text-xl font-semibold text-orange-600 mb-4">Add a Review</h3>
          <AddReviewForm hotelId={hotelId} onReviewAdded={handleReviewAdded} />
        </div>
      ) : (
        <div className="p-4 border border-dashed border-orange-200 rounded-2xl bg-orange-50 text-sm text-gray-600">
          Please log in to share your experience.
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold text-orange-600 mb-4">Reviews</h3>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 hover:shadow-lg transition-shadow duration-300"
              >
                {/* Header: avatar, username, rating */}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                      {r.username[0].toUpperCase()}
                    </div>
                    <p className="font-semibold">{r.username}</p>
                  </div>
                  <p className="text-yellow-500 font-semibold">{'⭐'.repeat(r.rating)}</p>
                </div>

                {editingReviewId === r.id ? (
                  token && (r.user_id === userId || role === "admin") ? (
                    <>
                      <div className="flex items-center gap-2 mt-2">
                        <label className="font-medium">Rating:</label>
                        <select
                          value={editRating}
                          onChange={(e) => setEditRating(parseInt(e.target.value))}
                          className="border px-2 py-1 rounded"
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n}⭐
                            </option>
                          ))}
                        </select>
                      </div>
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        className="w-full border px-2 py-1 rounded mt-2"
                        rows={3}
                      />
                      <div className="flex gap-2 mt-2 justify-end">
                        <button
                          onClick={() => handleUpdate(r.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-700 mt-1">{r.comment}</p>
                  )
                ) : (
                  <>
                    <p className="text-gray-700 mt-1">{r.comment}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>

                    {/* Edit/Delete buttons - only visible if logged in AND owner/admin */}
                    {token && (r.user_id === userId || role === "admin") && (
                      <div className="mt-2 flex gap-4 justify-end text-sm">
                        <button
                          onClick={() => startEditing(r)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsList;
