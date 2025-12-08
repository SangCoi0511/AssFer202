import React, { useState, useEffect } from 'react';
import { getWishlist, removeFromWishlist } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useShop } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { FiTrash2, FiShoppingCart } from 'react-icons/fi';
import '../styles/Wishlist.css';

const Wishlist = () => {
  const { user } = useAuth();
  const { products } = useShop();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      const response = await getWishlist(user.id);
      const wishlistProducts = response.data.map(item => 
        products.find(p => p.id === item.productId)
      ).filter(Boolean);
      setWishlistItems(wishlistProducts);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    }
  };

  const handleRemove = async (productId) => {
    try {
      // Find wishlist entry
      const response = await getWishlist(user.id);
      const entry = response.data.find(item => item.productId === productId);
      if (entry) {
        await removeFromWishlist(entry.id);
        loadWishlist();
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-empty">
        <h2>Your wishlist is empty</h2>
        <Link to="/shop" className="btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <h1>My Wishlist</h1>

        <div className="wishlist-grid">
          {wishlistItems.map(product => (
            <div key={product.id} className="wishlist-item">
              <Link to={`/product/${product.id}`}>
                <img src={product.image} alt={product.name} />
              </Link>
              <div className="wishlist-item-info">
                <Link to={`/product/${product.id}`}>
                  <h3>{product.name}</h3>
                </Link>
                <p className="item-price">${product.price.toFixed(2)}</p>
                <div className="wishlist-actions">
                  <button
                    onClick={() => addToCart(product)}
                    className="btn-add"
                  >
                    <FiShoppingCart /> Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="btn-remove"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
