import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { createOrder } from '../services/api';
import '../styles/Checkout.css';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { updateProductStock } = useShop();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    city: '',
    zipCode: '',
    phone: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create order
      await createOrder({
        userId: user?.id,
        items: cartItems,
        total: getCartTotal(),
        status: 'pending',
        date: new Date().toISOString(),
        shippingInfo: formData,
      });

      // Update stock for each product
      const { getProductById, updateProduct } = await import('../services/api');
      for (const item of cartItems) {
        try {
          // Get current product data
          const productRes = await getProductById(item.id);
          const currentProduct = productRes.data;
          
          // Calculate new stock
          const newStock = currentProduct.stock - item.quantity;
          
          // Update product with new stock in database
          await updateProduct(item.id, {
            ...currentProduct,
            stock: newStock >= 0 ? newStock : 0
          });

          // Update product stock in ShopContext (real-time update)
          updateProductStock(item.id, newStock >= 0 ? newStock : 0);
        } catch (error) {
          console.error(`Failed to update stock for product ${item.id}:`, error);
        }
      }

      clearCart();
      alert('Order placed successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Checkout</h1>

        <div className="checkout-content">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h2>Shipping Information</h2>
            
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-place-order">
              Place Order
            </button>
          </form>

          <div className="checkout-summary">
            <h2>Order Summary</h2>
            {cartItems.map(item => (
              <div key={item.id} className="summary-item">
                <span>{item.name} x {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-total">
              <h3>Total</h3>
              <h3>${getCartTotal().toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
