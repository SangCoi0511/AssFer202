import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useShop } from '../context/ShopContext';
import { useWishlist } from '../context/WishlistContext';
import { FiShoppingCart, FiHeart, FiUser, FiLogOut, FiSearch, FiX } from 'react-icons/fi';
import '../styles/Header.css';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const { getCartCount } = useCart();
  const { updateFilters } = useShop();
  const { getWishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    if (searchOpen) {
      setSearchQuery('');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      updateFilters({ searchQuery: searchQuery.trim() });
      navigate('/shop');
      setSearchOpen(false);
      setSearchQuery('');
    }
  };



  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>MiniShop</h1>
        </Link>

        <nav className="main-nav">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Home
          </Link>
          <Link to="/shop" className={location.pathname === '/shop' ? 'active' : ''}>
            Shop
          </Link>
          <Link to="/flash-sales" className={location.pathname === '/flash-sales' ? 'active' : ''}>
            Flash Sales
          </Link>
          <Link to="/new-arrivals" className={location.pathname === '/new-arrivals' ? 'active' : ''}>
            New Arrivals
          </Link>
        </nav>

        <div className="header-actions">
          <button className="icon-btn search-toggle" onClick={handleSearchToggle}>
            {searchOpen ? <FiX /> : <FiSearch />}
          </button>

          {user ? (
            <>
              <Link to="/wishlist" className="icon-btn">
                <FiHeart />
                {getWishlistCount() > 0 && (
                  <span className="cart-badge">{getWishlistCount()}</span>
                )}
              </Link>
              <Link to="/cart" className="icon-btn cart-btn">
                <FiShoppingCart />
                {getCartCount() > 0 && (
                  <span className="cart-badge">{getCartCount()}</span>
                )}
              </Link>
              <div className="user-menu">
                <button className="icon-btn">
                  <FiUser />
                </button>
                <div className="dropdown">
                  <Link to="/profile">Profile</Link>
                  {isAdmin() && <Link to="/admin">Admin Dashboard</Link>}
                  <button onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <Link to="/login" className="btn-primary">
              Login
            </Link>
          )}
        </div>
      </div>

      {searchOpen && (
        <div className="search-bar-container">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn-search">
              Search
            </button>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;
