import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useShop } from '../context/ShopContext';
import { useWishlist } from '../context/WishlistContext';
import { Link } from 'react-router-dom';
import { FiTrash2, FiShoppingCart } from 'react-icons/fi';
import '../styles/Wishlist.css';

const Wishlist = () => {
  const { user } = useAuth();
  const { products } = useShop();
  const { addToCart } = useCart();
  const { wishlistItems: wishlistData, removeFromWishlist } = useWishlist();
  const [wishlistProducts, setWishlistProducts] = useState([]);

  useEffect(() => {
    // Map wishlist items to actual products
    const mappedProducts = wishlistData.map(item => 
      products.find(p => p.id === item.productId)
    ).filter(Boolean);
    setWishlistProducts(mappedProducts);
  }, [wishlistData, products]);

  const handleRemove = async (productId) => {
    // Find wishlist entry
    const entry = wishlistData.find(item => item.productId === productId);
    if (entry) {
      const result = await removeFromWishlist(entry.id);
      if (result.success) {
        // Product will be auto-removed from wishlistProducts via useEffect
      }
    }
  };

  if (wishlistProducts.length === 0) {
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
          {wishlistProducts.map(product => (
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
