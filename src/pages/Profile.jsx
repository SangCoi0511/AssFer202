import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Spinner } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { getOrdersByUser } from "../services/api";
import "../styles/Profile.css";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [orders, setOrders] = useState([]);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    address: user?.address || "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
        address: user.address || "",
      }));
      loadOrders();
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
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

      setProfileData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
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
      <div>
        {/* Header */}
        <div className="profile-header">
          <h1>My Profile</h1>
        </div>

        {/* Flex Container for Account Info and Order History */}
        <div className="profile-flex-container">
          {/* Left Side: Account Information */}
          <div className="profile-card">
            <div className="card-content">
              <h2 className="section-title">Manage your account information</h2>

              {/* Alert Messages */}
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

              <Form onSubmit={handleProfileUpdate}>
                <div className="form-grid">
                  {/* NAME FIELD */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div className="form-group">
                      <label className="form-label">
                        <svg
                          className="label-icon"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Name
                      </label>
                      <div className="input-wrapper">
                        <Form.Control
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          placeholder="Enter your name"
                          className="form-input"
                          required
                          disabled={loading}
                        />
                      </div>
                      <p className="field-hint">
                        *Full name with 2-50 characters
                      </p>
                    </div>

                    {/* EMAIL FIELD */}
                    <div className="form-group">
                      <label className="form-label">
                        <svg
                          className="label-icon"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        Email
                      </label>
                      <div className="input-wrapper">
                        <Form.Control
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          placeholder="Enter your email"
                          className="form-input"
                          required
                          disabled={loading}
                        />
                      </div>
                      <p className="field-hint">*Valid email address</p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    {/* ADDRESS FIELD */}
                    <div className="form-group">
                      <label className="form-label">
                        <svg
                          className="label-icon"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Address
                      </label>
                      <div className="input-wrapper">
                        <Form.Control
                          type="text"
                          name="address"
                          value={profileData.address}
                          onChange={handleProfileChange}
                          placeholder="Enter your address"
                          className="form-input"
                          disabled={loading}
                        />
                      </div>
                      <p className="field-hint">*Minimum 5 characters</p>
                    </div>

                    {/* PASSWORD FIELD */}
                    <div className="form-group">
                      <label className="form-label">
                        <svg
                          className="label-icon"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        New Password
                      </label>
                      <div className="input-wrapper">
                        <Form.Control
                          type="password"
                          name="password"
                          value={profileData.password}
                          onChange={handleProfileChange}
                          placeholder="Enter new password (optional)"
                          className="form-input"
                          disabled={loading}
                        />
                      </div>
                      <p className="field-hint">
                        *6-20 characters with uppercase, lowercase, and number
                      </p>
                    </div>
                  </div>
                  {/* CONFIRM PASSWORD — only show when password is typed */}
                  {profileData.password.trim() !== "" && (
                    <div className="form-group fade-in">
                      <label className="form-label">
                        <svg
                          className="label-icon"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Confirm Password
                      </label>
                      <div className="input-wrapper">
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={profileData.confirmPassword}
                          onChange={handleProfileChange}
                          placeholder="Confirm new password"
                          className="form-input"
                          required
                          disabled={loading}
                        />
                      </div>
                      <p className="field-hint">
                        *Must match the password above
                      </p>
                    </div>
                  )}
                </div>

                {/* SAVE BUTTON */}
                <div className="form-actions">
                  <Button type="submit" disabled={loading}>
                    {loading && (
                      <Spinner
                        animation="border"
                        size="sm"
                        className="btn-spinner"
                      />
                    )}
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </Form>
            </div>
          </div>

          {/* Right Side: Order History Table */}
          <div className="orders-card">
            <div className="card-content">
              <h2 className="section-title">Order History</h2>
              {orders.length > 0 ? (
                <div className="table-responsive">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="order-id-cell">#{order.id}</td>
                          <td className="order-date-cell">
                            {new Date(order.date).toLocaleDateString()}
                          </td>
                          <td className="order-status-cell">
                            <span
                              className={`status-badge ${order.status?.toLowerCase()}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="order-total-cell">
                            ${order.total?.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-orders">
                  <svg
                    className="no-orders-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <p>No orders yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
