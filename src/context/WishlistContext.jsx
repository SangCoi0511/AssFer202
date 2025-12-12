import React, { createContext, useState, useContext, useEffect } from 'react';
import { getWishlistByUser, addToWishlist as apiAddToWishlist, removeFromWishlist as apiRemoveFromWishlist } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await getWishlistByUser(user.id);
      setWishlistItems(response.data);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    if (!user) {
      alert('Please login to add items to wishlist');
      return { success: false };
    }

    try {
      // Check if already in wishlist
      const exists = wishlistItems.find(item => item.productId == productId);
      if (exists) {
        alert('Product already in wishlist');
        return { success: false };
      }

      const response = await apiAddToWishlist({
        userId: user.id,
        productId: productId,
      });

      setWishlistItems(prev => [...prev, response.data]);
      return { success: true };
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      return { success: false };
    }
  };

  const removeFromWishlist = async (wishlistItemId) => {
    try {
      await apiRemoveFromWishlist(wishlistItemId);
      setWishlistItems(prev => prev.filter(item => item.id !== wishlistItemId));
      return { success: true };
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      return { success: false };
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.productId == productId);
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistCount,
    refreshWishlist: loadWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
