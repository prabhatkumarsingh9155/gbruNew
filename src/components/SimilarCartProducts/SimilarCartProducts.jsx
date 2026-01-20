import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../../config/apiConfig';
import './SimilarCartProducts.css';

const SimilarCartProducts = ({ cartItems, user, userDetails, navigateTo, fetchCartCount, onCartUpdate, setCartItems, setApiTotal }) => {
  const [productsByCategory, setProductsByCategory] = useState([]);

  useEffect(() => {
    if (cartItems.length > 0) {
      fetchSimilarProducts();
    }
  }, [cartItems]);

  const fetchSimilarProducts = async () => {
    if (!user || !userDetails?.token || cartItems.length === 0) return;
    
    const allProducts = [];
    const processedCategories = new Set();
    
    for (const cartItem of cartItems) {
      try {
        const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.erp_api.get_similar_items.get_similar_items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': API_CONFIG.API_KEY,
            'X-API-SECRET': API_CONFIG.API_SECRET
          },
          body: JSON.stringify({
            page: 1,
            page_size: 8,
            mobile_no: user.phone,
            item_code: cartItem.item_code
          })
        });
        
        const data = await response.json();
        if (data.message?.status && data.message.data?.data) {
          const categoryName = data.message.data.generic_name || 'Similar Products';
          
          if (processedCategories.has(categoryName)) continue;
          processedCategories.add(categoryName);
          
          const products = data.message.data.data
            .filter(item => !cartItems.some(cartItem => cartItem.item_code === item.item_code))
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
          
          if (products.length > 0) {
            allProducts.push({
              categoryName: categoryName,
              products: products
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching similar items:`, error);
      }
    }
    
    setProductsByCategory(allProducts);
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
        setProductsByCategory(prev => 
          prev.map(category => ({
            ...category,
            products: category.products.filter(p => p.item_code !== product.item_code)
          })).filter(category => category.products.length > 0)
        );
        
        if (setCartItems) {
          const newCartItem = {
            id: product.item_code,
            item_code: product.item_code,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
            amount: product.price,
            discount: product.discount || 0,
            originalPrice: product.originalPrice,
            rating: 4.5,
            reviews: 100,
            category: product.category
          };
          setCartItems(prev => [...prev, newCartItem]);
          
          if (setApiTotal) {
            setApiTotal(prev => prev + product.price);
          }
        }
        
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

  if (productsByCategory.length === 0) return null;

  return (
    <div className="container similar-products-container">
      <div className="similar-products-section">
        <h2>You May Also Like</h2>
        {productsByCategory.map((categoryData, index) => (
          <div key={index} className="category-section">
            {/* <h3 className="category-title">{categoryData.categoryName}</h3> */}
            <div className="products-scroll-container">
              <div className="products-scroll">
                {categoryData.products.map(product => (
                  <div key={product.id} className="similar-product-card">
                    <img src={product.image} alt={product.name} onClick={() => handleViewDetails(product)} style={{cursor: 'pointer'}} />
                    <h4 onClick={() => handleViewDetails(product)} style={{cursor: 'pointer'}}>{product.name}</h4>
                    <div className="product-price">
                      <span className="current-price">₹{product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="original-price">₹{product.originalPrice}</span>
                      )}
                    </div>
                    {product.discount > 0 && (
                      <div className="discount-badge">You Save ₹{(product.originalPrice - product.price).toFixed(0)} ({product.discount}%)</div>
                    )}
                    <button className="add-to-cart-btn" onClick={() => handleAddToCart(product)}>
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarCartProducts;
