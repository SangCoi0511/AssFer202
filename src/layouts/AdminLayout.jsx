import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, 
  FiPackage, 
  FiShoppingBag, 
  FiUsers, 
  FiLogOut,
  FiBarChart2 
} from 'react-icons/fi';
import '../styles/AdminLayout.css';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/admin', icon: <FiBarChart2 />, label: 'Dashboard' },
    { path: '/admin/products', icon: <FiPackage />, label: 'Products' },
    { path: '/admin/orders', icon: <FiShoppingBag />, label: 'Orders' },
    { path: '/admin/users', icon: <FiUsers />, label: 'Users' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <Link to="/">
            <FiHome />
            <span>Back to Shop</span>
          </Link>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut />
          <span>Logout</span>
        </button>
      </aside>

      <main className="admin-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
