import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';

// Public Pages
import Home from '../pages/Home';
import Shop from '../pages/Shop';
import ProductDetail from '../pages/ProductDetail';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Terms from '../pages/Terms';
import Privacy from '../pages/Privacy';
import ShippingReturns from '../pages/ShippingReturns';
import TrackOrder from '../pages/TrackOrder';
import Compare from '../pages/Compare';
import FlashSales from '../pages/FlashSales';
import NewArrivals from '../pages/NewArrivals';
import GiftCards from '../pages/GiftCards';

// User Pages
import Profile from '../pages/Profile';
import Wishlist from '../pages/Wishlist';

// Admin Pages
import AdminDashboard from '../pages/Admin/Dashboard';
import AdminProducts from '../pages/Admin/Products';
import AdminOrders from '../pages/Admin/Orders';
import AdminUsers from '../pages/Admin/Users';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes with MainLayout */}
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/shop" element={<MainLayout><Shop /></MainLayout>} />
      <Route path="/product/:id" element={<MainLayout><ProductDetail /></MainLayout>} />
      <Route path="/cart" element={<MainLayout><Cart /></MainLayout>} />
      <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
      <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
      <Route path="/terms" element={<MainLayout><Terms /></MainLayout>} />
      <Route path="/privacy" element={<MainLayout><Privacy /></MainLayout>} />
      <Route path="/shipping-returns" element={<MainLayout><ShippingReturns /></MainLayout>} />
      <Route path="/track-order" element={<MainLayout><TrackOrder /></MainLayout>} />
      <Route path="/compare" element={<MainLayout><Compare /></MainLayout>} />
      <Route path="/flash-sales" element={<MainLayout><FlashSales /></MainLayout>} />
      <Route path="/new-arrivals" element={<MainLayout><NewArrivals /></MainLayout>} />
      <Route path="/gift-cards" element={<MainLayout><GiftCards /></MainLayout>} />

      {/* Protected User Routes */}
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <MainLayout><Checkout /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout><Profile /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute>
            <MainLayout><Wishlist /></MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout><AdminDashboard /></AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout><AdminProducts /></AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout><AdminOrders /></AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout><AdminUsers /></AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
