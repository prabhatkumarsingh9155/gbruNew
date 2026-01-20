import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../../config/apiConfig';
import './SimilarProductDetails.css';

const SimilarProductDetails = ({ currentProduct, user, userDetails, navigateTo, fetchCartCount, onCartUpdate }) => {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [addedItems, setAddedItems] = useState(new Set());

  useEffect(() => {
    console.log('SimilarProductDetails - currentProduct:', currentProduct);
    console.log('SimilarProductDetails - user:', user);
    if (currentProduct && user) {
      fetchSimilarProducts();
    }
  }, [currentProduct, user]);

  const fetchSimilarProducts = async () => {
    const itemCode = currentProduct?.item_code || currentProduct?.id;
    console.log('Fetching similar products for item_code:', itemCode);
    
    if (!user || !itemCode) {
      console.log('Missing user or item_code');
      return;
    }
    
    try {
      const requestBody = {
        page: "1",
        page_size: "20",
        mobile_no: user.phone.toString(),
        item_code: itemCode.toString()
      };
      console.log('Request body:', requestBody);
      
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.erp_api.get_similar_items.get_similar_items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_CONFIG.API_KEY,
          'X-API-SECRET': API_CONFIG.API_SECRET
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      console.log('Similar products response:', data);
      if (data.message?.status && data.message.data?.data) {
        const products = data.message.data.data
          .filter(item => item.item_code !== itemCode.toString())
          .map((item) => ({
            id: item.item_code,
            item_code: item.item_code,
            name: item.item_name || 'Product Name',
            price: parseFloat(item.price || item.actual_rate) || 0,
            originalPrice: parseFloat(item.mrp) || parseFloat(item.price || item.actual_rate),
            discount: parseFloat(item.discount) || 0,
            image: item.custom_image_1 || 'https://storage.googleapis.com/shoption-cdn-bucket/uploads/2024/omkar/alucable.png',
            category: item.item_group || 'General'
          }));
        
        console.log('Filtered similar products count:', products.length);
        setSimilarProducts(products);
      }
    } catch (error) {
      console.error('Error fetching similar items:', error);
    }
  };

  const handleAddToCart = async (product) => {
    if (!user || !userDetails?.token) return;
    
    try {
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.add_cart`, {
        method: 'POST',
        headers: {
          'Authorization': userDetails.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: [{
            item: product.item_code,
            quantity: 1,
            is_moq_applicable: 0
          }]
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.message?.status) {
        setAddedItems(prev => new Set([...prev, product.item_code]));
        window.dispatchEvent(new Event('cartUpdated'));
        if (onCartUpdate) await onCartUpdate();
        if (fetchCartCount) await fetchCartCount();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleViewDetails = async (product) => {
    if (!user || !product.item_code) return;

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
          mobile_no: parseInt(user.phone),
          item_code: product.item_code
        })
      });
      
      const data = await response.json();
      navigateTo('productDetails', { product, details: data });
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const handleViewAll = () => {
    // Navigate to products page with similar items filter
    navigateTo('products');
  };

  console.log('Rendering SimilarProductDetails, products count:', similarProducts.length);
  
  if (similarProducts.length === 0) return null;

  return (
    <div className="similar-products-container-spd">
      <div className="container-spd">
        <div className="similar-products-section-spd">
        <h2>
          You May Also Like
          <button className="view-all-btn-spd" onClick={handleViewAll}>View All</button>
        </h2>
        <div className="products-scroll-container-spd">
          <div className="products-scroll-spd">
            {similarProducts.slice(0, 4).map(product => (
              <div key={product.id} className="similar-product-card-spd">
                <div className="product-image-similar-spd" onClick={() => handleViewDetails(product)}>
                  <img src={product.image} alt={product.name} />
                  {product.discount > 0 && (
                    <div className="discount-badge-similar-spd">
                      -{product.discount}% OFF
                    </div>
                  )}
                  <div className="product-rating-similar-spd">
                    <span className="stars-similar-spd">★</span>
                    <span className="rating-text-similar-spd">(25)</span>
                  </div>
                </div>
                <div className="product-info-similar-spd">
                  <h3 className="product-name-similar-spd">{product.name}</h3>
                  <p className="product-tagline-similar-spd">Crafted for farmers, powered by innovation. Right at your fingertips.</p>
                  {product.discount > 0 && (
                    <div className="discount-text-similar-spd">
                      You Save ₹{(product.originalPrice - product.price).toFixed(0)} ({product.discount}%)
                    </div>
                  )}
                  <div className="product-price-similar-spd">
                    <span className="current-price-similar-spd">₹{product.price.toLocaleString()}</span>
                    {product.originalPrice > product.price && (
                      <span className="original-price-similar-spd">₹{product.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                  <button className="btn-similar-cart-spd" onClick={() => handleAddToCart(product)}>
                    {addedItems.has(product.item_code) ? 'Added' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default SimilarProductDetails;
