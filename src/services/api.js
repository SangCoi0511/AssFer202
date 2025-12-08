import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Categories
export const getCategories = () => api.get('/categories');
export const getCategoryById = (id) => api.get(`/categories/${id}`);

// Products
export const getProducts = () => api.get('/products');
export const getProductById = (id) => api.get(`/products/${id}`);
export const getProductsByCategory = (categoryId) => 
  api.get(`/products?categoryId=${categoryId}`);
export const searchProducts = (query) => 
  api.get(`/products?name_like=${query}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Users
export const getUsers = () => api.get('/users');
export const getUserById = (id) => api.get(`/users/${id}`);
export const getUserByEmail = (email) => api.get(`/users?email=${email}`);
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Reviews
export const getReviews = () => api.get('/reviews');
export const getReviewsByProduct = (productId) => 
  api.get(`/reviews?productId=${productId}`);
export const createReview = (data) => api.post('/reviews', data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

// Wishlist
export const getWishlist = (userId) => 
  api.get(`/wishlist?userId=${userId}`);
export const addToWishlist = (data) => api.post('/wishlist', data);
export const removeFromWishlist = (id) => api.delete(`/wishlist/${id}`);

// Orders
export const getOrders = () => api.get('/orders');
export const getOrdersByUser = (userId) => 
  api.get(`/orders?userId=${userId}`);
export const createOrder = (data) => api.post('/orders', data);
export const updateOrderStatus = (id, status) => 
  api.patch(`/orders/${id}`, { status });

// Cart
export const getCart = () => api.get('/cart');
export const addToCart = (data) => api.post('/cart', data);
export const updateCartItem = (id, data) => api.put(`/cart/${id}`, data);
export const removeFromCart = (id) => api.delete(`/cart/${id}`);
export const clearCart = () => api.delete('/cart');

export default api;
