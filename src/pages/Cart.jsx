import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { FiTrash2, FiPlus, FiMinus, FiUser } from "react-icons/fi";
import "../styles/Cart.css";

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsWithDetails,
    isSyncing,
    currentUserId,
  } = useCart();

  const { user, isAuthenticated } = useAuth();
  const [detailedCartItems, setDetailedCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCartDetails();
  }, [cartItems]);

  const loadCartDetails = async () => {
    setLoading(true);
    try {
      const itemsWithDetails = await getCartItemsWithDetails();
      setDetailedCartItems(itemsWithDetails);
    } catch (error) {
      console.error("Error loading cart details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <h1>Shopping Cart</h1>
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  // Hiển thị Notification khi không đăng nhập nhưng có sản phẩm trong cart
  const showLoginPrompt = !isAuthenticated && detailedCartItems.length > 0;

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          {isAuthenticated ? (
            <div className="user-info">
              <FiUser />
              <span>Welcome, {user?.name}!</span>
            </div>
          ) : (
            <div className="guest-info">
              <span>Shopping as Guest</span>
              <Link to="/login" className="login-link">
                Login to save your cart
              </Link>
            </div>
          )}
        </div>

        {showLoginPrompt && (
          <div className="cart-login-prompt">
            <div className="prompt-content">
              <h3>Save Your Cart Items</h3>
              <p>Login to save your cart and access it from any device.</p>
              <div className="prompt-buttons">
                <Link to="/login" className="btn-login">
                  Login
                </Link>
                <Link to="/register" className="btn-register">
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}

        {isSyncing && (
          <div className="syncing-notice">
            <span>🔄 Saving your cart...</span>
          </div>
        )}

        {detailedCartItems.length === 0 ? (
          <div className="cart-empty">
            <h2>Your cart is empty</h2>
            <p>Start shopping to add items to your cart</p>
            <Link to="/shop" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {detailedCartItems.map((item) => (
                <div
                  key={`${item.productId}-${item.quantity}`}
                  className="cart-item"
                >
                  <img src={item.product.image} alt={item.product.name} />

                  <div className="cart-item-details">
                    <Link to={`/product/${item.product.id}`}>
                      <h3>{item.product.name}</h3>
                    </Link>
                    <p className="item-price">
                      ${item.product.price.toFixed(2)}
                    </p>
                    <p className="item-stock">In stock: {item.product.stock}</p>
                  </div>

                  <div className="quantity-controls">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1 || isSyncing}
                    >
                      <FiMinus />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      disabled={
                        item.quantity >= item.product.stock || isSyncing
                      }
                    >
                      <FiPlus />
                    </button>
                  </div>

                  <div className="item-total">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>

                  <button
                    className="btn-remove"
                    onClick={() => removeFromCart(item.productId)}
                    disabled={isSyncing}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>

              <div className="summary-line">
                <span>
                  Items (
                  {detailedCartItems.reduce(
                    (acc, item) => acc + item.quantity,
                    0
                  )}
                  )
                </span>
                <span>
                  $
                  {getCartTotal(
                    detailedCartItems.map((item) => item.product)
                  ).toFixed(2)}
                </span>
              </div>

              <div className="summary-line">
                <span>Shipping</span>
                <span>Free</span>
              </div>

              <div className="summary-total">
                <span>Total</span>
                <span>
                  $
                  {getCartTotal(
                    detailedCartItems.map((item) => item.product)
                  ).toFixed(2)}
                </span>
              </div>

              <Link to="/checkout" className="btn-checkout">
                Proceed to Checkout
              </Link>

              <button
                className="btn-clear"
                onClick={() => {
                  if (
                    window.confirm("Are you sure you want to clear your cart?")
                  ) {
                    clearCart();
                  }
                }}
                disabled={isSyncing}
              >
                Clear Cart
              </button>

              <Link to="/shop" className="btn-continue">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
