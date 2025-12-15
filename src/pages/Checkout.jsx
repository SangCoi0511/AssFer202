import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { createOrder } from '../services/api';
import '../styles/Checkout.css';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { products, updateProductStock } = useShop();
  const navigate = useNavigate();
  const [cartItemsWithDetails, setCartItemsWithDetails] = useState([]);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    city: '',
    zipCode: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});

  // Load cart items with product details
  useEffect(() => {
    const loadCartDetails = () => {
      const itemsWithDetails = cartItems.map(cartItem => {
        const product = products.find(p => p.id == cartItem.productId);
        return {
          ...cartItem,
          product: product || null,
        };
      }).filter(item => item.product !== null);
      setCartItemsWithDetails(itemsWithDetails);
    };
    loadCartDetails();
  }, [cartItems, products]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation (at least 2 characters, only letters and spaces)
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = 'Name can only contain letters and spaces';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (10 digits)
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s|-/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 5) {
      newErrors.address = 'Address must be at least 5 characters';
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.city)) {
      newErrors.city = 'City can only contain letters and spaces';
    }

    // ZIP Code validation (5 digits)
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP Code is required';
    } else if (!/^[0-9]{5}$/.test(formData.zipCode)) {
      newErrors.zipCode = 'ZIP Code must be 5 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    // Check if cart is empty
    if (cartItemsWithDetails.length === 0) {
      alert('Your cart is empty');
      return;
    }
    
    try {
      // Calculate total from cartItemsWithDetails
      const total = cartItemsWithDetails.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
      }, 0);

      // Create order
      await createOrder({
        userId: user?.id,
        items: cartItems,
        total: total,
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
              <label>Name <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter your full name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Email <span className="required">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="example@email.com"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Phone <span className="required">*</span></label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'error' : ''}
                placeholder="0123456789"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label>Address <span className="required">*</span></label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={errors.address ? 'error' : ''}
                placeholder="Street address"
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City <span className="required">*</span></label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={errors.city ? 'error' : ''}
                  placeholder="City name"
                />
                {errors.city && <span className="error-message">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label>ZIP Code <span className="required">*</span></label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className={errors.zipCode ? 'error' : ''}
                  placeholder="12345"
                  maxLength="5"
                />
                {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
              </div>
            </div>

            <button type="submit" className="btn-place-order">
              Place Order
            </button>
          </form>

          <div className="checkout-summary">
            <h2>Order Summary</h2>
            {cartItemsWithDetails.map(item => (
              <div key={item.productId} className="summary-item">
                <span>{item.product.name} x {item.quantity}</span>
                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-total">
              <h3>Total</h3>
              <h3>${cartItemsWithDetails.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
