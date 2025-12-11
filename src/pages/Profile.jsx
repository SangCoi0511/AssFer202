import React, { useState, useEffect } from 'react';
import axios from "axios";
import { Form, Button, Spinner } from "react-bootstrap";
import { useAuth } from '../context/AuthContext';
import { getOrdersByUser } from '../services/api';
import '../styles/Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [orders, setOrders] = useState([]);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    address: user?.address || "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        address: user.address || ""
      }));
      loadOrders();
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const loadOrders = async () => {
    try {
      const response = await getOrdersByUser(user.id);
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to load orders:", error);
    }
  };

  // ===========================
  // UPDATE PROFILE
  // ===========================
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // ========= VALIDATE NAME =========
      if (!profileData.name.trim()) {
        setError("Name cannot be empty.");
        setLoading(false);
        return;
      }

      if (profileData.name.trim().length < 2) {
        setError("Name must contain at least 2 characters.");
        setLoading(false);
        return;
      }

      const nameRegex = /^[A-Za-zÀ-Ỹà-ỹ\s]+$/;
      if (!nameRegex.test(profileData.name)) {
        setError("Name can only contain letters and spaces.");
        setLoading(false);
        return;
      }

      // ========= VALIDATE EMAIL =========
      if (!profileData.email.trim()) {
        setError("Email cannot be empty.");
        setLoading(false);
        return;
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(profileData.email)) {
        setError("Invalid email format.");
        setLoading(false);
        return;
      }

      // Check duplicate email
      if (profileData.email !== user.email) {
        const usersResp = await axios.get("http://localhost:3001/users");
        const emailExists = usersResp.data.some(
          (u) => u.email === profileData.email && u.id !== user.id
        );

        if (emailExists) {
          setError("Email already exists.");
          setLoading(false);
          return;
        }
      }

      // ========= VALIDATE PASSWORD =========
      if (profileData.password.trim() !== "") {
        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,20}$/;

        if (!passwordRegex.test(profileData.password)) {
          setError(
            "Password must be 6–20 characters long and include uppercase, lowercase, and a number."
          );
          setLoading(false);
          return;
        }

        if (profileData.password !== profileData.confirmPassword) {
          setError("Confirm password does not match.");
          setLoading(false);
          return;
        }
      }

      // ========= VALIDATE ADDRESS =========
      if (!profileData.address.trim()) {
        setError("Address cannot be empty.");
        setLoading(false);
        return;
      }

      if (profileData.address.trim().length < 5) {
        setError("Address must be at least 5 characters long.");
        setLoading(false);
        return;
      }

      const addressRegex = /^[A-Za-z0-9À-Ỹà-ỹ\s,.-/]+$/;
      if (!addressRegex.test(profileData.address)) {
        setError("Address contains invalid characters.");
        setLoading(false);
        return;
      }

      // ========= DATA UPDATE =========
      const updatedUser = {
        ...user,
        name: profileData.name,
        email: profileData.email,
        address: profileData.address,
      };

      if (profileData.password.trim() !== "") {
        updatedUser.password = profileData.password;
      }

      const response = await axios.patch(
        `http://localhost:3001/users/${user.id}`,
        updatedUser
      );

      updateUser(response.data);

      setSuccess("Profile updated successfully.");

      setProfileData(prev => ({
        ...prev,
        password: "",
        confirmPassword: ""
      }));

    } catch (err) {
      console.error("Error updating profile:", err);
      setError("An error occurred while updating your profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>My Profile</h1>

        <Form onSubmit={handleProfileUpdate} className="profile-info">
          <h2>Account Information</h2>

          {error && (
            <div className="custom-alert error">
              <span className="alert-icon">⚠️</span> {error}
            </div>
          )}

          {success && (
            <div className="custom-alert success">
              <span className="alert-icon">✔️</span> {success}
            </div>
          )}

          {/* NAME */}
          <div className="info-item">
            <strong>Name:</strong>
            <Form.Control
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              className="mt-1"
              required
            />
          </div>

          {/* EMAIL */}
          <div className="info-item">
            <strong>Email:</strong>
            <Form.Control
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
              className="mt-1"
              required
            />
          </div>

          {/* ADDRESS */}
          <div className="info-item">
            <strong>Address:</strong>
            <Form.Control
              type="text"
              name="address"
              value={profileData.address}
              onChange={handleProfileChange}
              className="mt-1"
            />
          </div>

          {/* PASSWORD */}
          <div className="info-item">
            <strong>New Password:</strong>
            <Form.Control
              type="password"
              name="password"
              placeholder="Enter new password (optional)"
              value={profileData.password}
              onChange={handleProfileChange}
              className="mt-1"
            />
          </div>

          {/* CONFIRM PASSWORD — only show when password is typed */}
          {profileData.password.trim() !== "" && (
            <div className="info-item fade-in">
              <strong>Confirm Password:</strong>
              <Form.Control
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={profileData.confirmPassword}
                onChange={handleProfileChange}
                className="mt-1"
                required
              />
            </div>
          )}

          {/* SAVE BUTTON */}
          <div className="text-center mt-3">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Save"}
            </Button>
          </div>
        </Form>

        {/* ORDER HISTORY */}
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
