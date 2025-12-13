import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { cartService } from "../services/api";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

// Hàm helper để parse JSON an toàn
const safeParseJSON = (jsonString, defaultValue = []) => {
  if (!jsonString || jsonString === "undefined" || jsonString === "null") {
    return defaultValue;
  }
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return defaultValue;
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  // Hàm đồng bộ cart với localStorage và database
  const syncCart = useCallback(
    async (items) => {
      if (!items || !Array.isArray(items)) {
        return;
      }

      if (!user) {
        // Khách: chỉ lưu vào localStorage
        localStorage.setItem("guest_cart", JSON.stringify(items));
        return;
      }

      const userId = user.id;
      const localCartKey = `cart_${userId}`;

      try {
        // 1. Lưu vào localStorage của user
        localStorage.setItem(localCartKey, JSON.stringify(items));

        // 2. Đồng bộ lên server thông qua API
        await cartService.saveCart(userId, items);
      } catch (error) {
        // Fallback: nếu server lỗi, vẫn giữ localStorage
        localStorage.setItem(localCartKey, JSON.stringify(items));
      }
    },
    [user]
  );

  // Khởi tạo giỏ hàng khi user thay đổi
  useEffect(() => {
    const initializeCart = async () => {
      try {
        if (!user) {
          // KHÔNG ĐĂNG NHẬP: load từ guest cart
          const guestCart = localStorage.getItem("guest_cart");
          const parsedGuestCart = safeParseJSON(guestCart, []);
          setCartItems(parsedGuestCart);
          setIsInitialized(true);
          return;
        }

        const userId = user.id;

        // Lấy cart từ server (ưu tiên)
        const serverCart = await cartService.getCart(userId);

        // Lấy cart từ localStorage của user
        const localCartKey = `cart_${userId}`;
        const localCart = localStorage.getItem(localCartKey);
        const parsedLocalCart = safeParseJSON(localCart, []);

        let finalCartItems = [];

        // Logic ưu tiên: Server > LocalStorage > Rỗng
        if (serverCart && serverCart.items && Array.isArray(serverCart.items)) {
          // Dùng dữ liệu từ server
          finalCartItems = serverCart.items;

          // Đồng bộ ngược lên localStorage
          localStorage.setItem(localCartKey, JSON.stringify(finalCartItems));
        } else if (parsedLocalCart && parsedLocalCart.length > 0) {
          // Nếu server không có, dùng localStorage
          finalCartItems = parsedLocalCart;

          // Đồng bộ lên server
          await cartService.saveCart(userId, finalCartItems);
        } else {
          finalCartItems = [];
        }

        setCartItems(finalCartItems);
      } catch (error) {
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
    setIsSyncing(true);

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.productId == product.id
      );
      let newItems;

      if (existingItemIndex > -1) {
        // Cập nhật số lượng nếu sản phẩm đã có
        newItems = prevItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Thêm sản phẩm mới
        newItems = [...prevItems, { productId: product.id, quantity }];
      }

      // Gọi syncCart sau khi state được cập nhật
      setTimeout(async () => {
        try {
          await syncCart(newItems);
        } catch (error) {
          console.error("Error syncing after add:", error);
        } finally {
          setIsSyncing(false);
        }
      }, 0);

      return newItems;
    });
  };

  // Sửa các hàm khác tương tự
  const removeFromCart = (productId) => {
    setIsSyncing(true);

    setCartItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.productId != productId);

      setTimeout(async () => {
        try {
          await syncCart(newItems);
        } catch (error) {
          console.error("Error syncing after remove:", error);
        } finally {
          setIsSyncing(false);
        }
      }, 0);

      return newItems;
    });
  };

  const updateQuantity = (productId, quantity) => {
    setIsSyncing(true);

    setCartItems((prevItems) => {
      const newItems = prevItems.map((item) =>
        item.productId == productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      );

      setTimeout(async () => {
        try {
          await syncCart(newItems);
        } catch (error) {
          console.error("Error syncing after update:", error);
        } finally {
          setIsSyncing(false);
        }
      }, 0);

      return newItems;
    });
  };

  const clearCart = async () => {
    try {
      setIsSyncing(true);
      setCartItems([]);

      if (user) {
        await cartService.deleteCart(user.id);
        localStorage.removeItem(`cart_${user.id}`);
      } else {
        localStorage.removeItem("guest_cart");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Tính tổng số lượng sản phẩm (số lượng unique)
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
      const product = products.find((p) => p.id == cartItem.productId);
      return total + (product?.price || 0) * cartItem.quantity;
    }, 0);
  };

  // Lấy thông tin đầy đủ của sản phẩm trong giỏ hàng
  const getCartItemsWithDetails = async () => {
    try {
      const response = await fetch("http://localhost:3001/products");
      if (!response.ok) throw new Error("Failed to fetch products");

      const allProducts = await response.json();

      return cartItems
        .map((cartItem) => {
          const product = allProducts.find((p) => p.id == cartItem.productId);
          return {
            ...cartItem,
            product: product || null,
          };
        })
        .filter((item) => item.product !== null);
    } catch (error) {
      console.error("Error fetching product details:", error);
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
