import React, { useState } from 'react';
import './Header.css';

// Header component - Main navigation bar with logo and user actions
const Header = ({ cartItemsCount, user, userDetails, navigateTo }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo Section - Brand logo and name */}
          <div className="logo" onClick={() => navigateTo('home')}>
            <img src="/Image/Logo.png" alt="Gbru Logo" className="logo-image" />
           
          </div>

          {/* Navigation Section - Main navigation links */}
          <nav className="nav-links">
          </nav>

          {/* Actions Section - Cart and user authentication */}
          <div className="header-actions">
            {/* Cart Button with item count badge */}
            <button className="cart-link" onClick={() => navigateTo('cart')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13M17 13H7" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {cartItemsCount > 0 && (
                <span className="cart-badge">{cartItemsCount}</span>
              )}
            </button>

            {/* User Authentication Section */}
            {user ? (
              <div className="user-menu">
                <span className="user-name">Hi, {userDetails?.Customer_name || user.name}</span>
                <button className="account-icon" onClick={() => navigateTo('account')}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => navigateTo('auth')}>
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;