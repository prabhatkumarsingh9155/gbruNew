import React from 'react';
import './PopupOffer.css';

const PopupOffer = ({ isOpen, onClose, offer }) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay-po" onClick={onClose}>
      <div className="popup-content-po" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close-po" onClick={onClose}>&times;</button>
        <div className="popup-offer-banner-po">
          <div className="offer-badge-po">SPECIAL OFFER</div>
          <h2>{offer?.title || 'Limited Time Offer!'}</h2>
          <div className="offer-discount-po">
            <span className="discount-percent-po">{offer?.discount || '20'}%</span>
            <span className="discount-text-po">OFF</span>
          </div>
        </div>
        <div className="popup-body-po">
          <p className="offer-description-po">
            {offer?.description || 'Get amazing discounts on all products. Shop now and save big!'}
          </p>
          <div className="offer-code-po">
            <span>Use Code:</span>
            <strong>{offer?.code || 'SAVE20'}</strong>
          </div>
          <button className="popup-shop-btn-po" onClick={onClose}>
            Shop Now
          </button>
          <p className="offer-validity-po">
            {offer?.validity || 'Valid till stocks last'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PopupOffer;
