import React from 'react';
import '../styles/ContentPages.css';

const GiftCards = () => {
  return (
    <div className="content-page">
      <div className="content-container">
        <h1>Gift Cards</h1>
        <p>Give the gift of choice with a MiniShop gift card!</p>
        
        <div className="gift-card-options">
          <div className="gift-card">
            <h3>$25 Gift Card</h3>
            <button className="btn-primary">Purchase</button>
          </div>
          <div className="gift-card">
            <h3>$50 Gift Card</h3>
            <button className="btn-primary">Purchase</button>
          </div>
          <div className="gift-card">
            <h3>$100 Gift Card</h3>
            <button className="btn-primary">Purchase</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCards;
