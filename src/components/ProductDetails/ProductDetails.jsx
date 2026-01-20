import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../../config/apiConfig';
import { MdLocalShipping } from 'react-icons/md';
import { FaBox, FaClipboardList, FaTrophy } from 'react-icons/fa';
import SimilarProductDetails from '../SimilarProductDetails/SimilarProductDetails';
import './ProductDetails.css';

const ProductDetails = ({ product, productDetails, addToCart, navigateTo, user, previousPage, userDetails, fetchCartCount }) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  
  // Use API data if available, otherwise fallback to product data
  const details = productDetails?.message?.data;
  const images = details?.images ? Object.values(details.images).filter(img => img && img.trim() !== '') : [];
  
  const displayProduct = details ? {
    id: details.item_code,
    name: details.item_name,
    price: details.price,
    originalPrice: details.mrp,
    image: images[0] || details.images?.image_1,
    images: images,
    description: details.description,
    rating: 4.5,
    reviews: 100,
    brand: details.brand,
    unit: details.measurement_unit,
    minOrderQty: details.min_order_qty
  } : product;
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Set initial quantity to minOrderQty if available
  useEffect(() => {
    if (displayProduct?.minOrderQty) {
      setQuantity(displayProduct.minOrderQty);
    }
  }, [displayProduct?.minOrderQty]);
  
  if (!displayProduct) {
    return <div className="container">Product not found</div>;
  }

  // Check if item is already in cart
  const checkCartStatus = async () => {
    if (!user || !userDetails?.token) return;
    
    try {
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.cart_item_details?item=${displayProduct.id || displayProduct.item_code}`, {
        method: 'GET',
        headers: {
          'Authorization': userDetails.token,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (response.ok && data.message && data.message.status) {
        setIsAdded(true);
      }
    } catch (error) {
      console.error('Error checking cart status:', error);
    }
  };

  // Check cart status when component mounts
  useEffect(() => {
    checkCartStatus();
  }, [user, userDetails?.token, displayProduct]);

  // Handle scroll for sticky bar
  useEffect(() => {
    const handleScroll = () => {
      const isVisible = window.scrollY > 400;
      setShowStickyBar(isVisible);
      window.dispatchEvent(new CustomEvent('stickyBarVisible', { detail: { visible: isVisible } }));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent('stickyBarVisible', { detail: { visible: false } }));
    };
  }, []);

  const handleAddToCart = async () => {
    console.log('ProductDetails - Add to cart clicked');
    console.log('ProductDetails - User:', !!user, 'Token:', !!userDetails?.token);
    console.log('ProductDetails - Product ID:', displayProduct.id || displayProduct.item_code);
    
    if (user && userDetails?.token) {
      try {
        // Directly add item to cart using API
        const requestData = {
          items: [{
            item: displayProduct.id || displayProduct.item_code,
            quantity: quantity,
            is_moq_applicable: 0
          }]
        };
        
        console.log('ProductDetails - API Request:', requestData);
        
        const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.add_cart`, {
          method: 'POST',
          headers: {
            'Authorization': userDetails.token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        });
        
        console.log('ProductDetails - API Response Status:', response.status);
        
        if (response.ok) {
          const addData = await response.json();
          console.log('✅ ProductDetails - SUCCESS: Item added to cart');
          console.log('ProductDetails - Response:', addData);
          
          // Mark item as added
          setIsAdded(true);
          
          // Dispatch cart update event
          window.dispatchEvent(new Event('cartUpdated'));
          
          // Refresh cart count
          if (fetchCartCount) {
            fetchCartCount();
          }
        } else {
          console.error('❌ ProductDetails - Failed to add item to cart');
        }
      } catch (error) {
        console.error('❌ ProductDetails - Error adding to cart:', error);
      }
    } else {
      console.log('ProductDetails - Using local cart (no user or token)');
      addToCart(displayProduct, quantity);
      setIsAdded(true);
    }
  };

  return (
    <div className="product-details">
      <div className="container">
        <button className="back-btnn" onClick={() => navigateTo(previousPage || 'home')}>
          ← Back
        </button>
        
        <div className="product-content">
          <div className="product-images-pd">
            <div className="main-image-pd">
              {displayProduct.originalPrice > displayProduct.price && (
                <div className="discount-badge-pd">
                  {Math.round(((displayProduct.originalPrice - displayProduct.price) / displayProduct.originalPrice) * 100)}% OFF
                </div>
              )}
              <img src={displayProduct.images?.[selectedImage] || displayProduct.image} alt={displayProduct.name} />
            </div>
            {displayProduct.images && displayProduct.images.length > 1 && (
              <div className="image-thumbnails">
                {displayProduct.images.map((img, index) => (
                  <img 
                    key={index}
                    src={img} 
                    alt={`${displayProduct.name} ${index + 1}`}
                    className={selectedImage === index ? 'active' : ''}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="product-info">
            <h1>{displayProduct.name}</h1>
            
            <div className="price-section">
              <div className="price-row">
                <span className="current-price">₹{displayProduct.price?.toLocaleString() || '0'}/-</span>
                {displayProduct.originalPrice && displayProduct.originalPrice > displayProduct.price && (
                  <>
                    <span className="original-price">MRP: ₹{displayProduct.originalPrice.toLocaleString()}</span>
                    {/* <span className="discount-badge">{Math.round(((displayProduct.originalPrice - displayProduct.price) / displayProduct.originalPrice) * 100)}% Off</span> */}
                  </>
                )}
              </div>
              {/* <div className="per-unit-text">(₹{displayProduct.price.toLocaleString()} per {displayProduct.unit || 'unit'})</div> */}
            </div>
            
            {/* <div className="tax-info">
              <span><FaClipboardList /> Inclusive of all taxes</span>
            </div> */}
            
            <div className="quality-badge">
              <span><FaTrophy /> Farmer Approved Quality</span>
              <span><FaClipboardList /> Inclusive of all taxes</span>
            </div>
            
            <div className="delivery-info">
              <div className="info-box">
                <div className="info-icon"><FaBox /></div>
                <div className="info-content">
                  <div className="info-label">MINIMUM ORDER</div>
                  <div className="info-value">{displayProduct.minOrderQty || 1}.0 Units</div>
                </div>
              </div>
              <div className="info-box">
                <div className="info-icon"><MdLocalShipping /></div>
                <div className="info-content">
                  <div className="info-label">FAST DELIVERY</div>
                  <div className="info-value">2-3 Days</div>
                </div>
              </div>
            </div>
            
            {/* Payment Options */}
            {details && (
              <div className="payment-options">
                <div className="payment-option">
                  <h4>Full Payment</h4>
                  <div className="payment-details">
                    <div className="payment-row">
                      <span>Pay Now:</span>
                      <span className="price">₹{(details.full_payment_amount * quantity).toFixed(2)}</span>
                    </div>
                    <div className="payment-row">
                      <span>Actual Price:</span>
                      <span>₹{(displayProduct.price * quantity).toFixed(2)}</span>
                    </div>
                    <div className="payment-row">
                      <span>You Save:</span>
                      <span className="discount">₹{(details.full_payment_discount * quantity).toFixed(2)}</span>
                    </div>
                  </div>
                  
                </div>
                <div className="payment-option">
                  <h4>Booking Amount</h4>
                  <div className="payment-details">
                    <div className="payment-row">
                      <span>Pay Now:</span>
                      <span className="price">₹{(details.COD_Display * quantity).toFixed(2)}</span>
                    </div>
                    <div className="payment-row">
                      <span>Actual Price:</span>
                      <span>₹{(displayProduct.price * quantity).toFixed(2)}</span>
                    </div>
                    <div className="payment-row">
                      <span>Pay on Delivery:</span>
                      <span>₹{((details.COD_value - details.COD_Display) * quantity).toFixed(2)}</span>
                    </div>
                  </div>
                  
                </div>
              </div>
            )}
            
            <div className="quantity-selector">
              <div className="quantity-header">
                <span className="quantity-label">Quantity:</span>
                <span className="quantity-total">₹{((displayProduct.price || 0) * quantity).toLocaleString()}</span>
              </div>
              <div className="quantity-controls">
                <button onClick={() => setQuantity(Math.max(displayProduct.minOrderQty || 1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>
            
            <div className="product-actions">
              <button className="btn btn-primary btn-lg " onClick={handleAddToCart}>
                {isAdded ? 'Added' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="product-tabs">
          <div className="tab-buttons">
            <button 
              className={activeTab === 'description' ? 'active' : ''}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={activeTab === 'specifications' ? 'active' : ''}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
          </div>
          
          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="tab-panel">
                <p>{displayProduct.description}</p>
              </div>
            )}
            {activeTab === 'specifications' && (
              <div className="tab-panel">
                <ul>
                  <li>Brand: {displayProduct.brand}</li>
                  <li>Unit: {displayProduct.unit}</li>
                  <li>Price: ₹{displayProduct.price}</li>
                  <li>MRP: ₹{displayProduct.originalPrice}</li>
                  {displayProduct.minOrderQty && <li>Minimum Order Quantity: {displayProduct.minOrderQty}</li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className={`sticky-bottom-bar ${showStickyBar ? 'visible' : ''}`}>
        <div className="sticky-content">
          <div className="sticky-price">
            <div className="sticky-price-main">₹{details?.full_payment_amount ? (details.full_payment_amount * quantity).toLocaleString() : ((displayProduct.price || 0) * quantity).toLocaleString()}</div>
            <div className="sticky-price-details">
              <span className="sticky-mrp">MRP: ₹{((displayProduct.originalPrice || 0) * quantity).toLocaleString()}</span>
              <span className="sticky-save">Save ₹{details?.full_payment_discount ? (details.full_payment_discount * quantity).toLocaleString() : (((displayProduct.originalPrice || 0) - (displayProduct.price || 0)) * quantity).toLocaleString()}</span>
            </div>
          </div>
          <div className="sticky-actions">
            <button className="btn-sticky-cart" onClick={handleAddToCart}>
              {isAdded ? 'Added' : '🛒 Add To Cart'}
            </button>
          </div>
        </div>
      </div>

      <SimilarProductDetails 
        currentProduct={displayProduct} 
        user={user} 
        userDetails={userDetails} 
        navigateTo={navigateTo} 
        fetchCartCount={fetchCartCount} 
      />
    </div>
  );
};

export default ProductDetails;