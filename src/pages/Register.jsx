import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const validateName = (name) => {
  const trimmed = name.trim();
  const errors = [];

  if (!trimmed) errors.push('Name is required');
  if (trimmed && trimmed.length < 2) errors.push('Name must be at least 2 characters');
  if (trimmed.length > 50) errors.push('Name must not exceed 50 characters');
  if (trimmed && !/^[a-zA-Z\s'-]*$/.test(trimmed)) errors.push('Name can only contain letters, spaces, hyphens, and apostrophes');

  return { valid: errors.length === 0, errors };
};

const validateEmail = (email) => {
  const trimmed = email.trim();
  const errors = [];

  if (!trimmed) errors.push('Email is required');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (trimmed && !emailRegex.test(trimmed)) errors.push('Invalid email format');

  return { valid: errors.length === 0, errors };
};

const validatePassword = (password) => {
  const errors = [];

  if (!password) errors.push('Password is required');
  if (password && password.length < 6) errors.push('Password must be at least 6 characters');
  if (password && password.length > 100) errors.push('Password must not exceed 100 characters');
  if (password && !/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (password && !/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (password && !/[0-9]/.test(password)) errors.push('Password must contain at least one number');

  return { valid: errors.length === 0, errors };
};

const validateConfirmPassword = (password, confirmPassword) => {
  const errors = [];

  if (!confirmPassword) errors.push('Confirm password is required');
  if (confirmPassword && password !== confirmPassword) errors.push('Passwords do not match');

  return { valid: errors.length === 0, errors };
};

const validateAddress = (address) => {
  const trimmed = address.trim();
  const errors = [];

  if (trimmed && trimmed.length < 5) errors.push('Address must be at least 5 characters');
  if (trimmed.length > 100) errors.push('Address must not exceed 100 characters');

  return { valid: errors.length === 0, errors };
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formErrors, setFormErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let validation;
    switch (name) {
      case 'name':
        validation = validateName(value);
        break;
      case 'email':
        validation = validateEmail(value);
        break;
      case 'password':
        validation = validatePassword(value);
        break;
      case 'confirmPassword':
        validation = validateConfirmPassword(formData.password, value);
        break;
      case 'address':
        validation = validateAddress(value);
        break;
      default:
        validation = { valid: true, errors: [] };
    }
    return validation;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field when user starts typing
    if (fieldErrors[name]?.length) {
      setFieldErrors({
        ...fieldErrors,
        [name]: [],
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const validation = validateField(name, value);
    
    setFieldErrors({
      ...fieldErrors,
      [name]: validation.errors,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors([]);
    setFieldErrors({});

    // Validate all fields
    const nameValidation = validateName(formData.name);
    const emailValidation = validateEmail(formData.email);
    const passwordValidation = validatePassword(formData.password);
    const confirmPasswordValidation = validateConfirmPassword(formData.password, formData.confirmPassword);
    const addressValidation = validateAddress(formData.address);

    const errors = {};
    if (!nameValidation.valid) errors.name = nameValidation.errors;
    if (!emailValidation.valid) errors.email = emailValidation.errors;
    if (!passwordValidation.valid) errors.password = passwordValidation.errors;
    if (!confirmPasswordValidation.valid) errors.confirmPassword = confirmPasswordValidation.errors;
    if (!addressValidation.valid) errors.address = addressValidation.errors;

    const flatErrors = Object.entries(errors).flatMap(([field, msgs]) =>
      (msgs || []).map(msg => `${field === 'confirmPassword' ? 'Confirm password' : field.charAt(0).toUpperCase() + field.slice(1)}: ${msg}`)
    );

    if (flatErrors.length > 0) {
      setFieldErrors(errors);
      setFormErrors(flatErrors);
      return;
    }

    setLoading(true);
    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    
    if (result.success) {
      navigate('/');
    } else {
      setFormErrors([result.error]);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="subtitle">Join MiniShop today</p>


        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Name <span className="required">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="Enter your full name"
              className={fieldErrors.name?.length ? 'input-error' : ''}
            />
              {fieldErrors.name?.length > 0 && fieldErrors.name.map((msg, idx) => (
                <span key={idx} className="field-error">{msg}</span>
              ))}
          </div>

          <div className="form-group">
            <label>Email <span className="required">*</span></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="Enter your email"
              className={fieldErrors.email?.length ? 'input-error' : ''}
            />
              {fieldErrors.email?.length > 0 && fieldErrors.email.map((msg, idx) => (
                <span key={idx} className="field-error">{msg}</span>
              ))}
          </div>

          <div className="form-group">
            <label>Password <span className="required">*</span></label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="Minimum 6 characters with uppercase, lowercase & number"
              className={fieldErrors.password?.length ? 'input-error' : ''}
            />
              {fieldErrors.password?.length > 0 && fieldErrors.password.map((msg, idx) => (
                <span key={idx} className="field-error">{msg}</span>
              ))}
            <p className="password-hint">Password must contain: uppercase letter, lowercase letter, and number</p>
          </div>

          <div className="form-group">
            <label>Confirm Password <span className="required">*</span></label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="Confirm your password"
              className={fieldErrors.confirmPassword?.length ? 'input-error' : ''}
            />
              {fieldErrors.confirmPassword?.length > 0 && fieldErrors.confirmPassword.map((msg, idx) => (
                <span key={idx} className="field-error">{msg}</span>
              ))}
          </div>

          <div className="form-group">
            <label>Address <span className="optional">(Optional)</span></label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your address (5-100 characters)"
              className={fieldErrors.address?.length ? 'input-error' : ''}
            />
              {fieldErrors.address?.length > 0 && fieldErrors.address.map((msg, idx) => (
                <span key={idx} className="field-error">{msg}</span>
              ))}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;