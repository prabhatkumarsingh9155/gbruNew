import React, { useEffect, useState } from 'react';
import './CouponSuccessPopup.css';
import { Gift } from 'lucide-react';

const CouponSuccessPopup = ({ onClose, discount, isRemoved }) => {
  const [animationState, setAnimationState] = useState('jumping'); // jumping -> blasting -> logo-reveal

  useEffect(() => {
    if (isRemoved) return;

    // Sequence: jumping 2 times (1.2s) -> blasting (0.5s) -> logo-reveal (rest)
    // Each jump is 0.6s, so 2 jumps = 1.2s
    const blastTimer = setTimeout(() => {
      setAnimationState('blasting');
    }, 200);

    const logoTimer = setTimeout(() => {
      setAnimationState('logo-reveal');
    }, 1200);

    const closeTimer = setTimeout(() => {
      onClose();
    }, 2200);

    return () => {
      clearTimeout(blastTimer);
      clearTimeout(logoTimer);
      clearTimeout(closeTimer);
    };
  }, [onClose, isRemoved]);

  // Calculate discount percentage if available
  const discountPercent = discount ? Math.round(discount) : 0;

  // Generate blast particles
  const blastParticles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    angle: (360 / 20) * i,
    delay: Math.random() * 0.1,
    size: 8 + Math.random() * 8,
    color: ['#FF6B35', '#F7931E', '#FFC107', '#FFD700', '#FF1493', '#9370DB'][Math.floor(Math.random() * 6)]
  }));

  return (
    <div className="coupon-popup-overlay" onClick={onClose}>
      <div className="coupon-popup-card" onClick={(e) => e.stopPropagation()}>
        {/* Confetti Decorations */}
        {!isRemoved && (
          <div className="confetti-decorations">
            {/* Top left confetti */}
            <div className="confetti-item circle orange" style={{ top: '5%', left: '5%' }}></div>
            <div className="confetti-item circle yellow" style={{ top: '10%', left: '15%' }}></div>
            <div className="confetti-item curve orange" style={{ top: '8%', left: '8%' }}></div>
            
            {/* Top right confetti */}
            <div className="confetti-item circle yellow" style={{ top: '5%', right: '5%' }}></div>
            <div className="confetti-item circle white" style={{ top: '12%', right: '12%' }}></div>
            <div className="confetti-item curve yellow" style={{ top: '7%', right: '10%' }}></div>
            
            {/* Bottom left confetti */}
            <div className="confetti-item circle white" style={{ bottom: '10%', left: '8%' }}></div>
            <div className="confetti-item curve orange" style={{ bottom: '15%', left: '5%' }}></div>
            
            {/* Bottom right confetti */}
            <div className="confetti-item circle orange" style={{ bottom: '8%', right: '10%' }}></div>
            <div className="confetti-item circle yellow" style={{ bottom: '15%', right: '8%' }}></div>
            <div className="confetti-item curve yellow" style={{ bottom: '12%', right: '15%' }}></div>
          </div>
        )}

        {/* Blast particles */}
        {animationState === 'blasting' && (
          <div className="blast-container">
            {blastParticles.map((particle) => (
              <div
                key={particle.id}
                className="blast-particle"
                style={{
                  '--angle': `${particle.angle}deg`,
                  '--delay': `${particle.delay}s`,
                  '--size': `${particle.size}px`,
                  backgroundColor: particle.color,
                  animationDelay: `${particle.delay}s`
                }}
              />
            ))}
          </div>
        )}

        {/* Gift Icon or Logo */}
        <div className="gift-icon-wrapper">
          {/* For removed state, show sad gift with tears */}
          {isRemoved ? (
            <div className="gift-icon-container removed">
              <Gift className="gift-icon sad-icon" size={80} strokeWidth={1.5} />
              {/* Tear drops */}
              <div className="tear-drop tear-left"></div>
              <div className="tear-drop tear-right"></div>
            </div>
          ) : (
            <>
              {/* Gift box - shows during jumping and blasting states */}
              {(animationState === 'jumping' || animationState === 'blasting') && (
                <div className={`gift-icon-container ${animationState === 'blasting' ? 'blasting' : ''}`}>
                  <Gift className="gift-icon" size={80} strokeWidth={1.5} />
                </div>
              )}

              {/* Logo - shows after blast */}
              {animationState === 'logo-reveal' && (
                <div className="logo-container">
                  <img src="Image/Logo.png" alt="Brand Logo" className="brand-logo-reveal" />
                </div>
              )}
            </>
          )}
        </div>

        {/* Content */}
        <div className="popup-text-content">
          {isRemoved ? (
            <>
              <h3 className="popup-subtitle">Coupon Removed</h3>
              <div className="popup-discount removed-text">Discount removed</div>
            </>
          ) : (
            <>
              <h3 className="popup-subtitle">Save up to</h3>
              <div className="popup-discount">₹{discountPercent}</div>
              <p className="popup-description">off in your order</p>
            </>
          )}
        </div>

        {/* Action Button */}
        <button className="popup-action-btn" onClick={onClose}>
          {isRemoved ? 'OK' : 'Thanks'}
        </button>

       
      </div>
    </div>
  );
};

export default CouponSuccessPopup;
