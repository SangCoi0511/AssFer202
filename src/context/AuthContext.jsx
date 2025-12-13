import React, { createContext, useState, useContext, useEffect } from "react";
import { getUserByEmail, createUser } from "../services/api";
import { cartService } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session với safeParseJSON

    const savedUser = localStorage.getItem("user");
    const parsedUser = safeParseJSON(savedUser, null);

    if (parsedUser) {
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  // Hàm xử lý merge cart từ guest sang user (chỉ gọi khi đăng nhập)
  const handleGuestCartMerge = async (userId, guestCartItems) => {
    try {
      if (!guestCartItems || guestCartItems.length === 0) {
        return;
      }

      // Sử dụng cartService.mergeCarts từ API
      const result = await cartService.mergeCarts(userId, guestCartItems);

      if (result) {
        // Xóa guest cart sau khi merge thành công
        localStorage.removeItem("guest_cart");

        // Cập nhật localStorage của user với cart mới
        const updatedCart = await cartService.getCart(userId);
        if (updatedCart) {
          localStorage.setItem(
            `cart_${userId}`,
            JSON.stringify(updatedCart.items)
          );
        }
      }
    } catch (error) {
      console.error("❌ Error merging guest cart:", error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await getUserByEmail(email);
      const foundUser = response.data.find((u) => u.password === password);

      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;

        // Lưu user vào state và localStorage
        setUser(userWithoutPassword);
        localStorage.setItem("user", JSON.stringify(userWithoutPassword));

        // Xử lý merge cart sau khi đăng nhập (chỉ merge nếu có guest cart)
        const guestCart = localStorage.getItem("guest_cart");
        const parsedGuestCart = safeParseJSON(guestCart, []);

        if (parsedGuestCart.length > 0) {
          await handleGuestCartMerge(userWithoutPassword.id, parsedGuestCart);
        }

        return { success: true, user: userWithoutPassword };
      }

      return { success: false, error: "Invalid credentials" };
    } catch (error) {
      console.error("❌ Login error:", error);
      return { success: false, error: "Login failed" };
    }
  };

  // ============================
  // REGISTER
  // ============================
  const register = async (userData) => {
    try {
      const response = await getUserByEmail(userData.email);
      if (response.data.length > 0) {
        return { success: false, error: "Email already exists" };
      }

      const newUser = {
        ...userData,
        role: "user",

        id: Date.now().toString(),
      };

      await createUser(newUser);

      const { password, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));

      // Xử lý merge cart sau khi đăng ký
      const guestCart = localStorage.getItem("guest_cart");
      const parsedGuestCart = safeParseJSON(guestCart, []);

      if (parsedGuestCart.length > 0) {
        await handleGuestCartMerge(newUser.id, parsedGuestCart);
      }

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      return { success: false, error: "Registration failed" };
    }
  };

  // ============================
  // UPDATE USER (Profile update)
  // ============================
  const updateUser = (updatedUser) => {
    // Đảm bảo không lưu password vào localStorage
    const { password, ...userWithoutPassword } = updatedUser;

    setUser(userWithoutPassword);
    localStorage.setItem("user", JSON.stringify(userWithoutPassword));
  };

  // ============================
  // LOGOUT
  // ============================
  const logout = () => {
    // QUAN TRỌNG: KHÔNG XÓA CART khi đăng xuất
    // Cart vẫn được lưu trong:
    // 1. Database (thông qua cartService.saveCart)
    // 2. LocalStorage với key `cart_{userId}`

    // Chỉ xóa thông tin user
    setUser(null);
    localStorage.removeItem("user");
  };

  const isAdmin = () => user?.role === "admin";

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isAuthenticated: !!user,
    updateUser, // <-- thêm vào context
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
