import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cart Service với cấu trúc mới
export const cartService = {
  // Lấy cart của user
  getCart: async (userId) => {
    try {
      console.log(`🔄 [API] Fetching cart for user: ${userId}`);
      const response = await api.get(`/cart?userId=${userId}`);
      const data = response.data[0] || null;
      console.log(`✅ [API] Cart found for user ${userId}:`, data);
      return data;
    } catch (error) {
      console.error(`❌ [API] Error fetching cart for user ${userId}:`, error);
      return null;
    }
  },

  // Lưu hoặc cập nhật cart - QUAN TRỌNG: Sửa cấu trúc dữ liệu
  saveCart: async (userId, items) => {
    try {
      console.log(`🔄 [API] Saving cart for user ${userId}:`, items);
      
      // Kiểm tra cart đã tồn tại chưa
      const existingCart = await cartService.getCart(userId);
      
      if (existingCart) {
        // Cập nhật cart hiện có - ĐẢM BẢO GIỮ NGUYÊN CẤU TRÚC
        const updatedCart = { 
          ...existingCart, 
          items: items  // Đảm bảo trường items được gửi đúng
        };
        console.log(`📝 [API] Updating existing cart:`, updatedCart);
        
        const response = await api.put(`/cart/${existingCart.id}`, updatedCart);
        console.log(`✅ [API] Cart updated successfully:`, response.data);
        return response.data;
      } else {
        // Tạo cart mới - ĐẢM BẢO CÓ ĐỦ CÁC TRƯỜNG
        const newCart = {
          id: `cart-${userId}-${Date.now()}`, // Tạo ID duy nhất
          userId: userId,
          items: items  // Đảm bảo có trường items
        };
        console.log(`➕ [API] Creating new cart:`, newCart);
        
        const response = await api.post('/cart', newCart);
        console.log(`✅ [API] Cart created successfully:`, response.data);
        return response.data;
      }
    } catch (error) {
      console.error(`❌ [API] Error saving cart for user ${userId}:`, error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      throw error;
    }
  },

  // Xóa cart của user
  deleteCart: async (userId) => {
    try {
      const existingCart = await cartService.getCart(userId);
      if (existingCart) {
        await api.delete(`/cart/${existingCart.id}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting cart:', error);
      return false;
    }
  },

  // Thêm sản phẩm vào cart
  addToCart: async (userId, productId, quantity = 1) => {
    try {
      const existingCart = await cartService.getCart(userId);
      let items = existingCart?.items || [];
      
      console.log(`➕ [API] Adding product ${productId} to cart`);
      console.log(`Current items:`, items);
      
      const existingItemIndex = items.findIndex(item => item.productId == productId);
      
      if (existingItemIndex > -1) {
        // Cập nhật số lượng nếu sản phẩm đã có
        items[existingItemIndex].quantity += quantity;
        console.log(`Updated quantity:`, items[existingItemIndex].quantity);
      } else {
        // Thêm sản phẩm mới
        items.push({ productId: productId, quantity: quantity });
        console.log(`Added new item:`, items[items.length - 1]);
      }
      
      console.log(`Final items to save:`, items);
      return await cartService.saveCart(userId, items);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Xóa sản phẩm khỏi cart
  removeFromCart: async (userId, productId) => {
    try {
      const existingCart = await cartService.getCart(userId);
      if (!existingCart) return null;
      
      const items = existingCart.items.filter(item => item.productId != productId);
      return await cartService.saveCart(userId, items);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // Cập nhật số lượng
  updateQuantity: async (userId, productId, quantity) => {
    try {
      const existingCart = await cartService.getCart(userId);
      if (!existingCart) return null;
      
      const items = existingCart.items.map(item => 
        item.productId == productId 
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      );
      
      return await cartService.saveCart(userId, items);
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  },

  // Merge cart (dùng khi đăng nhập)
  mergeCarts: async (userId, guestItems = []) => {
    try {
      const userCart = await cartService.getCart(userId);
      let userItems = userCart?.items || [];
      
      console.log(`🔄 [API] Merging carts for user ${userId}`);
      console.log(`User cart items:`, userItems);
      console.log(`Guest cart items:`, guestItems);
      
      // Merge logic
      guestItems.forEach(guestItem => {
        const existingItemIndex = userItems.findIndex(
          userItem => userItem.productId == guestItem.productId
        );
        
        if (existingItemIndex > -1) {
          // Cộng số lượng
          userItems[existingItemIndex].quantity += guestItem.quantity;
          console.log(`Merged existing item:`, userItems[existingItemIndex]);
        } else {
          // Thêm mới
          userItems.push(guestItem);
          console.log(`Added new item from guest:`, guestItem);
        }
      });
      
      console.log(`Merged items:`, userItems);
      return await cartService.saveCart(userId, userItems);
    } catch (error) {
      console.error('Error merging carts:', error);
      throw error;
    }
  },

  // Lấy cart items với chi tiết sản phẩm
  getCartItemsWithDetails: async (userId) => {
    try {
      const cart = await cartService.getCart(userId);
      if (!cart || !cart.items || cart.items.length === 0) {
        return [];
      }

      // Lấy tất cả sản phẩm
      const productsResponse = await api.get('/products');
      const allProducts = productsResponse.data;

      // Map cart items với product details
      return cart.items
        .map(cartItem => {
          const product = allProducts.find(p => p.id == cartItem.productId);
          if (!product) return null;
          
          return {
            ...cartItem,
            product: product
          };
        })
        .filter(item => item !== null);
    } catch (error) {
      console.error('Error getting cart items with details:', error);
      return [];
    }
  }
};

// Các API khác giữ nguyên...
export const getCategories = () => api.get('/categories');
export const getCategoryById = (id) => api.get(`/categories/${id}`);
export const getProducts = () => api.get('/products');
export const getProductById = (id) => api.get(`/products/${id}`);
export const getProductsByCategory = (categoryId) => 
  api.get(`/products?categoryId=${categoryId}`);
export const searchProducts = (query) => 
  api.get(`/products?q=${query}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const getUsers = () => api.get('/users');
export const getUserById = (id) => api.get(`/users/${id}`);
export const getUserByEmail = (email) => api.get(`/users?email=${email}`);
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const getReviews = () => api.get('/reviews');
export const getReviewsByProduct = (productId) => 
  api.get(`/reviews?productId=${productId}`);
export const createReview = (data) => api.post('/reviews', data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);
export const getWishlist = () => api.get('/wishlist');
export const getWishlistByUser = (userId) => 
  api.get(`/wishlist?userId=${userId}`);
export const getWishlistItem = (userId, productId) =>
  api.get(`/wishlist?userId=${userId}&productId=${productId}`);
export const addToWishlist = (data) => api.post('/wishlist', data);
export const removeFromWishlist = (id) => api.delete(`/wishlist/${id}`);
export const removeWishlistItem = (userId, productId) => {
  return api.get(`/wishlist?userId=${userId}&productId=${productId}`)
    .then(response => {
      if (response.data.length > 0) {
        return api.delete(`/wishlist/${response.data[0].id}`);
      }
    });
};
export const getOrders = () => api.get('/orders');
export const getOrdersByUser = (userId) => 
  api.get(`/orders?userId=${userId}`);
export const createOrder = (data) => api.post('/orders', data);
export const updateOrderStatus = (id, status) => 
  api.patch(`/orders/${id}`, { status });

export default api;