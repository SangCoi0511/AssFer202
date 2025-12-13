import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { FiHeart, FiShoppingCart, FiStar } from "react-icons/fi";
import "../styles/Shop.css";

const Shop = () => {
  const { getFilteredProducts, categories, filters, updateFilters, loading } =
    useShop();
  const { addToCart, cartItems } = useCart();
  const { user } = useAuth();
  const { addToWishlist: addToWishlistContext, isInWishlist } = useWishlist();

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [displayCount, setDisplayCount] = useState(30);
  const [quantities, setQuantities] = useState({});
  const [modal, setModal] = useState({ show: false, title: "", message: "" });

  useEffect(() => {
    setFilteredProducts(getFilteredProducts());
    setDisplayCount(30);
  }, [filters]);

  const handleQuantityChange = (productId, value) => {
    const numValue = parseInt(value) || 1;
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, numValue),
    }));
  };

  const getQuantity = (productId) => {
    return quantities[productId] || 1;
  };

  const openModal = (title, message) => {
    setModal({ show: true, title, message });
  };

  const closeModal = () => setModal((prev) => ({ ...prev, show: false }));

  const handleAddToCart = (product) => {
    const quantity = getQuantity(product.id);

    // Check if product is in stock
    if (product.stock <= 0) {
      openModal("Notification", "This product is out of stock.");
      return;
    }

    // Check existing quantity in cart
    const existingItem = cartItems.find((item) => {
      return item.productId === product.id;
    });
    const currentCartQuantity = existingItem ? existingItem.quantity : 0;

    const totalQuantity = currentCartQuantity + quantity;

    // Check if total quantity exceeds stock
    if (totalQuantity > product.stock) {
      const availableToAdd = product.stock - currentCartQuantity;
      if (availableToAdd <= 0) {
        openModal(
          "Notification",
          `You already have maximum stock (${product.stock}) in your cart.`
        );
      } else {
        openModal(
          "Notification",
          `Cannot add ${quantity} items. You can only add ${availableToAdd} more (${currentCartQuantity} already in cart, ${product.stock} total stock).`
        );
      }
      return;
    }

    addToCart(product, quantity);
    // Reset quantity after adding
    setQuantities((prev) => ({
      ...prev,
      [product.id]: 1,
    }));
  };

  const handleAddToWishlist = async (product) => {
    await addToWishlistContext(product.id);
  };
  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 30);
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
        {/* SIDEBAR FILTER */}
        <aside className="shop-sidebar">
          {/* CATEGORY FILTER */}
          <div className="filter-section">
            <h3>Categories</h3>
            <div className="category-filters">
              <button
                className={filters.categoryId === null ? "active" : ""}
                onClick={() => updateFilters({ categoryId: null })}
              >
                All
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={
                    Number(filters.categoryId) === Number(cat.id)
                      ? "active"
                      : ""
                  }
                  onClick={() => updateFilters({ categoryId: Number(cat.id) })}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* PRICE RANGE */}
          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-range">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange[0]}
                onChange={(e) =>
                  updateFilters({
                    priceRange: [Number(e.target.value), filters.priceRange[1]],
                  })
                }
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange[1]}
                onChange={(e) =>
                  updateFilters({
                    priceRange: [filters.priceRange[0], Number(e.target.value)],
                  })
                }
              />
            </div>
          </div>

          {/* RATING FILTER */}
          <div className="filter-section">
            <h3>Minimum Rating</h3>
            <select
              value={filters.minRating}
              onChange={(e) =>
                updateFilters({ minRating: Number(e.target.value) })
              }
            >
              <option value="0">All Ratings</option>
              <option value="4">4 Stars & Above</option>
              <option value="4.5">4.5 Stars & Above</option>
            </select>
          </div>
        </aside>

        {/* MAIN PRODUCT LIST */}
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
              <option value="price-asc">Low → High</option>
              <option value="price-desc">High → Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <div className="products-grid">
            {displayedProducts.map((product) => (
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

                  <div className="product-price">
                    ${product.price.toFixed(2)}
                  </div>

                  <div className="product-stock">
                    {product.stock > 0 ? (
                      <span className="in-stock">{product.stock} in stock</span>
                    ) : (
                      <span className="out-of-stock">Out of stock</span>
                    )}
                  </div>
                </div>

                <div className="product-actions">
                  <div className="quantity-control">
                    <label>Qty:</label>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={getQuantity(product.id)}
                      onChange={(e) =>
                        handleQuantityChange(product.id, e.target.value)
                      }
                      disabled={product.stock === 0}
                    />
                  </div>

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
              <p>No products found.</p>
            </div>
          )}
        </div>
      </div>

      {modal.show && (
        <div className="popup-overlay" onClick={closeModal}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h4>{modal.title || "Notification"}</h4>
              <button className="popup-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="popup-body">{modal.message}</div>
            <div className="popup-footer">
              <button className="popup-action" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
