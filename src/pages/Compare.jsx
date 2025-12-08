import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import '../styles/Pages.css';

const Compare = () => {
  const { products } = useShop();
  const compareProducts = products.slice(0, 3); // Demo: show first 3 products

  return (
    <div className="page-container">
      <h1>Compare Products</h1>
      <div className="compare-grid">
        {compareProducts.map(product => (
          <div key={product.id} className="compare-item">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <p>Rating: {product.rating}</p>
            <Link to={`/product/${product.id}`} className="btn-primary">View</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Compare;
