import React, { useState, useEffect } from 'react';
import { getProducts, deleteProduct, createProduct, updateProduct, getCategories } from '../../services/api';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import '../../styles/Admin.css';

const ProductFormModal = ({ product, onSubmit, onClose, validCategoryIds }) => {
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    categoryId: product?.categoryId || (validCategoryIds.length > 0 ? validCategoryIds[0] : 1),
    description: product?.description || '',
    image: product?.image || 'default-image-url.jpg',
  });
  
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const { name, price, stock, categoryId } = formData;
    
    if (!name.trim()) newErrors.name = 'Product name cannot be empty.';
    if (price < 0) newErrors.price = 'Price cannot be less than 0.';
    
    if (stock < 0) {
      newErrors.stock = 'Stock cannot be less than 0.';
    } else if (!Number.isInteger(stock)) {
      newErrors.stock = 'Stock must be a whole number.';
    }
    
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
        newErrors.categoryId = 'Category ID must be a valid positive integer.';
    } else if (!validCategoryIds.includes(categoryId)) {
        newErrors.categoryId = `Category ID is not exist.`;
    } 
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    const newValue = type === 'number' ? Number(value) : value;
    setFormData(prev => ({ 
      ...prev, 
      [name]: newValue
    }));
    
    let errorMessage = '';
    
    if (name === 'name' && !String(newValue).trim()) {
      errorMessage = 'Product name cannot be empty.';
    } else if (name === 'price' && newValue < 0) {
      errorMessage = 'Price cannot be less than 0.';
    } else if (name === 'stock') {
      if (newValue < 0) {
        errorMessage = 'Stock cannot be less than 0.';
      } else if (!Number.isInteger(newValue) && String(newValue).indexOf('.') !== -1) {
        errorMessage = 'Stock must be a whole number.';
      }
    } else if (name === 'categoryId') {
        if (!Number.isInteger(newValue) || newValue <= 0) {
            errorMessage = 'Category ID must be a valid positive integer.';
        } else if (!validCategoryIds.includes(newValue)) {
             errorMessage = `Category ID is not exist.`;
        }
    }
    
    setErrors(prev => ({ 
        ...prev, 
        [name]: errorMessage 
    }));
  };

  const localHandleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    } else {
        alert("Please check the fields with errors.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={localHandleSubmit}>
          
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>
          
          <div className="form-group">
            <label>Price ($)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
            {errors.price && <p className="error-message">{errors.price}</p>}
          </div>
          
          <div className="form-group">
            <label>Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              required
            />
            {errors.stock && <p className="error-message">{errors.stock}</p>}
          </div>

          <div className="form-group">
            <label>Category ID</label>
            <input
              type="number"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
            />
            {errors.categoryId && <p className="error-message">{errors.categoryId}</p>}
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label>Image URL</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {isEditing ? 'Save Changes' : 'Create Product'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [validCategoryIds, setValidCategoryIds] = useState([]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
      try {
          const response = await getCategories();
          const ids = response.data.map(cat => Number(cat.id));
          setValidCategoryIds(ids);
      } catch (error) {
          console.error('Failed to load categories for validation:', error);
          setValidCategoryIds([]); 
      }
  };

  const loadProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (productData) => {
    try {
      if (editingProduct) {
        const dataToUpdate = {
            ...productData,
            rating: editingProduct.rating, 
        };
        await updateProduct(editingProduct.id, dataToUpdate);

      } else {
        const newProductData = {
            ...productData,
            rating: 5
        }
        await createProduct(newProductData);
      }
      
      handleCloseModal(); 
      loadProducts(); 
      
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product. Check console for details.');
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

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };
  
  const handleAdd = () => {
    setEditingProduct(null);
    setShowModal(true);
  };


  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Products Management</h1>
        <button className="btn-primary" onClick={handleAdd}>
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
                  <button onClick={() => handleEdit(product)}>
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
 
      {showModal && (
        <ProductFormModal
          product={editingProduct}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
          validCategoryIds={validCategoryIds}
        />
      )}
    </div>
  );
};

export default Products;