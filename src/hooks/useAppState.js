import { useState, useEffect } from 'react';
import { useUserAuthentication } from './useUserAuthentication';
import { useShoppingCart } from './useShoppingCart';
import { useProductsCatalog } from './useProductsCatalog';
import { useProductCategories } from './useProductCategories';

export const useAppState = () => {
  const { user, setUser, userDetails, logout } = useUserAuthentication();
  const { cart, cartCount, fetchCart, fetchCartCount, addToCart, updateCartQuantity, removeFromCart, clearCart, getCartTotal, getCartItemsCount } = useShoppingCart(userDetails);
  const { products, setProducts, heroSlides, fetchProductsByCategory } = useProductsCatalog(user);
  const { categories, selectedCategory, setSelectedCategory } = useProductCategories(user);
  
  const [currentPage, setCurrentPage] = useState('home');
  const [previousPage, setPreviousPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event) => {
      if (currentPage !== 'home') {
        event.preventDefault();
        navigateTo(previousPage || 'home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Push initial state
    if (window.history.state === null) {
      window.history.pushState({ page: 'home' }, '', window.location.href);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentPage, previousPage]);

  const navigateTo = (page, data = null, categoryName = null, source = null) => {
    // Clear URL parameters when navigating away from order-success
    if (currentPage === 'order-success' && page !== 'order-success') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Store previous page when navigating to productDetails, auth, or addNewAddress
    if (page === 'productDetails' || page === 'auth' || page === 'addNewAddress') {
      setPreviousPage(currentPage);
    }
    
    // Push state to browser history (except when going back)
    if (page !== previousPage) {
      window.history.pushState({ page }, '', window.location.href);
    }
    
    setCurrentPage(page);
    
    // Handle productDetails navigation with API data
    if (page === 'productDetails' && data) {
      setSelectedProduct(data.product);
      setProductDetails(data.details);
    } else if (page === 'checkout' && data) {
      setCheckoutData(data);
    } else if (page === 'viewDetails' && data) {
      setSelectedOrderId(data);
    } else if (page === 'addNewAddress' && data) {
      setEditingAddress(data);
    } else if (data) {
      setSelectedProduct(products.find(p => p.id === parseInt(data)));
    }
    
    if (categoryName) {
      setSelectedCategory(categoryName);
      // Fetch products for this category if user is logged in
      if (user && user.phone) {
        fetchProductsByCategory(categoryName, user.phone);
      }
    }
    // Handle bestsellers source
    if (source === 'bestsellers') {
      // Set a flag or state to indicate we're showing bestsellers
      setSelectedCategory('bestsellers');
    }
    // Reset selectedCategory when navigating back to home from bestsellers
    if (page === 'home' && selectedCategory === 'bestsellers') {
      setSelectedCategory(null);
    }
    // Don't reset selectedCategory when navigating back to home
  };

  return {
    cart,
    user,
    setUser,
    logout,
    products,
    categories,
    heroSlides,
    currentPage,
    previousPage,
    selectedProduct,
    productDetails,
    selectedCategory,
    selectedOrderId,
    userDetails,
    cartCount,
    checkoutData,
    editingAddress,
    fetchCartCount,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    navigateTo
  };
};