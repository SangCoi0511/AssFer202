import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>MiniShop</h3>
          <p>Your one-stop shop for quality products</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <Link to="/shop">Shop</Link>
          <Link to="/flash-sales">Flash Sales</Link>
          <Link to="/new-arrivals">New Arrivals</Link>
          <Link to="/track-order">Track Order</Link>
        </div>

        <div className="footer-section">
          <h4>Information</h4>
          <Link to="/shipping-returns">Shipping & Returns</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 MiniShop. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
