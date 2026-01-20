import React from 'react';
import './PopupLogin.css';

const PopupLogin = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay-pl" onClick={onClose}>
      <div className="popup-content-pl" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close-pl" onClick={onClose}>&times;</button>
        <div className="popup-header-pl">
          <h2>Welcome Back!</h2>
          <p>Login to access exclusive deals and offers</p>
        </div>
        <div className="popup-body-pl">
          <button className="popup-login-btn-pl" onClick={onLogin}>
            Login / Sign Up
          </button>
          <p className="popup-benefits-pl">
            ✓ Track your orders<br/>
            ✓ Get exclusive discounts<br/>
            ✓ Faster checkout
          </p>
        </div>
      </div>
    </div>
  );
};

export default PopupLogin;
