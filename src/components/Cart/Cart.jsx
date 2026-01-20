import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../../config/apiConfig';
import SimilarCartProducts from '../SimilarCartProducts/SimilarCartProducts';
import './Cart.css';

const Cart = ({ cart, updateQuantity, removeItem, total, navigateTo, user, userDetails, fetchCartCount }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiTotal, setApiTotal] = useState(0);

  // Fetch cart items from API
  const fetchCartItems = async () => {
    if (!user || !userDetails?.token) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.get_cart`, {
        method: 'GET',
        headers: {
          'Authorization': userDetails.token,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (response.ok && data.message && data.message.status) {
        const items = data.message.data.items.map(item => ({
          id: item.item,
          item_code: item.item,
          name: item.item_name,
          price: item.rate,
          quantity: item.quantity,
          image: item.image,
          amount: item.amount,
          discount: item.discount || 0,
          originalPrice: item.mrp || item.rate,
          rating: 4.5,
          reviews: Math.floor(Math.random() * 100) + 10,
          category: item.brand || 'General'
        }));
        setCartItems(items);
        setApiTotal(data.message.data.total_amount);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete item from cart via API
  const handleDeleteItem = async (e, itemCode) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || !userDetails?.token) {
      removeItem(itemCode);
      return;
    }
    
    // Find the item to get its price before removing
    const itemToDelete = cartItems.find(item => item.item_code === itemCode);
    const itemTotalPrice = itemToDelete ? itemToDelete.price * itemToDelete.quantity : 0;
    
    // Optimistically update UI
    setCartItems(prev => prev.filter(item => item.item_code !== itemCode));
    setApiTotal(prev => prev - itemTotalPrice);
    
    try {
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.delete_cart_item`, {
        method: 'DELETE',
        headers: {
          'Authorization': userDetails.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          item: itemCode
        })
      });
      
      const data = await response.json();
      if (response.ok && data.message && data.message.status) {
        console.log('✅ Item deleted successfully');
        if (fetchCartCount) {
          fetchCartCount();
        }
      } else {
        console.error('❌ Failed to delete item');
        fetchCartItems();
      }
    } catch (error) {
      console.error('❌ Error deleting item:', error);
      fetchCartItems();
    }
  };
  const handleUpdateQuantity = async (itemCode, newQuantity) => {
    if (!user || !userDetails?.token) return;
    
    // Update local state immediately for smooth UX
    setCartItems(prev => prev.map(item => 
      item.item_code === itemCode 
        ? { ...item, quantity: newQuantity, amount: item.price * newQuantity }
        : item
    ));
    
    try {
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.update_cart_item`, {
        method: 'PUT',
        headers: {
          'Authorization': userDetails.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          item: itemCode,
          quantity: newQuantity
        })
      });
      
      const data = await response.json();
      if (response.ok && data.message && data.message.status) {
        console.log('✅ Quantity updated successfully');
        // Update total from server
        setApiTotal(prev => {
          const updatedItems = cartItems.map(item => 
            item.item_code === itemCode 
              ? { ...item, quantity: newQuantity }
              : item
          );
          return updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        });
        
        if (fetchCartCount) {
          fetchCartCount(); // Update cart count in header
        }
      } else {
        // Revert on failure
        fetchCartItems();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Revert on error
      fetchCartItems();
    }
  };

  // Handle checkout process
  const handleCheckout = async () => {
    if (!user || !userDetails?.token) {
      navigateTo('checkout');
      return;
    }
    
    try {
      // First get cart items for the proceed API
      const cartResponse = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.get_cart`, {
        method: 'GET',
        headers: {
          'Authorization': userDetails.token,
          'Content-Type': 'application/json'
        }
      });
      
      const cartData = await cartResponse.json();
      if (!cartResponse.ok || !cartData.message?.status) {
        throw new Error('Failed to get cart items');
      }
      
      // Prepare items for proceed API
      const items = cartData.message.data.items.map(item => ({
        item: item.item,
        quantity: parseInt(item.quantity)
      }));
      
      console.log('🔍 Cart items for proceed API:', JSON.stringify(items, null, 2));
      
      // Call proceed API
      const proceedResponse = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.proceed`, {
        method: 'POST',
        headers: {
          'Authorization': userDetails.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: items,
          delivery_date: "null",
          warehouse: "",
          transporter: "",
          coupon_code: ""
        })
      });
      
      const proceedData = await proceedResponse.json();
      console.log('🛒 Proceed API Response:', JSON.stringify(proceedData, null, 2));
      
      // Call checkout_details API
      const checkoutResponse = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.checkout_details`, {
        method: 'GET',
        headers: {
          'Authorization': userDetails.token,
          'Content-Type': 'application/json'
        }
      });
      
      const checkoutData = await checkoutResponse.json();
      console.log('📋 Checkout Details API Response:', JSON.stringify(checkoutData, null, 2));
      
      // Combine both API responses
      let combinedData = null;
      if (proceedResponse.ok && proceedData.message?.status) {
        combinedData = proceedData.message.data;
      }
      
      if (checkoutResponse.ok && checkoutData.message?.status) {
        combinedData = {
          ...combinedData,
          ...checkoutData.message.data
        };
      }
      
      // Navigate to checkout with combined data
      if (combinedData) {
        navigateTo('checkout', combinedData);
      } else {
        navigateTo('checkout');
      }
      
    } catch (error) {
      console.error('❌ Error proceeding to checkout:', error);
      navigateTo('checkout');
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [user, userDetails]);

  const displayCart = user && userDetails?.token ? cartItems : cart;
  const displayTotal = user && userDetails?.token ? apiTotal : total();

  if (loading) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (displayCart.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Add some products to get started</p>
            <button className="btn btn-primary" onClick={() => navigateTo('products')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart</h1>
        
        <div className="cart-content">
          <div className="cart-items">
            {displayCart.map(item => (
              <div key={item.id} className="cart-item">
                <button 
                  className="remove-btn"
                  onClick={(e) => user && userDetails?.token ? handleDeleteItem(e, item.item_code) : removeItem(item.id)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
                <img src={item.image} alt={item.name} />
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <div className="item-rating">
                    <span className="stars">{'★'.repeat(Math.floor(item.rating))}</span>
                    <span className="rating-text">({item.reviews})</span>
                  </div>
                  {item.discount && item.discount > 0 && (
                    <div className="item-discount">
                      {item.discount.toFixed(0)}% OFF • Save ₹{((item.originalPrice - item.price) * item.quantity).toFixed(2)}
                    </div>
                  )}
                  <div className="item-price-container">
                    <p className="item-price">₹{(item.price * item.quantity).toFixed(2)}</p>
                    {item.discount && item.discount > 0 && item.originalPrice && (
                      <p className="item-original-price">₹{(item.originalPrice * item.quantity).toFixed(2)}</p>
                    )}
                  </div>
                </div>
                <div className="quantity-controls">
                  <button onClick={(e) => {
                    e.preventDefault();
                    user && userDetails?.token ? handleUpdateQuantity(item.item_code, item.quantity - 1) : updateQuantity(item.id, item.quantity - 1);
                  }}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={(e) => {
                    e.preventDefault();
                    user && userDetails?.token ? handleUpdateQuantity(item.item_code, item.quantity + 1) : updateQuantity(item.id, item.quantity + 1);
                  }}>
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{displayTotal.toFixed(2)}</span>
            </div>
            {user && userDetails?.token && (
              <div className="summary-row discount">
                <span>Discount:</span>
                <span>-₹{cartItems.reduce((total, item) => total + ((item.originalPrice - item.price) * item.quantity), 0).toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>₹{displayTotal.toFixed(2)}</span>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
      
      {/* Fixed mobile checkout button */}
      <div className="mobile-checkout-bar">
        <div className="mobile-total">
          <span>Total: ₹{displayTotal.toFixed(2)}</span>
        </div>
        <button className="checkout-btn mobile-checkout-btn" onClick={handleCheckout}>
          Proceed to Checkout
        </button>
      </div>
      
      <SimilarCartProducts 
        cartItems={displayCart}
        user={user}
        userDetails={userDetails}
        navigateTo={navigateTo}
        fetchCartCount={fetchCartCount}
        onCartUpdate={fetchCartItems}
        setCartItems={setCartItems}
        setApiTotal={setApiTotal}
      />
    </div>
  );
};

export default Cart;