import React, { createContext, useState, useContext, useEffect } from 'react';
import { getUserByEmail, createUser } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // ============================
  // LOGIN
  // ============================
  const login = async (email, password) => {
    try {
      const response = await getUserByEmail(email);
      const foundUser = response.data.find(u => u.password === password);

      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));

        return { success: true, user: userWithoutPassword };
      }

      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  // ============================
  // REGISTER
  // ============================
  const register = async (userData) => {
    try {
      const response = await getUserByEmail(userData.email);
      if (response.data.length > 0) {
        return { success: false, error: 'Email already exists' };
      }

      const newUser = {
        ...userData,
        role: 'user',
        id: Date.now(),
      };

      await createUser(newUser);

      const { password, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  // ============================
  // UPDATE USER (Profile update)
  // ============================
  const updateUser = (updatedUser) => {
    // Đảm bảo không lưu password vào localStorage
    const { password, ...userWithoutPassword } = updatedUser;

    setUser(userWithoutPassword);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
  };

  // ============================
  // LOGOUT
  // ============================
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAdmin = () => user?.role === 'admin';

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isAuthenticated: !!user,
    updateUser,   // <-- thêm vào context
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
