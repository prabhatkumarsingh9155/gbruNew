import React, { useState, useEffect } from 'react';
import './ProductListing.css';
import { API_CONFIG } from '../../config/apiConfig';

const ProductListing = ({ addToCart, navigateTo, searchQuery, categoryFilter, user, selectedCategory, userDetails, fetchCartCount }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState(new Set());

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check which items are in cart
  const checkCartItems = async () => {
    console.log('ProductListing - checkCartItems called, user:', !!user, 'token:', !!userDetails?.token);
    if (!user || !userDetails?.token) {
      console.log('ProductListing - No user or token, skipping cart check');
      return;
    }
    
    try {
      console.log('ProductListing - Checking cart with token:', userDetails.token);
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.get_cart`, {
        method: 'GET',
        headers: {
          'Authorization': userDetails.token,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('ProductListing - Cart API response status:', response.status);
      const data = await response.json();
      console.log('ProductListing - Cart API response data:', data);
      
      if (response.ok && data.message && data.message.status) {
        console.log('ProductListing - Cart data items:', data.message.data.items);
        const cartItemCodes = new Set(data.message.data.items.map(item => item.item));
        console.log('ProductListing - Cart items found:', Array.from(cartItemCodes));
        setAddedItems(cartItemCodes);
      } else {
        console.log('ProductListing - Cart API failed or returned no data');
      }
    } catch (error) {
      console.error('ProductListing - Error checking cart items:', error);
    }
  };

  // Add to cart via API (same as FeaturedProducts)
  const handleAddToCart = async (product) => {
    if (user && userDetails?.token) {
      try {
        // Directly add item to cart
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
          console.log('✅ SUCCESS: Item added to cart successfully');
          
          // Mark item as added
          setAddedItems(prev => new Set([...prev, product.item_code]));
          
          // Dispatch cart update event
          window.dispatchEvent(new Event('cartUpdated'));
          
          // Refresh cart count
          if (fetchCartCount) {
            fetchCartCount();
          }
        } else {
          console.error('❌ Failed to add item to cart, status:', response.status);
        }
      } catch (error) {
        console.error('❌ Error adding to cart:', error);
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

  // Fetch products from API (same logic as FeaturedProducts)
  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) {
        setLoading(true);
      }
      
      try {
        const requestBody = {
          page: 1,
          page_size: 100,
          mobile_no: user?.phone ? parseInt(user.phone) : 1234567890,
          brand: "Gbru"
        };
        let response;
        
        // Check if we're showing bestsellers
        if (selectedCategory === 'bestsellers') {
          console.log('ProductListing - Fetching bestsellers for user:', user?.phone || 'guest');
          const formData = new FormData();
          formData.append('page', '1');
          formData.append('page_size', '100');
          formData.append('mobile_no', user?.phone || '1234567890');

          response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.erp_api.deals.trending_best_seller.get_trending_best_seller`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              'X-API-KEY': API_CONFIG.API_KEY,
              'X-API-SECRET': API_CONFIG.API_SECRET
            },
            body: formData
          });
          
          console.log('ProductListing - Bestsellers API response status:', response.status);
        } else {
          if (selectedCategory || categoryFilter) {
            requestBody.subcategory = selectedCategory || categoryFilter;
          }
          
          response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.erp_api.item_api.get_items`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-API-KEY': API_CONFIG.API_KEY,
              'X-API-SECRET': API_CONFIG.API_SECRET
            },
            body: JSON.stringify(requestBody)
          });
        }
        
        const data = await response.json();
        console.log('ProductListing - API response data:', data);
        
        let formattedProducts = [];
        if (selectedCategory === 'bestsellers') {
          console.log('ProductListing - Processing bestsellers data');
          // Handle bestsellers API response
          if (data.message && data.message.data && data.message.data.data) {
            console.log('ProductListing - Bestsellers raw data count:', data.message.data.data.length);
            formattedProducts = data.message.data.data.map((item, index) => {
              const product = {
                id: `${item.item_code}-${index}`,
                item_code: item.item_code,
                name: item.item_name || 'Product Name',
                price: parseFloat(item.price || item.actual_rate) || 299,
                originalPrice: parseFloat(item.mrp) || parseFloat(item.price || item.actual_rate) || 399,
                discount: parseFloat(item.discount) || 25,
                image: item.image || item.item_image || 'https://via.placeholder.com/300x200',
                category: item.item_group || 'General',
                rating: 4.5,
                reviews: Math.floor(Math.random() * 100) + 10
              };
              return product;
            });
            console.log('ProductListing - Formatted bestsellers count:', formattedProducts.length);
          }
        } else {
          // Handle regular products API response
          if (data.message && data.message.status && data.message.data && data.message.data.data.length > 0) {
            formattedProducts = data.message.data.data.map((item, index) => ({
              id: item.item_code || `product-${index}`,
              item_code: item.item_code,
              name: item.item_name || 'Product Name',
              price: parseFloat(item.price || item.actual_rate) || 299,
              originalPrice: parseFloat(item.mrp) || parseFloat(item.price || item.actual_rate) || 399,
              discount: parseFloat(item.discount) || 25,
              image: item.custom_image_1 || 'https://storage.googleapis.com/shoption-cdn-bucket/uploads/2024/omkar/alucable.png',
              category: item.item_group || 'General',
              rating: 4.5,
              reviews: Math.floor(Math.random() * 100) + 10
            }));
          }
        }
        
        console.log('ProductListing - Final products count:', formattedProducts.length);
        setProducts(formattedProducts);
      } catch (error) {
        setProducts([
          { id: 1, name: 'Premium Cable', price: 299, originalPrice: 399, discount: 25, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop', category: 'Electronics', rating: 4.5, reviews: 25, item_code: 'CABLE001' },
          { id: 2, name: 'Smart Switch', price: 159, originalPrice: 199, discount: 20, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop', category: 'Electronics', rating: 4.2, reviews: 18, item_code: 'SWITCH001' },
          { id: 3, name: 'Solar Panel', price: 4599, originalPrice: 5599, discount: 18, image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&h=200&fit=crop', category: 'Solar', rating: 4.7, reviews: 32, item_code: 'SOLAR001' },
          { id: 4, name: 'Power Tool', price: 1299, originalPrice: null, discount: null, image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300&h=200&fit=crop', category: 'Tools', rating: 4.3, reviews: 22, item_code: 'TOOL001' },
          { id: 5, name: 'LED Light', price: 89, originalPrice: 120, discount: 26, image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=300&h=200&fit=crop', category: 'Electronics', rating: 4.1, reviews: 15, item_code: 'LED001' },
          { id: 6, name: 'Wire Set', price: 199, originalPrice: 250, discount: 20, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop', category: 'Electronics', rating: 4.4, reviews: 28, item_code: 'WIRE001' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    checkCartItems();
  }, [selectedCategory, categoryFilter, user, userDetails]);

  // Filter products based on search only
  useEffect(() => {
    let filtered = products;
    
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, searchQuery]);

  if (loading) {
    return (
      <div className="product-listing-pl">
        <div className="container-pl">
          <div className="listing-header-pl">
            <h1>Products</h1>
            <p>Loading products...</p>
          </div>
          <div className="products-grid-pl">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="product-card-pl" style={{opacity: 0.6}}>
                <div className="product-image-pl" style={{background: '#f3f4f6', height: '200px'}}></div>
                <div className="product-info-pl">
                  <div style={{background: '#f3f4f6', height: '20px', marginBottom: '8px'}}></div>
                  <div style={{background: '#f3f4f6', height: '16px', width: '60%'}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-listing-pl">
      <div className="container-pl">
        <div className="listing-header-pl">
          <h1>{selectedCategory === 'bestsellers' ? 'Best Sellers' : 'Products'}</h1>
          <p>{filteredProducts.length} products found</p>
        </div>
        
        <div className="listing-content-pl">
          <div className="products-grid-pl">
            {filteredProducts.length === 0 ? (
              <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '2rem'}}>
                <p>No products found</p>
              </div>
            ) : (
              filteredProducts.map((product, index) => (
              <div key={`${product.item_code || product.id}-${index}`} className="product-card-pl">
                <div className="product-image-pl" onClick={() => handleViewDetails(product)}>
                  {product.discount > 0 && (
                    <div className="discount-badge-pl">-{product.discount}% OFF</div>
                  )}
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-info-pl">
                  <h3 className="product-name-pl">{product.name}</h3>
                  <p className="product-tagline-pl">Crafted for farmers, powered by innovation. Right at your fingertips.</p>
                  {product.discount > 0 && product.originalPrice > product.price && (
                    <span className="discount-text-pl">{product.discount}% OFF • Save ₹{Math.round(product.originalPrice - product.price)}</span>
                  )}
                  <div className="product-rating-pl">
                    <span className="stars-pl">{'★'.repeat(Math.floor(product.rating))}</span>
                    <span className="rating-text-pl">({product.reviews})</span>
                  </div>
                  <div className="product-price-pl">
                    {user ? (
                      <>
                        <span className="current-price-pl">₹{product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className="original-price-pl">₹{product.originalPrice}</span>
                        )}
                      </>
                    ) : (
                      <span className="login-price-pl">Login to see price</span>
                    )}
                  </div>
                  <button className="btn-addCart-pl" onClick={() => user ? handleAddToCart(product) : navigateTo('auth')}>
                    {user ? (addedItems.has(product.item_code) ? 'Added' : 'Add to Cart') : 'Login to Buy'}
                  </button>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;