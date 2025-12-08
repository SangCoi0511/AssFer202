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
    // Check for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

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

  const register = async (userData) => {
    try {
      // Check if email already exists
      const response = await getUserByEmail(userData.email);
      if (response.data.length > 0) {
        return { success: false, error: 'Email already exists' };
      }

      // Create new user
      const newUser = {
        ...userData,
        role: 'user',
        id: Date.now(), // Simple ID generation
      };

      // Save user to database
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
