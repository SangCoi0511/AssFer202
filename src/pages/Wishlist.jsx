import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useShop } from "../context/ShopContext";
import { useWishlist } from "../context/WishlistContext";
import { Link } from "react-router-dom";
import { FiTrash2, FiShoppingCart } from "react-icons/fi";
import "../styles/Wishlist.css";

const Wishlist = () => {
  const { user } = useAuth();
  const { products } = useShop();
  const { addToCart, cartItems } = useCart();
  const { wishlistItems: wishlistData, removeFromWishlist } = useWishlist();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [modal, setModal] = useState({ show: false, title: "", message: "" });

  useEffect(() => {
    // Map wishlist items to actual products
    const mappedProducts = wishlistData
      .map((item) => products.find((p) => p.id == item.productId))
      .filter(Boolean);
    setWishlistProducts(mappedProducts);
  }, [wishlistData, products]);

  const openModal = (title, message) =>
    setModal({ show: true, title, message });
  const closeModal = () => setModal((prev) => ({ ...prev, show: false }));

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

  const handleAddToCart = (product) => {
    const quantity = getQuantity(product.id);

    // Check if product is in stock
    if (product.stock <= 0) {
      openModal("Notification", "This product is out of stock.");
      return;
    }

    // Check existing quantity in cart
    const existingItem = cartItems.find(
      (item) => item.productId === product.id
    );
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

  const handleRemove = async (productId) => {
    // Find wishlist entry
    const entry = wishlistData.find((item) => item.productId === productId);
    if (entry) {
      await removeFromWishlist(entry.id);
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
          {wishlistProducts.map((product) => (
            <div key={product.id} className="wishlist-item">
              <Link to={`/product/${product.id}`}>
                <img src={product.image} alt={product.name} />
              </Link>
              <div className="wishlist-item-info">
                <Link to={`/product/${product.id}`}>
                  <h3>{product.name}</h3>
                </Link>
                <p className="item-price">${product.price.toFixed(2)}</p>
                <p className="item-stock">
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : "Out of stock"}
                </p>
                <div className="wishlist-actions">
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
                    onClick={() => handleAddToCart(product)}
                    className="btn-add"
                    disabled={product.stock === 0}
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

export default Wishlist;
