import React, { useState, useEffect } from 'react';
import { getProducts, deleteProduct, createProduct, updateProduct } from '../../services/api';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import '../../styles/Admin.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        loadProducts();
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Products Management</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Product
        </button>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>${product.price}</td>
                <td>{product.stock}</td>
                <td>{product.categoryId}</td>
                <td>{product.rating}</td>
                <td className="actions">
                  <button onClick={() => setEditingProduct(product)}>
                    <FiEdit />
                  </button>
                  <button onClick={() => handleDelete(product.id)}>
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
