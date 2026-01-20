import React, { useState, useEffect } from 'react';
import './FeaturedProducts.css';
import { API_CONFIG } from '../../config/apiConfig';

// FeaturedProducts component - Displays a grid of featured products with add to cart functionality
const FeaturedProducts = ({ addToCart, navigateTo, user, selectedCategory, userDetails, fetchCartCount, refreshTrigger }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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
    console.log('=== ADD TO CART DEBUG ===');
    console.log('item_code:', product.item_code);
    console.log('user:', user);
    console.log('userDetails:', userDetails);
    console.log('token:', userDetails?.token);
    
    if (user && userDetails?.token) {
      try {
        // First check if item is already in cart
        const checkResponse = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.cart_item_details?item=${product.item_code}`, {
          method: 'GET',
          headers: {
            'Authorization': userDetails.token,
            'Content-Type': 'application/json'
          }
        });
        
        const checkData = await checkResponse.json();
        
        if (checkResponse.ok && checkData.message && checkData.message.status) {
          // Item already exists in cart, update quantity
          const currentQuantity = checkData.message.data.quantity;
          const updateResponse = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.update_cart_item`, {
            method: 'PUT',
            headers: {
              'Authorization': userDetails.token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              item: product.item_code,
              quantity: currentQuantity + 1
            })
          });
          
          if (updateResponse.ok) {
            const updateData = await updateResponse.json();
            console.log('✅ SUCCESS: Item quantity updated in cart');
            console.log('Update response:', updateData);
            // Only mark as added if API call was successful
            if (updateData.message && updateData.message.status) {
              console.log('Setting item as added:', product.item_code);
              setAddedItems(prev => new Set([...prev, product.item_code]));
            } else {
              console.error('Update API returned error:', updateData);
            }
          } else {
            console.error('❌ Failed to update quantity');
          }
        } else {
          // Item not in cart, add new item
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
            console.log('Add response:', addData);
            // Only mark as added if API call was successful
            if (addData.message && addData.message.status) {
              console.log('Setting item as added:', product.item_code);
              setAddedItems(prev => new Set([...prev, product.item_code]));
              
              // Dispatch cart update event
              window.dispatchEvent(new Event('cartUpdated'));
            } else {
              console.error('Add API returned error:', addData);
            }
          } else {
            console.error('❌ Failed to add item to cart');
          }
        }
        
        // Refresh cart count and status in header
        if (fetchCartCount) {
          fetchCartCount();
        }
        // Re-check cart items to update UI state
        await checkCartItems();
      } catch (error) {
        console.error('❌ NETWORK ERROR:', error);
      }
    } else {
      console.log('Using local cart (no user or token)');
      addToCart(product);
    }
    console.log('=== END DEBUG ===');
  };
  const handleViewDetails = async (product) => {
    console.log('item_code:', product.item_code);
    
    if (!product.item_code) {
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
          item_code: product.item_code
        })
      });
      
      const data = await response.json();
      
      // Navigate to product details with the fetched data
      navigateTo('productDetails', { product, details: data });
    } catch (error) {
      navigateTo('products', null, product.category);
    }
  };

  // Refresh cart items when refreshTrigger changes (when returning from other pages)
  useEffect(() => {
    if (user && userDetails?.token && refreshTrigger) {
      checkCartItems();
    }
  }, [refreshTrigger, user, userDetails?.token]);

  // Refresh cart items when component mounts or cart changes
  useEffect(() => {
    if (user && userDetails?.token) {
      checkCartItems();
    }
  }, [user, userDetails?.token]);

  // Refresh cart items when page becomes visible (user returns from ProductDetails)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && userDetails?.token) {
        checkCartItems();
      }
    };

    const handleFocus = () => {
      if (user && userDetails?.token) {
        checkCartItems();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, userDetails?.token]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      console.log('FeaturedProducts - useEffect triggered, selectedCategory:', selectedCategory, 'user:', !!user);
      
      // Don't fetch if user is not available yet after login
      if (!user) {
        // Show dummy products when no user is logged in
        setProducts([
          { id: 1, name: 'Premium Cable', price: 299, originalPrice: 399, discount: 25, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop', category: 'Electronics', rating: 4.5, reviews: 25, item_code: 'CABLE001' },
          { id: 2, name: 'Smart Switch', price: 159, originalPrice: 199, discount: 20, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop', category: 'Electronics', rating: 4.2, reviews: 18, item_code: 'SWITCH001' },
          { id: 3, name: 'Solar Panel', price: 4599, originalPrice: 5599, discount: 18, image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&h=200&fit=crop', category: 'Solar', rating: 4.7, reviews: 32, item_code: 'SOLAR001' },
          { id: 4, name: 'Power Tool', price: 1299, originalPrice: null, discount: null, image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300&h=200&fit=crop', category: 'Tools', rating: 4.3, reviews: 22, item_code: 'TOOL001' }
        ]);
        setLoading(false);
        return;
      }
      
      try {
        const requestBody = {
          page: 1,
          page_size: 8,
          mobile_no: user?.phone ? parseInt(user.phone) : 6206300341,
          brand: "Gbru"
        };
        
        if (selectedCategory && selectedCategory !== 'bestsellers') {
          requestBody.subcategory = selectedCategory;
        } else {
          requestBody.subcategory = "Flat Submersible Cable";
        }
        
        console.log('FeaturedProducts - API request:', requestBody);
        
        const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.erp_api.item_api.get_items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-API-KEY': API_CONFIG.API_KEY,
            'X-API-SECRET': API_CONFIG.API_SECRET
          },
          body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        console.log('FeaturedProducts - API response:', data);
        
        if (data.message && data.message.status && data.message.data && data.message.data.data.length > 0) {
          const formattedProducts = data.message.data.data.map((item, index) => ({
            id: item.item_code || index,
            item_code: item.item_code,
            name: item.item_name || 'Product Name',
            price: item.price || item.actual_rate || null,
            originalPrice: item.mrp || item.price || item.actual_rate || null,
            discount: item.discount || null,
            image: item.custom_image_1 || 'https://storage.googleapis.com/shoption-cdn-bucket/uploads/2024/omkar/alucable.png',
            category: item.item_group || 'General',
            rating: 4.5,
            reviews: Math.floor(Math.random() * 100) + 10
          }));
          console.log('FeaturedProducts - Setting API products:', formattedProducts.length);
          setProducts(formattedProducts);
        } else {
          console.log('FeaturedProducts - No API data returned');
          setProducts([]);
        }
      } catch (error) {
        console.error('FeaturedProducts - API Error:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    if (user && userDetails?.token) {
      checkCartItems();
    }
  }, [selectedCategory, user, userDetails]);

  if (loading) {
    return (
      <section className="featured-section-ft">
        <div className="container">
          <div className="section-header-ft">
            <h2 className="section-title-ft">Featured Products</h2>
          </div>
          <div className="products-grid-ft">
            {[1,2,3,4].map(i => (
              <div key={i} className="product-card-ft loading-skeleton-ft">
                <div className="product-image-ft skeleton-image-ft"></div>
                <div className="product-info-ft">
                  <div className="skeleton-text-large-ft"></div>
                  <div className="skeleton-text-small-ft"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-section-ft">
      <div className="container">
        <div className="section-header-ft">
          <h2 className="section-title-ft">Featured Products</h2>
          <button className="view-all-link-ft" onClick={() => navigateTo('products', null, selectedCategory && selectedCategory !== 'bestsellers' ? selectedCategory : 'Flat Submersible Cable')}>View All →</button>
        </div>
        
        <div className="products-grid-ft">
          {products.length === 0 ? (
            <div className="empty-products-ft">
              <p>No products found for this category</p>
            </div>
          ) : (
            products.slice(0, 4).map(product => (
              <div key={product.id} className="product-card-ft">
                <div className="product-image-ft" onClick={() => handleViewDetails(product)}>
                  <img src={product.image} alt={product.name} />
                  {product.discount && product.discount > 0 && (
                    <div className="discount-badge-ft">
                      -{product.discount}% OFF
                    </div>
                  )}
                  <div className="product-rating-ft">
                    <span className="stars-ft">★</span>
                    <span className="rating-text-ft">({product.reviews})</span>
                  </div>
                </div>
                <div className="product-info-ft">
                  <h3 className="product-name-ft">{product.name}</h3>
                  <p className="product-tagline-ft">Crafted for farmers, powered by innovation. Right at your fingertips.</p>
                {product.discount > 0 && (
                    <div className="discount-text-ft">
                      You Save ₹{(product.originalPrice - product.price).toFixed(0)} ({product.discount}%)
                    </div>
                  )}
                  <div className="product-price-ft">
                    {user && product.price ? (
                      <>
                        <span className="current-price-ft">₹{product.price}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="original-price-ft">₹{product.originalPrice}</span>
                        )}
                      </>
                    ) : (
                      <span className="login-price-ft">{user ? 'Price not available' : 'Login to see price'}</span>
                    )}
                  </div>
                  <button className="cart-ft btn-goldi-cart" onClick={() => user ? handleAddToCart(product) : navigateTo('auth')}>
                    {user ? (addedItems.has(product.item_code) ? 'Added' : 'Add to Cart') : 'Login to Buy'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;