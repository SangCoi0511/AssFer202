import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import '../styles/Pages.css';

const FlashSales = () => {
  const { products } = useShop();
  const { addToCart } = useCart();
  const flashSaleProducts = products.filter(p => p.price < 30);

  return (
    <div className="page-container">
      <h1>Flash Sales</h1>
      <p className="subtitle">Limited time offers - Don't miss out!</p>
      <div className="products-grid">
        {flashSaleProducts.map(product => {
          const discount = product.discount || 15; // Default 15% discount
          const originalPrice = product.price / (1 - discount / 100);
          
          return (
            <div key={product.id} className="product-card">
              <div className="flash-badge">-{discount}%</div>
              <Link to={`/product/${product.id}`}>
                <img src={product.image} alt={product.name} />
              </Link>
              <Link to={`/product/${product.id}`}>
                <h3>{product.name}</h3>
              </Link>
              <div className="price-section">
                <div className="original-price">${originalPrice.toFixed(2)}</div>
                <div className="sale-price">${product.price.toFixed(2)}</div>
              </div>
              <div className="stock-info">
                {product.stock > 0 ? (
                  <span className="in-stock">Stock: {product.stock}</span>
                ) : (
                  <span className="out-of-stock">Out of stock</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlashSales;
