import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getProductById,
  getReviewsByProduct,
  createReview,
} from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { FiShoppingCart, FiHeart, FiStar } from "react-icons/fi";
import "../styles/ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);
  const { addToCart, cartItems } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    loadProductData();
  }, [id]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      const [productRes, reviewsRes] = await Promise.all([
        getProductById(id),
        getReviewsByProduct(id),
      ]);
      setProduct(productRes.data);

      // Fetch user data for each review
      const { getUsers } = await import("../services/api");
      const usersRes = await getUsers();
      const usersMap = usersRes.data.reduce((acc, user) => {
        acc[user.id] = user.name;
        return acc;
      }, {});

      // Add user names to reviews
      const reviewsWithUsers = reviewsRes.data.map((review) => ({
        ...review,
        userName: usersMap[review.userId] || "Anonymous",
      }));

      setReviews(reviewsWithUsers);
    } catch (error) {
      console.error("Failed to load product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    // Check if product is in stock
    if (product.stock <= 0) {
      alert("This product is out of stock.");
      return;
    }

    // Check existing quantity in cart
    const existingItem = cartItems.find((item) => item.id === product.id);
    const currentCartQuantity = existingItem ? existingItem.quantity : 0;
    const totalQuantity = currentCartQuantity + quantity;
    console.log(totalQuantity);

    // Check if total quantity exceeds stock
    if (totalQuantity > product.stock) {
      const availableToAdd = product.stock - currentCartQuantity;
      if (availableToAdd <= 0) {
        alert(
          `You already have maximum stock (${product.stock}) in your cart.`
        );
      } else {
        alert(
          `Cannot add ${quantity} items. You can only add ${availableToAdd} more (${currentCartQuantity} already in cart, ${product.stock} total stock).`
        );
      }
      return;
    }

    addToCart(product, quantity);
    alert("Added to cart successfully!");
  };

  const { addToWishlist: addToWishlistContext } = useWishlist();

  const handleAddToWishlist = async () => {
    const result = await addToWishlistContext(Number(id));
    if (result.success) {
      alert("Added to wishlist!");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to submit a review");
      return;
    }

    try {
      await createReview({
        productId: Number(id),
        userId: user.id,
        rating: Number(rating),
        comment,
        date: new Date().toISOString(),
      });
      setComment("");
      setRating(5);
      loadProductData(); // Reload reviews
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!product) {
    return <div className="error-container">Product not found</div>;
  }

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* Product Info Section */}
        <div className="product-main">
          <div className="product-image-large">
            <img src={product.image} alt={product.name} />
          </div>

          <div className="product-details">
            <h1>{product.name}</h1>

            <div className="product-rating">
              <FiStar className="star-icon" />
              <span>
                {product.rating} ({reviews.length} reviews)
              </span>
            </div>

            <div className="product-price-large">
              ${product.price.toFixed(2)}
            </div>

            <p className="product-description">{product.description}</p>

            <div className="product-stock-info">
              {product.stock > 0 ? (
                <span className="in-stock">{product.stock} in stock</span>
              ) : (
                <span className="out-of-stock">Out of stock</span>
              )}
            </div>

            <div className="product-actions-large">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>

              <button
                className="btn-add-to-cart"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <FiShoppingCart /> Add to Cart
              </button>

              <button
                className="btn-wishlist-large"
                onClick={handleAddToWishlist}
              >
                <FiHeart /> Add to Wishlist
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h2>Customer Reviews & Comments</h2>

          {user && (
            <form className="review-form" onSubmit={handleSubmitReview}>
              <h3>Write a Review</h3>
              <div className="form-group">
                <label>Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              <div className="form-group">
                <label>Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                  required
                />
              </div>
              <button type="submit" className="btn-primary">
                Submit Review
              </button>
            </form>
          )}

          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="review-info">
                      <span className="review-user">{review.userName}</span>
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={
                              i < review.rating ? "star-filled" : "star-empty"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <span className="review-date">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="no-reviews">
                No reviews yet. Be the first to review!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
