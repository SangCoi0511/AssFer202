import React from 'react';
import '../styles/ContentPages.css';

const ShippingReturns = () => {
  return (
    <div className="content-page">
      <div className="content-container">
        <h1>Shipping & Returns</h1>
        
        <h2>Shipping Policy</h2>
        <p>We offer free standard shipping on all orders. Typical delivery time is 5-7 business days.</p>
        <ul>
          <li>Standard Shipping: 5-7 business days (Free)</li>
          <li>Express Shipping: 2-3 business days ($9.99)</li>
          <li>Next Day Shipping: 1 business day ($19.99)</li>
        </ul>

        <h2>Return Policy</h2>
        <p>We accept returns within 30 days of delivery. Items must be unused and in original packaging.</p>
        <p>To initiate a return, please contact our customer service team.</p>
      </div>
    </div>
  );
};

export default ShippingReturns;
