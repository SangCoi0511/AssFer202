import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOrdersByUser } from '../services/api';
import '../styles/Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const response = await getOrdersByUser(user.id);
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>My Profile</h1>

        <div className="profile-info">
          <h2>Account Information</h2>
          <div className="info-item">
            <strong>Name:</strong>
            <span>{user?.name}</span>
          </div>
          <div className="info-item">
            <strong>Email:</strong>
            <span>{user?.email}</span>
          </div>
          <div className="info-item">
            <strong>Address:</strong>
            <span>{user?.address || 'Not provided'}</span>
          </div>
        </div>

        <div className="orders-section">
          <h2>Order History</h2>
          {orders.length > 0 ? (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <span className="order-id">Order #{order.id}</span>
                    <span className="order-date">
                      {new Date(order.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="order-status">
                    Status: <span className={order.status?.toLowerCase()}>{order.status}</span>
                  </div>
                  <div className="order-total">
                    Total: ${order.total?.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-orders">No orders yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
