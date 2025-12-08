import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { addToWishlist } from '../services/api';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import '../styles/Shop.css';

const Shop = () => {
  const { getFilteredProducts, categories, filters, updateFilters, loading } = useShop();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [displayCount, setDisplayCount] = useState(30);

  useEffect(() => {
    setFilteredProducts(getFilteredProducts());
    setDisplayCount(30); // Reset display count when filters change
  }, [filters]);

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleAddToWishlist = async (product) => {
    if (!user) {
      alert('Please login to add items to wishlist');
      return;
    }

    try {
      await addToWishlist({
        userId: user.id,
        productId: product.id,
      });
      alert('Added to wishlist!');
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      alert('Failed to add to wishlist');
    }
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 30);
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  const displayedProducts = filteredProducts.slice(0, displayCount);
  const hasMoreProducts = displayCount < filteredProducts.length;
  const remainingProducts = filteredProducts.length - displayCount;

  return (
    <div className="shop-page">
      <div className="shop-container">
        {/* Sidebar Filters */}
        <aside className="shop-sidebar">
          <div className="filter-section">
            <h3>Categories</h3>
            <div className="category-filters">
              <button
                className={!filters.categoryId ? 'active' : ''}
                onClick={() => updateFilters({ categoryId: null })}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={filters.categoryId === cat.id ? 'active' : ''}
                  onClick={() => updateFilters({ categoryId: cat.id })}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-range">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange[0]}
                onChange={(e) => updateFilters({ 
                  priceRange: [Number(e.target.value), filters.priceRange[1]] 
                })}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange[1]}
                onChange={(e) => updateFilters({ 
                  priceRange: [filters.priceRange[0], Number(e.target.value)] 
                })}
              />
            </div>
          </div>

          <div className="filter-section">
            <h3>Minimum Rating</h3>
            <select
              value={filters.minRating}
              onChange={(e) => updateFilters({ minRating: Number(e.target.value) })}
            >
              <option value="0">All Ratings</option>
              <option value="4">4 Stars & Above</option>
              <option value="4.5">4.5 Stars & Above</option>
            </select>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="shop-content">
          <div className="shop-header">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.searchQuery}
                onChange={(e) => updateFilters({ searchQuery: e.target.value })}
              />
            </div>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value })}
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <div className="products-grid">
            {displayedProducts.map(product => (
              <div key={product.id} className="product-card">
                <Link to={`/product/${product.id}`} className="product-image">
                  <img src={product.image} alt={product.name} />
                </Link>
                
                <div className="product-info">
                  <Link to={`/product/${product.id}`}>
                    <h3>{product.name}</h3>
                  </Link>
                  <div className="product-rating">
                    <FiStar className="star-icon" />
                    <span>{product.rating}</span>
                  </div>
                  <div className="product-price">${product.price.toFixed(2)}</div>
                  <div className="product-stock">
                    {product.stock > 0 ? (
                      <span className="in-stock">{product.stock} in stock</span>
                    ) : (
                      <span className="out-of-stock">Out of stock</span>
                    )}
                  </div>
                </div>

                <div className="product-actions">
                  <button
                    className="btn-cart"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <FiShoppingCart /> Add to Cart
                  </button>
                  <button 
                    className="btn-wishlist"
                    onClick={() => handleAddToWishlist(product)}
                  >
                    <FiHeart />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {hasMoreProducts && (
            <div className="load-more-container">
              <button onClick={handleLoadMore} className="btn-load-more">
                Load More Products ({remainingProducts} remaining)
              </button>
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="no-products">
              <p>No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
