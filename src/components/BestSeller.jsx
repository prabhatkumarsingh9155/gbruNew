import React, { useEffect, useState } from 'react';
import { API_CONFIG } from '../config/apiConfig';
import './BestSeller.css';

const BestSeller = ({ addToCart, navigateTo, user, products = [], userDetails, fetchCartCount }) => {
  const [apiProducts, setApiProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addedItems, setAddedItems] = useState(new Set());

  // Check which items are in cart
  const checkCartItems = async () => {
    if (!user || !userDetails?.token) return;
    
    try {
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.get_cart`, {
        method: 'GET',
        headers: {
          'Authorization': userDetails.token,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (response.ok && data.message && data.message.status) {
        const cartItemCodes = new Set(data.message.data.items.map(item => item.item));
        setAddedItems(cartItemCodes);
      }
    } catch (error) {
      console.error('Error checking cart items:', error);
    }
  };

  // Add to cart via API
  const handleAddToCart = async (product) => {
    if (user && userDetails?.token) {
      try {
        const requestData = {
          items: [{
            item: product.item_code,
            quantity: 1,
            is_moq_applicable: 0
          }]
        };
        
        const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.add_cart`, {
          method: 'POST',
          headers: {
            'Authorization': userDetails.token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        });
        
        if (response.ok) {
          const addData = await response.json();
          if (addData.message && addData.message.status) {
            setAddedItems(prev => new Set([...prev, product.item_code]));
            
            // Dispatch cart update event
            window.dispatchEvent(new Event('cartUpdated'));
          }
          if (fetchCartCount) {
            fetchCartCount();
          }
          await checkCartItems();
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    } else {
      addToCart(product);
    }
  };
  // Handle view details - fetch item details from API
  const handleViewDetails = async (product) => {
    const itemCode = product.item_code || product.id;
    if (!itemCode) {
      navigateTo('products', null, product.category);
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.erp_api.Item_details.get_item_details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-KEY': API_CONFIG.API_KEY,
          'X-API-SECRET': API_CONFIG.API_SECRET
        },
        body: JSON.stringify({
          page: 1,
          page_size: 20,
          mobile_no: user?.phone ? parseInt(user.phone) : 1234567890,
          item_code: itemCode
        })
      });
      
      const data = await response.json();
      
      // Navigate to product details with the fetched data
      navigateTo('productDetails', { product, details: data });
    } catch (error) {
      navigateTo('products', null, product.category);
    }
  };

  const fetchBestSellers = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('page', '1');
      formData.append('page_size', '100');
      formData.append('mobile_no', user.phone);

      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.erp_api.deals.trending_best_seller.get_trending_best_seller`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-API-KEY': API_CONFIG.API_KEY,
          'X-API-SECRET': API_CONFIG.API_SECRET
        },
        body: formData
      });
      
        if (response.ok) {
          const data = await response.json();
          if (data.message && data.message.status && data.message.data && data.message.data.data) {
            const formattedProducts = data.message.data.data.map((item, index) => ({
              id: item.item_code || index,
              item_code: item.item_code,
              name: item.item_name || 'Product Name',
              price: item.price || item.actual_rate || null,
              originalPrice: item.mrp || item.price || item.actual_rate || null,
              discount: item.discount || null,
              image: item.custom_image_1 || item.image || 'https://via.placeholder.com/300x200',
              category: item.item_group || 'General',
              rating: 4.5,
              reviews: Math.floor(Math.random() * 100) + 10,
              mrp: item.mrp,
              actual_rate: item.actual_rate
            }));
            setApiProducts(formattedProducts);
          } else {
            // If no data, show fallback products
            setApiProducts([
              { id: 1, name: '1.5 HP 100MM Borewell Submersible Pumps-1 PH (Oil Filled) KP4-0321S-CP A', price: 299, originalPrice: 399, discount: 25, image: 'https://storage.googleapis.com/shoption-cdn-bucket/uploads/2021/kbl/KP40321SCPA.jpg', category: 'Motor & Pump', rating: 4.5, reviews: 125, item_code: '12832' },
              { id: 2, name: '4" S.S. BALL VALVE', price: 159, originalPrice: 199, discount: 20, image: 'https://storage.googleapis.com/shoption-cdn-bucket/uploads/2021/images/ciballvalve.jpg', category: 'Pipe Fittings & Solution', rating: 4.7, reviews: 89, item_code: '20068' },
              { id: 3, name: 'THRESHER SPLIT FLY WHEEL - 31 inch 79 KG', price: 4599, originalPrice: 5599, discount: 18, image: 'https://storage.googleapis.com/shoption-cdn-bucket/uploads/2021/01/THRESHER-SPLIT-FLY-WHEEL.jpeg', category: 'Tractor Implements', rating: 4.8, reviews: 156, item_code: '11907' }
            ]);
          }
        }
    } catch (error) {
      // Fallback products on error
      setApiProducts([
        { id: 1, name: 'Best Seller Cable', price: 299, originalPrice: 399, discount: 25, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop', category: 'Electronics', rating: 4.5, reviews: 125, item_code: 'BEST001' },
        { id: 2, name: 'Top Switch', price: 159, originalPrice: 199, discount: 20, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop', category: 'Electronics', rating: 4.7, reviews: 89, item_code: 'BEST002' },
        { id: 3, name: 'Popular Solar Panel', price: 4599, originalPrice: 5599, discount: 18, image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&h=200&fit=crop', category: 'Solar', rating: 4.8, reviews: 156, item_code: 'BEST003' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBestSellers();
    }
    checkCartItems();
  }, [user, userDetails]);

  const displayProducts = user ? apiProducts : products.filter(p => p.bestSeller);

  return (
    <section className="bestsellers-section-dt">
      <div className="container">
        <div className="section-header-dt">
          <h2 className="section-title-dt">Best Sellers</h2>
          
          <button className="view-all-link-dt" onClick={() => navigateTo('products', null, null, 'bestsellers')}>View All →</button>
        </div>
        {loading ? (
          <div className="loading-message">Loading best sellers...</div>
        ) : displayProducts.length === 0 ? (
          <div className="empty-message">No best sellers available</div>
        ) : (
        <div className="products-scroll-dt">
          {displayProducts.map((product, index) => (
            <div key={`${product.id || product.item_code || 'product'}-${index}`} className="product-card-dt">
              <div className="product-image-dt" onClick={() => handleViewDetails(product)}>
                <img 
                  src={product.image || product.item_image || 'https://via.placeholder.com/300x200'} 
                  alt={product.name || product.item_name || 'Product'} 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200'; }}
                />
                {user ? (
                  product.originalPrice && product.originalPrice > product.price && (
                    <div className="discount-badge-dt">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </div>
                  )
                ) : (
                  product.originalPrice > product.price && (
                    <div className="discount-badge-dt">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </div>
                  )
                )}
                <div className="product-rating-dt">
                  <span className="stars-dt">★</span>
                  <span className="rating-text-dt">({product.reviews || 0})</span>
                </div>
              </div>
              <div className="product-info-dt">
                <h3 className="product-name-dt">{product.name || product.item_name || 'Product Name'}</h3>
                <p className="product-tagline-dt">Crafted for farmers, powered by innovation. Right at your fingertips.</p>
                {product.discount > 0 && (
                  <div className="discount-text-dt">
                    You Save ₹{Math.round(product.originalPrice - product.price)} ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%)
                  </div>
                )}
                <div className="product-price-dt">
                  {product.price ? (
                    <>
                      <span className="current-price-dt">₹{product.price}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="original-price-dt">₹{product.originalPrice}</span>
                      )}
                    </>
                  ) : (
                    <span className="login-price-dt">Price not available</span>
                  )}
                </div>
                <button className="btn-dt btn-primary-dt" onClick={() => user ? handleAddToCart(product) : navigateTo('auth')}>
                  {addedItems.has(product.item_code) ? 'Added' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
};

export default BestSeller;