import { useState, useEffect } from 'react';
import { Star, MessageSquare, Send } from 'lucide-react';
import axios from 'axios';

export default function Reviews({ restaurantId, itemId, itemName }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchReviews();
  }, [restaurantId, itemId]);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/reviews/item/${restaurantId}/${itemId}`);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to add a review');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('userToken');
      const { data } = await axios.post('/api/reviews', {
        restaurantId,
        itemId,
        itemName,
        rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReviews([data.review, ...reviews]);
      setShowAddReview(false);
      setRating(5);
      setComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
      />
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Loading reviews...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-primary" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Reviews ({reviews.length})
          </h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-1 ml-2">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-gray-800 dark:text-white">{averageRating}</span>
            </div>
          )}
        </div>
        
        {user && !showAddReview && (
          <button
            onClick={() => setShowAddReview(true)}
            className="text-primary hover:text-red-600 font-semibold text-sm"
          >
            Write Review
          </button>
        )}
      </div>

      {/* Add Review Form */}
      {showAddReview && (
        <form onSubmit={handleSubmitReview} className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Your Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    size={32}
                    className={star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Your Review
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              rows="3"
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddReview(false);
                setRating(5);
                setComment('');
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
          <p>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {review.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {review.username || 'Anonymous'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              {review.comment && (
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
