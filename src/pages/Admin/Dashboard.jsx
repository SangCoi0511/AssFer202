import React, { useState, useEffect } from 'react';
import { getOrders, getProducts, getUsers } from '../../services/api';
import { FiPackage, FiShoppingBag, FiUsers, FiDollarSign } from 'react-icons/fi';
import '../../styles/Admin.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        getProducts(),
        getOrders(),
        getUsers(),
      ]);

      const totalRevenue = ordersRes.data.reduce((sum, order) => sum + (order.total || 0), 0);

      setStats({
        totalProducts: productsRes.data.length,
        totalOrders: ordersRes.data.length,
        totalUsers: usersRes.data.length,
        totalRevenue,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  return (
    <div className="admin-page">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FiPackage />
          </div>
          <div className="stat-info">
            <h3>Total Products</h3>
            <p className="stat-value">{stats.totalProducts}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FiShoppingBag />
          </div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FiDollarSign />
          </div>
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <p className="stat-value">${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
