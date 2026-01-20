import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../../config/apiConfig';
import CouponSuccessPopup from '../CouponSuccessPopup/CouponSuccessPopup';
import { CiLocationOn } from 'react-icons/ci';
import { FaClipboardList } from 'react-icons/fa';
import { RiCoupon2Fill } from 'react-icons/ri';
import { MdOutlinePayment } from 'react-icons/md';
import { IoMdPersonAdd } from "react-icons/io";

import './Checkout.css';

// Checkout component - Handles order checkout with address management and order summary
const Checkout = ({ cart, total, clearCart, navigateTo, user, checkoutData, userDetails }) => {
  // Use API data if available, otherwise use local cart
  const displayCart = checkoutData?.items || cart;
  const displayTotal = checkoutData?.grand_total || (checkoutData?.items ? checkoutData.items.reduce((sum, item) => sum + item.amount, 0) : total());
  
  // console.log('🔍 Checkout Data:', checkoutData);
  // console.log('🛍️ Display Cart:', displayCart);
  // console.log('💰 Display Total:', displayTotal);
  const minimumOrderValue = 1000;
  const isOrderBelowMinimum = displayTotal < minimumOrderValue;

  // State for payment selection
  const [selectedPayment, setSelectedPayment] = useState('full');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [tahsils, setTahsils] = useState([]);
  const [marketplaces, setMarketplaces] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showRemovePopup, setShowRemovePopup] = useState(false);

  // Handle coupon code application
  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !user || !userDetails?.token) return;
    
    setApplyingCoupon(true);
    try {
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
      
      const proceedItems = cartData.message.data.items.map(item => ({
        "item": item.item,
        "quantity": item.quantity.toString()
      }));
      
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.proceed`, {
        method: 'POST',
        headers: {
          'Authorization': userDetails.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "items": proceedItems,
          "delivery_date": "null",
          "warehouse": "",
          "transporter": "",
          "coupon_code": couponCode
        })
      });
      
      const data = await response.json();
      if (response.ok && data.message?.status) {
        setAppliedCoupon(data.message.data);
        setShowSuccessPopup(true);
      } else {
        alert(data.message?.message || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      alert('Failed to apply coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Handle coupon removal
  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setShowCouponInput(false);
    setShowRemovePopup(true);
  };

  // API configuration
  const API_KEY = API_CONFIG.API_KEY;
  const API_SECRET = API_CONFIG.API_SECRET;

  // Fetch countries from API
  const fetchCountries = async () => {
    try {
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.area.api.get_countries`, {
        method: 'GET',
        headers: {
          'X-API-KEY': API_KEY,
          'X-API-SECRET': API_SECRET
        }
      });
      const data = await response.json();
      if (response.ok && data.message && data.message.data && Array.isArray(data.message.data)) {
        setCountries(data.message.data.sort((a, b) => a.name === 'India' ? -1 : b.name === 'India' ? 1 : a.name.localeCompare(b.name)));
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  // Fetch states from API
  const fetchStates = async (country) => {
    try {
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.area.api.get_states`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
          'X-API-SECRET': API_SECRET
        },
        body: JSON.stringify({ name: country })
      });
      const data = await response.json();
      if (response.ok && data.message && data.message.data && Array.isArray(data.message.data)) {
        setStates(data.message.data);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  // Fetch districts from API
  const fetchDistricts = async (state) => {
    try {
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.area.api.get_districts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
          'X-API-SECRET': API_SECRET
        },
        body: JSON.stringify({ state_id: state })
      });
      const data = await response.json();
      if (response.ok && data.message && data.message.data && Array.isArray(data.message.data)) {
        setDistricts(data.message.data);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  // Fetch tahsils from API
  const fetchTahsils = async (district) => {
    try {
      const response = await fetch('${API_CONFIG.Prabhat_URL}/api/method/shoption_api.area.api.get_tahsils', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
          'X-API-SECRET': API_SECRET
        },
        body: JSON.stringify({ district_id: district })
      });
      const data = await response.json();
      if (response.ok && data.message && data.message.data && Array.isArray(data.message.data)) {
        setTahsils(data.message.data);
      }
    } catch (error) {
      console.error('Error fetching tahsils:', error);
    }
  };

  // Fetch marketplaces from API
  const fetchMarketplaces = async (tahsil) => {
    try {
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.area.api.get_marketplaces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
          'X-API-SECRET': API_SECRET
        },
        body: JSON.stringify({ tehsil_id: tahsil })
      });
      const data = await response.json();
      if (response.ok && data.message && data.message.data && Array.isArray(data.message.data)) {
        setMarketplaces(data.message.data);
      }
    } catch (error) {
      console.error('Error fetching marketplaces:', error);
    }
  };

  // Fetch countries on component mount
  useEffect(() => {
    fetchCountries();
  }, []);
  // Fetch shipping addresses from API
  const fetchShippingAddresses = async () => {
    if (!user || !userDetails?.token) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.get_customer_shipping_address`, {
        method: 'GET',
        headers: {
          'Authorization': userDetails.token,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (response.ok && data.message && data.message.status) {
        // Process addresses to get names instead of IDs
        const processedAddresses = await Promise.all(data.message.data.map(async (addr) => {
          try {
            // Get state name
            const stateResponse = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.area.api.get_states`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': API_KEY,
                'X-API-SECRET': API_SECRET
              },
              body: JSON.stringify({ name: addr.country })
            });
            const stateData = await stateResponse.json();
            const stateName = stateData.message?.data?.find(s => s.id === addr.state)?.name || addr.state;
            
            // Get district name
            const districtResponse = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.area.api.get_districts`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': API_KEY,
                'X-API-SECRET': API_SECRET
              },
              body: JSON.stringify({ state_id: addr.state })
            });
            const districtData = await districtResponse.json();
            const districtName = districtData.message?.data?.find(d => d.id === addr.district)?.name || addr.district;
            
            // Get tahsil name
            const tahsilResponse = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.area.api.get_tahsils`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': API_KEY,
                'X-API-SECRET': API_SECRET
              },
              body: JSON.stringify({ district_id: addr.district })
            });
            const tahsilData = await tahsilResponse.json();
            const tahsilName = tahsilData.message?.data?.find(t => t.id === addr.tahsil)?.name || addr.tahsil;
            
            // Get marketplace name
            const marketplaceResponse = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.area.api.get_marketplaces`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': API_KEY,
                'X-API-SECRET': API_SECRET
              },
              body: JSON.stringify({ tehsil_id: addr.tahsil })
            });
            const marketplaceData = await marketplaceResponse.json();
            const marketplaceName = marketplaceData.message?.data?.find(m => m.id === addr.marketplace)?.name || addr.marketplace;
            
            return {
              ...addr,
              state_name: stateName,
              district_name: districtName,
              tahsil_name: tahsilName,
              marketplace_name: marketplaceName
            };
          } catch (error) {
            return addr; // Return original if API calls fail
          }
        }));
        
        setShippingAddresses(processedAddresses);
        // Auto-select primary address
        const primaryAddress = processedAddresses.find(addr => addr.is_primary === 1);
        if (primaryAddress) {
          setSelectedShippingAddress(primaryAddress);
        }
      }
    } catch (error) {
      console.error('Error fetching shipping addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch addresses when component mounts
  useEffect(() => {
    fetchShippingAddresses();
  }, [user, userDetails]);

  // Extract customer info from checkout data
  const customerInfo = checkoutData ? {
    name: checkoutData.customer_name,
    billingAddress: checkoutData.billing_address_display,
    shippingAddress: checkoutData.shipping_address_display,
    customerGstin: checkoutData.customer_gstin,
    companyGstin: checkoutData.company_gstin,
    placeOfSupply: checkoutData.place_of_supply
  } : null;

  // Sample saved addresses (in real app, this would come from user profile/database)
  // Hide saved addresses if checkoutData is available
  const [savedAddresses] = useState(checkoutData ? [] : [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'New York',
      zipCode: '10001'
    }
  ]);
  
  // State management for address selection and form display
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
  // Form data state for contact and shipping information
  const [formData, setFormData] = useState({
    address_title: '',
    address_line1: '',
    address_line2: '',
    marketplace: '',
    tahsil: '',
    district: '',
    state: '',
    pincode: '',
    country: 'India',
    email_id: '',
    phone: ''
  });

  // Handle selecting a saved address - populates form with address data
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setFormData({
      ...formData,
      firstName: address.firstName,
      lastName: address.lastName,
      address: address.address,
      city: address.city,
      zipCode: address.zipCode
    });
    setShowAddressForm(false);
  };

  // Handle adding a new address via API
  const handleAddNewAddress = async () => {
    if (!user || !userDetails?.token) {
      setShowAddressForm(true);
      return;
    }
    
    try {
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.add_customer_shipping_address`, {
        method: 'POST',
        headers: {
          'Authorization': userDetails.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (response.ok && data.message && data.message.status) {
        console.log('✅ Address added successfully');
        // Refresh addresses list
        fetchShippingAddresses();
        setShowAddressForm(false);
        // Reset form
        setFormData({
          address_title: '',
          address_line1: '',
          address_line2: '',
          marketplace: '',
          tahsil: '',
          district: '',
          state: '',
          pincode: '',
          country: 'India',
          email_id: '',
          phone: ''
        });
      } else {
        console.error('❌ Failed to add address');
      }
    } catch (error) {
      console.error('❌ Error adding address:', error);
    }
  };

  // Handle editing an existing address - populates form with address data
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setFormData({
      ...formData,
      firstName: address.firstName,
      lastName: address.lastName,
      address: address.address,
      city: address.city,
      zipCode: address.zipCode
    });
    setShowAddressForm(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Payment token builder function
  const buildPaymentToken = ({
    productInfo = "Shoption Order",
    firstName,
    email,
    amount,
    phone,
    userId,
    orderId,
  }) => {
    const CALLBACK_URL = `${window.location.origin}/order-success`;
    
    const qs = [
      `ProductInfo=${productInfo}`,
      `FirstName=${firstName}`,
      `Email=${email}`,
      `Amount=${amount}`,
      `Phone=${phone}`,
      `UserId=${userId}`,
      `Order_id=${orderId}`,
      `Call_Back_URL=${CALLBACK_URL}`,
    ].join("&");

    return btoa(unescape(encodeURIComponent(qs)));
  };

  // Handle place order button click
  const handlePlaceOrder = async () => {
    if (!user || !userDetails?.token) {
      alert('Please login to place order');
      return;
    }
    
    setPlacingOrder(true);
    
    try {
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
      
      // First call proceed API to prepare the order
      const proceedItems = cartData.message.data.items.map(item => ({
        "item": item.item,
        "quantity": item.quantity.toString()
      }));
      
      console.log('🔍 Proceed Items:', JSON.stringify(proceedItems, null, 2));
      
      const proceedResponse = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.proceed`, {
        method: 'POST',
        headers: {
          'Authorization': userDetails.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "items": proceedItems,
          "delivery_date": null,
          "warehouse": "",
          "transporter": "",
          "coupon_code": "",
          "payment_type": selectedPayment === 'full' ? 'Full Payment' : 'Cash On Delivery',
          "transaction_amount": (checkoutData?.payment_summary?.full_payment?.payable_amount || displayTotal).toString()
        })
      });
      
      const proceedData = await proceedResponse.json();
      console.log('🛒 Proceed API Response:', JSON.stringify(proceedData, null, 2));
      
      if (!proceedResponse.ok || !proceedData.message?.status) {
        throw new Error('Proceed API failed');
      }
      
      const orderData = {
        "items": proceedItems,
        "delivery_date": null,
        "warehouse": "",
        "transporter": "",
        "coupon_code": "",
        "payment_type": selectedPayment === 'full' ? 'Full Payment' : 'Cash On Delivery',
        "transaction_amount": checkoutData?.payment_summary?.full_payment?.payable_amount || displayTotal
      };
      
      console.log('📝 Final Order Data:', JSON.stringify(orderData, null, 2));
      console.log('🔑 Authorization Token:', userDetails.token);
      console.log('🔑 Token Format Check:', userDetails.token?.startsWith('token ') ? 'Correct' : 'Incorrect');
      console.log('🌐 API Endpoint:', `${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.place_order`);
      
      const orderResponse = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.place_order`, {
        method: 'POST',
        headers: {
          'Authorization': userDetails.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      console.log('📦 Order Data Sent:', JSON.stringify(orderData, null, 2));
      console.log('📋 Order API Response Status:', orderResponse.status);
      console.log('📋 Order API Response Headers:', Object.fromEntries(orderResponse.headers.entries()));
      
      const orderResult = await orderResponse.json();
      
      console.log('📋 Order API Response:', JSON.stringify(orderResult, null, 2));
      console.log('📊 Order Response Status:', orderResponse.status);
      
      if (orderResponse.ok && orderResult.message?.status === true && orderResult.message?.data?.sales_order) {
        const salesOrder = orderResult.message.data.sales_order;
        
        // Open payment gateway for both Full Payment and Cash on Delivery
        const primaryAddress = shippingAddresses.find(addr => addr.is_primary === 1);
        const primaryPhone = primaryAddress?.phone || userDetails?.username || '';
        
        // Use correct payment amount based on payment type
        const paymentAmount = selectedPayment === 'full' 
          ? (checkoutData?.payment_summary?.full_payment?.payable_amount || orderResult.message.data.grand_total || displayTotal)
          : (checkoutData?.payment_summary?.cash_on_delivery?.pay_now || 0);
        
        const paymentToken = buildPaymentToken({
          firstName: userDetails?.Customer_name || 'Customer',
          email: "utkarsh.rathore@shoption.in",
          amount: paymentAmount.toFixed(2),
          phone: primaryPhone,
          userId: userDetails?.user_id || salesOrder,
          orderId: salesOrder
        });
        
        const url = new URL(window.location);
        url.pathname = '/payment';
        url.searchParams.set('orderId', salesOrder);
        url.searchParams.set('token', paymentToken);
        url.searchParams.set('paymentMode', selectedPayment);
        
        // Update URL and navigate to payment gateway
        window.history.pushState({}, '', url);
        navigateTo('payment');
        return;
      } else {
        console.error('❌ Order placement failed - Full Response:', JSON.stringify(orderResult, null, 2));
        console.error('❌ Order placement failed - Message:', orderResult.message?.message);
        console.error('❌ Order placement failed - Status:', orderResult.message?.status);
        console.error('❌ Order placement failed - Data:', orderResult.message?.data);
        throw new Error(orderResult.message?.message || 'Order placement failed');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="checkout-page-ctp">
      {showSuccessPopup && (
        <CouponSuccessPopup 
          onClose={() => setShowSuccessPopup(false)} 
          discount={appliedCoupon?.discount_amount}
        />
      )}
      {showRemovePopup && (
        <CouponSuccessPopup 
          onClose={() => setShowRemovePopup(false)} 
          isRemoved={true}
        />
      )}
      <div className="container-ctp">
        <h1>Checkout</h1>
        
        <div className="checkout-flow-ctp">
          {/* 1. Address Section */}
          <div className="checkout-section-ctp">
            <div className="section-header-ctp">
              <h3><CiLocationOn /> Shipping Address</h3>
              {user && userDetails?.token && (
                <button type="button" className="add-address-link-ctp" onClick={() => navigateTo('addNewAddress')}>
                <IoMdPersonAdd /> New Address
                </button>
              )}
            </div>
            
            {/* Display Primary Address */}
            {user && userDetails?.token && shippingAddresses.length > 0 && (
              <div className="api-address-display-ctp">
                {(() => {
                  const primaryAddress = shippingAddresses.find(addr => addr.is_primary === 1);
                  return primaryAddress ? (
                    <div className="address-card-ctp selected">
                      <div className="address-info-ctp">
                        <p>{primaryAddress.customer_name || primaryAddress.address_title} - {primaryAddress.phone}</p>
                        <p>{primaryAddress.state_name || primaryAddress.state}, {primaryAddress.district_name || primaryAddress.district}, {primaryAddress.tahsil_name || primaryAddress.tahsil}</p>
                        <p>{primaryAddress.marketplace_name || primaryAddress.marketplace} - {primaryAddress.pincode}</p>
                      </div>
                    </div>
                  ) : (
                    <p>No primary address found</p>
                  );
                })()
                }
              </div>
            )}
            
            {/* Address Form */}
            {user && userDetails?.token && showAddressForm && (
              <div className="address-form-ctp">
                <h4>Add New Address</h4>
                <div className="form-row-ctp">
                  <input type="text" name="address_title" placeholder="Address Title" value={formData.address_title} onChange={handleInputChange} required />
                  <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleInputChange} required />
                </div>
                <div className="form-group-ctp">
                  <input type="email" name="email_id" placeholder="Email" value={formData.email_id} onChange={handleInputChange} required />
                </div>
                <div className="form-row-ctp">
                  <input type="text" name="address_line1" placeholder="Address Line 1" value={formData.address_line1} onChange={handleInputChange} required />
                  <input type="text" name="address_line2" placeholder="Address Line 2" value={formData.address_line2} onChange={handleInputChange} />
                </div>
                <div className="form-row-ctp">
                  <select name="country" value={formData.country} onChange={(e) => { const country = e.target.value; setFormData(prev => ({ ...prev, country, state: '', district: '', tahsil: '', marketplace: '' })); if (country) fetchStates(country); }} required>
                    <option value="">Select Country</option>
                    {countries.map((country) => (<option key={country.id} value={country.name}>{country.name}</option>))}
                  </select>
                  <select name="state" value={formData.state} onChange={(e) => { const state = e.target.value; setFormData(prev => ({ ...prev, state, district: '', tahsil: '', marketplace: '' })); if (state) fetchDistricts(state); }} required disabled={!formData.country}>
                    <option value="">Select State</option>
                    {states.map((state) => (<option key={state.id} value={state.id}>{state.name}</option>))}
                  </select>
                </div>
                <div className="form-row-ctp">
                  <select name="district" value={formData.district} onChange={(e) => { const district = e.target.value; setFormData(prev => ({ ...prev, district, tahsil: '', marketplace: '' })); if (district) fetchTahsils(district); }} required disabled={!formData.state}>
                    <option value="">Select District</option>
                    {districts.map((district) => (<option key={district.id} value={district.id}>{district.name}</option>))}
                  </select>
                  <select name="tahsil" value={formData.tahsil} onChange={(e) => { const tahsil = e.target.value; setFormData(prev => ({ ...prev, tahsil, marketplace: '' })); if (tahsil) fetchMarketplaces(tahsil); }} required disabled={!formData.district}>
                    <option value="">Select Tahsil</option>
                    {tahsils.map((tahsil) => (<option key={tahsil.id} value={tahsil.id}>{tahsil.name}</option>))}
                  </select>
                </div>
                <div className="form-row-ctp">
                  <select name="marketplace" value={formData.marketplace} onChange={handleInputChange} required disabled={!formData.tahsil}>
                    <option value="">Select Marketplace</option>
                    {marketplaces.map((marketplace) => (<option key={marketplace.id} value={marketplace.id}>{marketplace.name}</option>))}
                  </select>
                  <input type="text" name="pincode" placeholder="PIN Code" value={formData.pincode} onChange={handleInputChange} required />
                </div>
                <div className="form-actions-ctp">
                  <button type="button" className="btn-ctp btn-primary-ctp" onClick={handleAddNewAddress}>Save Address</button>
                  <button type="button" className="btn-ctp btn-outline-ctp" onClick={() => setShowAddressForm(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
          
          {/* 2. Products Section */}
          <div className="checkout-section-ctp">
            <h3>🛍️ Order Items</h3>
            <div className="order-items-ctp">
              {displayCart.map((item, index) => (
                <div key={item.id || item.item || index} className="order-item-ctp">
                  <img src={item.image || 'https://via.placeholder.com/60x60?text=No+Image'} alt={item.name || item.item_name} />
                  <div className="item-details-ctp">
                    <h4>{item.name || item.item_name}</h4>
                    <p>Quantity: {item.quantity}</p>
                    {checkoutData ? (
                      <>
                        <p>Rate: ₹{item.rate}</p>
                         {/* <p>Brand: {item.brand}</p> */}
                        {/* <p>UOM: {item.uom}</p> */}
                        {/* {item.discount > 0 && <p>Discount: ₹{item.discount}</p>} */}
                      </>
                    ) : (
                      <p className="item-price">₹{((item.price || item.rate) * (item.quantity || 1)).toFixed(2)}</p>
                    )}
                  </div>
                  <div className="item-total-ctp">
                    ₹{(item.amount || ((item.price || item.rate) * (item.quantity || 1))).toFixed(2)}
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
          
          {/* 3. Order Summary Section */}
          <div className="checkout-section-ctp">
            <h3><FaClipboardList /> Order Summary</h3>
            
            {/* Coupon Code Section */}
            <div className="coupon-section-ctp">
              {!showCouponInput && !appliedCoupon ? (
                <div className="coupon-trigger-ctp" onClick={() => setShowCouponInput(true)}>
                  <RiCoupon2Fill /> Apply Coupon Code
                </div>
              ) : (
                <>
                  <div className="coupon-input-group-ctp">
                    <input 
                      type="text" 
                      placeholder="Enter coupon code" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="coupon-input-ctp"
                      disabled={appliedCoupon}
                    />
                    {appliedCoupon ? (
                      <button 
                        className="btn-remove-coupon-ctp" 
                        onClick={handleRemoveCoupon}
                      >
                        Remove
                      </button>
                    ) : (
                      <button 
                        className="btn-apply-coupon-ctp" 
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponCode.trim()}
                      >
                        {applyingCoupon ? 'Applying...' : 'Apply'}
                      </button>
                    )}
                  </div>
                  {appliedCoupon && (
                    <div className="coupon-applied-ctp">
                      ✓ Coupon applied successfully
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="order-total-ctp">
              <div className="total-row-ctp">
                <span>Subtotal:</span>
                <span>₹{(appliedCoupon?.sub_total || displayTotal).toFixed(2)}</span>
              </div>
              {(appliedCoupon?.discount_amount > 0 || (checkoutData?.items && checkoutData.items.some(item => item.discount > 0))) && (
                <div className="total-row-ctp discount">
                  <span>Discount:</span>
                  <span>-₹{(
                    (appliedCoupon?.discount_amount || 0) + 
                    (checkoutData?.items?.reduce((sum, item) => sum + (item.discount || 0), 0) || 0)
                  ).toFixed(2)}</span>
                </div>
              )}
              {appliedCoupon?.total_taxes_and_charges > 0 && (
                <div className="total-row-ctp">
                  <span>Taxes:</span>
                  <span>₹{appliedCoupon.total_taxes_and_charges.toFixed(2)}</span>
                </div>
              )}
              <div className="total-row-ctp">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="total-row-ctp total-final-ctp">
                <span>Total:</span>
                <span>₹{(appliedCoupon?.grand_total || checkoutData?.grand_total || displayTotal).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* 4. Payment Options Section */}
          <div className="checkout-section-ctp">
            <h3><MdOutlinePayment /> Payment Options</h3>
            
            {isOrderBelowMinimum ? (
              <div className="minimum-order-warning-ctp">
                <p>⚠️ Minimum order value is ₹{minimumOrderValue}. Current total: ₹{displayTotal.toFixed(2)}</p>
                <p>Please add items worth ₹{(minimumOrderValue - displayTotal).toFixed(2)} more to place order.</p>
              </div>
            ) : (
              <>
                {/* Full Payment Option */}
                {checkoutData?.payment_summary?.full_payment ? (
                  <div className={`payment-option-ctp full-payment-card ${selectedPayment === 'full' ? 'selected' : ''}`} onClick={() => setSelectedPayment('full')}>
                    <div className="payment-radio-ctp">
                      <input type="radio" checked={selectedPayment === 'full'} readOnly />
                    </div>
                    <div className="payment-content-ctp">
                      <h5 className="payment-title-ctp">Full Payment</h5>
                      <div className="payment-subtitle-ctp">No Additional Charges</div>
                    </div>
                    <div className="payment-right-ctp">
                      <div className="payment-price-ctp">₹{checkoutData.payment_summary.full_payment.payable_amount.toFixed(2)}</div>
                      <span className="payment-save-badge-ctp">Save ₹{checkoutData.payment_summary.full_payment.discount_amount.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className={`payment-option-ctp full-payment-card ${selectedPayment === 'full' ? 'selected' : ''}`} onClick={() => setSelectedPayment('full')}>
                    <div className="payment-radio-ctp">
                      <input type="radio" checked={selectedPayment === 'full'} readOnly />
                    </div>
                    <div className="payment-content-ctp">
                      <h5 className="payment-title-ctp">Full Payment</h5>
                      <div className="payment-subtitle-ctp">No Additional Charges</div>
                    </div>
                    <div className="payment-right-ctp">
                      <div className="payment-price-ctp">₹{displayTotal.toFixed(2)}</div>
                    </div>
                  </div>
                )}
                
                {/* Cash on Delivery Option */}
                {checkoutData?.payment_summary?.cash_on_delivery ? (
                  <div className={`payment-option-ctp cod-payment-card ${selectedPayment === 'cod' ? 'selected' : ''}`} onClick={() => setSelectedPayment('cod')}>
                    <div className="payment-radio-ctp">
                      <input type="radio" checked={selectedPayment === 'cod'} readOnly />
                    </div>
                    <div className="payment-content-ctp">
                      <h5 className="payment-title-ctp">Booking Amount</h5>
                      <div className="payment-subtitle-ctp">Pay Rest on Delivery: ₹{checkoutData.payment_summary.cash_on_delivery.pay_on_delivery.toFixed(2)}</div>
                    </div>
                    <div className="payment-right-ctp">
                      <div className="payment-price-ctp">₹{checkoutData.payment_summary.cash_on_delivery.pay_now.toFixed(2)}</div>
                      {checkoutData.payment_summary.cash_on_delivery.discount_amount > 0 && (
                        <span className="payment-save-badge-ctp">Save ₹{checkoutData.payment_summary.cash_on_delivery.discount_amount.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={`payment-option-ctp cod-payment-card ${selectedPayment === 'cod' ? 'selected' : ''}`} onClick={() => setSelectedPayment('cod')}>
                    <div className="payment-radio-ctp">
                      <input type="radio" checked={selectedPayment === 'cod'} readOnly />
                    </div>
                    <div className="payment-content-ctp">
                      <h5 className="payment-title-ctp">Booking Amount</h5>
                      <div className="payment-subtitle-ctp">Pay Rest on Delivery: ₹{displayTotal.toFixed(2)}</div>
                    </div>
                    <div className="payment-right-ctp">
                      <div className="payment-price-ctp">₹0.00</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* 5. Place Order Section */}
          <div className="checkout-section-ctp">
            <button 
              className="place-order-btn-ctp" 
              onClick={handlePlaceOrder}
              disabled={placingOrder || isOrderBelowMinimum}
            >
              {placingOrder ? 'Placing Order...' : isOrderBelowMinimum ? `Minimum Order ₹${minimumOrderValue}` : ' Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;