import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import { HiFire } from 'react-icons/hi';
import '../styles/Pages.css';

const NewArrivals = () => {
  const { products } = useShop();
  const { addToCart } = useCart();
  const newProducts = products.slice(-8); // Latest 8 products

  return (
    <div className="page-container">
      <h1>New Arrivals</h1>
      <p className="subtitle">Check out our latest additions</p>
      <div className="products-grid">
        {newProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="new-badge">
              <HiFire /> NEW
            </div>
            <Link to={`/product/${product.id}`}>
              <img src={product.image} alt={product.name} />
            </Link>
            <Link to={`/product/${product.id}`}>
              <h3>{product.name}</h3>
            </Link>
            <p className="price">${product.price.toFixed(2)}</p>
            <div className="stock-info">
              {product.stock > 0 ? (
                <span className="in-stock">Stock: {product.stock}</span>
              ) : (
                <span className="out-of-stock">Out of stock</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewArrivals;
