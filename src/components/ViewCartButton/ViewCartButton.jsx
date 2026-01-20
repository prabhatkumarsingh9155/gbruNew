import React, { useState, useEffect } from 'react';
import './ViewCartButton.css';
import { API_CONFIG } from '../../config/apiConfig';

const ViewCartButton = ({ onViewCart, userDetails, currentPage }) => {
  const [liveCartItems, setLiveCartItems] = useState([]);
  const [liveItemCount, setLiveItemCount] = useState(0);
  const [isStickyVisible, setIsStickyVisible] = useState(false);

  useEffect(() => {
    const handleStickyBarVisible = (e) => {
      setIsStickyVisible(e.detail.visible);
    };

    window.addEventListener('stickyBarVisible', handleStickyBarVisible);

    return () => {
      window.removeEventListener('stickyBarVisible', handleStickyBarVisible);
    };
  }, []);

  const fetchCartFromAPI = async () => {
    if (!userDetails?.token) {
      setLiveCartItems([]);
      setLiveItemCount(0);
      return;
    }

    try {
      const [cartResponse, countResponse] = await Promise.all([
        fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.get_cart`, {
          method: 'GET',
          headers: {
            'Authorization': userDetails.token,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.get_cart_count`, {
          method: 'GET',
          headers: {
            'Authorization': userDetails.token,
            'Content-Type': 'application/json'
          }
        })
      ]);
      
      const cartData = await cartResponse.json();
      const countData = await countResponse.json();
      
      if (cartResponse.ok && cartData.message && cartData.message.status) {
        const items = cartData.message.data.items || [];
        setLiveCartItems(items);
      }
      
      if (countResponse.ok && countData.message && countData.message.status) {
        setLiveItemCount(countData.message.data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching cart from API:', error);
      setLiveCartItems([]);
      setLiveItemCount(0);
    }
  };

  useEffect(() => {
    fetchCartFromAPI();

    const handleCartUpdate = () => {
      fetchCartFromAPI();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [userDetails]);

  if (liveItemCount === 0) return null;

  const displayItems = liveCartItems.slice(0, 3);
  const imageCount = displayItems.length;

  return (
    <div className={`view-cart-button-vcb ${isStickyVisible ? 'sticky-visible' : ''}`}>
      <button className="cart-btn-vcb" onClick={onViewCart}>
        <div className={`cart-images-container-vcb images-${imageCount}`}>
          {displayItems.map((item, index) => (
            <div key={index} className="cart-image-vcb">
              <img 
                src={item.image || item.item_image || 'https://via.placeholder.com/50'} 
                alt="Cart item" 
              />
            </div>
          ))}
        </div>
        <div className="cart-info-vcb">
          <span className="cart-text-vcb">View cart</span>
          <span className="item-count-text-vcb">{liveItemCount} item{liveItemCount > 1 ? 's' : ''}</span>
        </div>
        <span className="arrow-vcb">&gt;</span>
      </button>
    </div>
  );
};

export default ViewCartButton;
