import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../../config/apiConfig';
import './ViewDetails.css';

const ViewDetails = ({ navigateTo, userDetails, orderId }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOrderDetails = async () => {
    console.log('🔍 ViewDetails component mounted');
    console.log('🔍 Order ID received:', orderId);
    console.log('🔍 User Details:', userDetails);
    
    if (!userDetails?.token || !orderId) {
      console.log('⚠️ Missing token or orderId');
      return;
    }
    
    try {
      setLoading(true);
      console.log('🔍 Fetching order details for:', orderId);
      console.log('🔑 Using token:', userDetails.token);
      
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.get_order_details`, {
        method: 'POST',
        headers: {
          'Authorization': userDetails.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ order_id: orderId })
      });
      
      console.log('📋 API Response Status:', response.status);
      const data = await response.json();
      console.log('📋 API Response Data:', JSON.stringify(data, null, 2));
      
      if (response.ok && data.message && data.message.status) {
        setOrderDetails(data.message.data);
      } else {
        console.error('❌ API Error:', data.message?.message || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ Network Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [userDetails, orderId]);

  if (loading) {
    return (
      <div className="vd-view-details-page">
        <div className="vd-container">
          <div className="vd-loading-container">
            <div className="vd-loading-spinner"></div>
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="vd-view-details-page">
        <div className="vd-container">
          <button className="vd-back-btn" onClick={() => navigateTo('orders')}>← Back</button>
          <p>Order details not found</p>
        </div>
      </div>
    );
  }

  const { order_summary, transactions, shipment, shipping_address_details } = orderDetails;

  return (
    <div className="vd-view-details-page">
      <div className="vd-container">
        <div className="vd-details-header">
          <button className="vd-back-btn" onClick={() => navigateTo('orders')}>← Back</button>
          <h1>Order Details</h1>
        </div>

        {/* Order Summary */}
        <div className="vd-details-section">
          <h3>Order Summary</h3>
          <div className="vd-summary-card">
            <div className="vd-summary-row">
              <span>Order ID:</span>
              <span>{order_summary.order_id}</span>
            </div>
            <div className="vd-summary-row">
              <span>Order Date:</span>
              <span>{order_summary.order_date}</span>
            </div>
            <div className="vd-summary-row">
              <span>Total Amount:</span>
              <span>₹{order_summary.order_amount}</span>
            </div>
            <div className="vd-summary-row">
              <span>Total Items:</span>
              <span>{order_summary.total_items}</span>
            </div>
            <div className="vd-summary-row">
              <span>Discount:</span>
              <span>₹{order_summary.discount_received}</span>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="vd-details-section">
          <h3>Items</h3>
          <div className="vd-items-list">
            {shipment.items.map((item, index) => (
              <div key={index} className="vd-item-card">
                <img src={item.image} alt={item.item_name} className="vd-item-image" />
                <div className="vd-item-info">
                  <h4>{item.item_name}</h4>
                  <p>Quantity: {item.qty}</p>
                  <p>Rate: ₹{item.rate}</p>
                  <p>Total: ₹{item.total}</p>
                  <span className="vd-item-status">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div className="vd-details-section">
          <h3>Transactions</h3>
          <div className="vd-transactions-list">
            {transactions.map((transaction, index) => (
              <div key={index} className="vd-transaction-card">
                <div className="vd-transaction-row">
                  <span>Amount:</span>
                  <span>₹{transaction.amount}</span>
                </div>
                <div className="vd-transaction-row">
                  <span>Date:</span>
                  <span>{transaction.date}</span>
                </div>
                <div className="vd-transaction-row">
                  <span>Transaction ID:</span>
                  <span>{transaction.transaction_id}</span>
                </div>
                <div className="vd-transaction-row">
                  <span>Status:</span>
                  <span className={`vd-status ${transaction.status.toLowerCase()}`}>{transaction.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="vd-details-section">
          <h3>Shipping Address</h3>
          <div className="vd-address-card">
            <p>{shipping_address_details.address_line_1}</p>
            <p>{shipping_address_details.city}</p>
            <p>{shipping_address_details.state} - {shipping_address_details.pincode}</p>
            <p>{shipping_address_details.country}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDetails;