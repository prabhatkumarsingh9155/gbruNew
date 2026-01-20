import { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/apiConfig';

export const useShoppingCart = (userDetails) => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  const fetchCart = async () => {
    if (!userDetails?.token) return;
    
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
        setCart(data.message.data.items || []);
        setCartCount(data.message.data.items?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const fetchCartCount = async () => {
    if (!userDetails?.token) return;
    
    try {
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.cart.cart.get_cart_count`, {
        method: 'GET',
        headers: {
          'Authorization': userDetails.token,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (response.ok && data.message && data.message.status) {
        setCartCount(data.message.data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem('cart');
      }
    }
  }, []);

  useEffect(() => {
    if (userDetails?.token) {
      fetchCart();
      fetchCartCount();
      const interval = setInterval(() => {
        fetchCart();
        fetchCartCount();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [userDetails]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
    setCartCount(prev => prev + quantity);
  };

  const updateCartQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    if (userDetails?.token) {
      return cartCount;
    }
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    cart,
    cartCount,
    fetchCart,
    fetchCartCount,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount
  };
};
