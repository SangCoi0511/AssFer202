import React, { useState } from 'react';
import '../styles/ContentPages.css';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Tracking order #${orderId}`);
  };

  return (
    <div className="content-page">
      <div className="content-container">
        <h1>Track Your Order</h1>
        <p>Enter your order ID to track your shipment</p>
        
        <form onSubmit={handleSubmit} className="track-form">
          <input
            type="text"
            placeholder="Enter Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">Track Order</button>
        </form>
      </div>
    </div>
  );
};

export default TrackOrder;
