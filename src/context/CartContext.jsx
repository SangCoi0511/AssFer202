import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { cartService } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

// Hàm helper để parse JSON an toàn
const safeParseJSON = (jsonString, defaultValue = []) => {
  if (!jsonString || jsonString === 'undefined' || jsonString === 'null') {
    return defaultValue;
  }
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastCartUpdate, setLastCartUpdate] = useState(Date.now());

  // Hàm đồng bộ cart với localStorage và database
  const syncCart = useCallback(async (items) => {
    console.log('🔄 [CartContext] Starting syncCart with items:', items);
    
    if (!items || !Array.isArray(items)) {
      console.error('❌ [CartContext] Invalid items for syncCart:', items);
      return;
    }
    
    if (!user) {
      // Khách: chỉ lưu vào localStorage
      console.log('👤 [CartContext] No user, saving to guest_cart');
      localStorage.setItem('guest_cart', JSON.stringify(items));
      return;
    }

    const userId = user.id;
    const localCartKey = `cart_${userId}`;
    
    try {
      // 1. Lưu vào localStorage của user
      console.log(`💾 [CartContext] Saving to localStorage: ${localCartKey}`);
      localStorage.setItem(localCartKey, JSON.stringify(items));
      
      // 2. Đồng bộ lên server thông qua API
      console.log(`☁️ [CartContext] Saving to server for user: ${userId}`);
      const result = await cartService.saveCart(userId, items);
      console.log('✅ [CartContext] Sync completed:', result);
    } catch (error) {
      console.error('❌ [CartContext] Error syncing cart:', error);
      // Fallback: nếu server lỗi, vẫn giữ localStorage
      localStorage.setItem(localCartKey, JSON.stringify(items));
    }
  }, [user]);

  // Khởi tạo giỏ hàng khi user thay đổi
  useEffect(() => {
    console.log('🎯 [CartContext] User changed to:', user?.id || 'guest');
    
    const initializeCart = async () => {
      try {
        if (!user) {
          // KHÔNG ĐĂNG NHẬP: load từ guest cart
          const guestCart = localStorage.getItem('guest_cart');
          const parsedGuestCart = safeParseJSON(guestCart, []);
          console.log('👤 [CartContext] Guest cart loaded:', parsedGuestCart);
          setCartItems(parsedGuestCart);
          setIsInitialized(true);
          return;
        }

        const userId = user.id;
        console.log('👤 [CartContext] Loading cart for user:', userId);
        
        // Lấy cart từ server (ưu tiên)
        const serverCart = await cartService.getCart(userId);
        console.log('☁️ [CartContext] Server cart response:', serverCart);
        
        // Lấy cart từ localStorage của user
        const localCartKey = `cart_${userId}`;
        const localCart = localStorage.getItem(localCartKey);
        const parsedLocalCart = safeParseJSON(localCart, []);
        console.log('💾 [CartContext] Local cart for user:', parsedLocalCart);
        
        let finalCartItems = [];
        
        // Logic ưu tiên: Server > LocalStorage > Rỗng
        if (serverCart && serverCart.items && Array.isArray(serverCart.items)) {
          // Dùng dữ liệu từ server
          finalCartItems = serverCart.items;
          console.log('✅ [CartContext] Using server cart:', finalCartItems);
          
          // Đồng bộ ngược lên localStorage
          localStorage.setItem(localCartKey, JSON.stringify(finalCartItems));
        } else if (parsedLocalCart && parsedLocalCart.length > 0) {
          // Nếu server không có, dùng localStorage
          finalCartItems = parsedLocalCart;
          console.log('✅ [CartContext] Using local cart:', finalCartItems);
          
          // Đồng bộ lên server
          await cartService.saveCart(userId, finalCartItems);
        } else {
          console.log('ℹ️ [CartContext] No cart data found for user');
          finalCartItems = [];
        }
        
        setCartItems(finalCartItems);
        console.log('✅ [CartContext] Cart initialized for user', userId, ':', finalCartItems);
        
      } catch (error) {
        console.error('❌ [CartContext] Error initializing cart:', error);
        // Fallback: sử dụng localStorage nếu có
        if (user) {
          const localCartKey = `cart_${user.id}`;
          const localCart = localStorage.getItem(localCartKey);
          const parsedLocalCart = safeParseJSON(localCart, []);
          setCartItems(parsedLocalCart);
        }
      } finally {
        setIsInitialized(true);
      }
    };

    if (!isInitialized || user) {
      initializeCart();
    }
  }, [user, isInitialized]);

  // Sửa hàm addToCart - không dùng async trong setState
  const addToCart = (product, quantity = 1) => {
    console.log(`➕ [CartContext] Adding to cart:`, product.id, 'quantity:', quantity);
    
    setIsSyncing(true);
    
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.productId == product.id);
      let newItems;
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prevItems, { ...product, quantity }];
    });
  };

  // Sửa các hàm khác tương tự
  const removeFromCart = (productId) => {
    console.log(`➖ [CartContext] Removing from cart:`, productId);
    
    setIsSyncing(true);
    
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.productId != productId);
      
      console.log('🛒 [CartContext] New items after remove:', newItems);
      
      setTimeout(async () => {
        try {
          await syncCart(newItems);
        } catch (error) {
          console.error('Error syncing after remove:', error);
        } finally {
          setIsSyncing(false);
        }
      }, 0);
      
      return newItems;
    });
  };

  const updateQuantity = (productId, quantity) => {
    console.log(`📊 [CartContext] Updating quantity:`, productId, 'to:', quantity);
    
    setIsSyncing(true);
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.length;
  };

  // Tính tổng số lượng tất cả sản phẩm
  const getTotalQuantity = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Tính tổng tiền (cần truyền danh sách sản phẩm)
  const getCartTotal = (products = []) => {
    return cartItems.reduce((total, cartItem) => {
      const product = products.find(p => p.id == cartItem.productId);
      return total + (product?.price || 0) * cartItem.quantity;
    }, 0);
  };

  // Lấy thông tin đầy đủ của sản phẩm trong giỏ hàng
  const getCartItemsWithDetails = async () => {
    try {
      const response = await fetch('http://localhost:3001/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const allProducts = await response.json();
      
      return cartItems.map(cartItem => {
        const product = allProducts.find(p => p.id == cartItem.productId);
        return {
          ...cartItem,
          product: product || null,
        };
      }).filter(item => item.product !== null);
    } catch (error) {
      console.error('Error fetching product details:', error);
      return [];
    }
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
    getTotalQuantity,
    getCartItemsWithDetails,
    isSyncing,
    isInitialized,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};