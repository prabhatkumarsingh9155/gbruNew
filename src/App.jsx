import React from 'react';
import './App.css';
import { useAppState } from './hooks/useAppState';
import { useMaintenanceMode } from './hooks/useMaintenanceMode';

// Components
import Header from './components/Header/Header';
import MaintenanceMode from './components/MaintenanceMode/MaintenanceMode';
import Home from './components/Home/Home';
import ProductListing from './components/ProductListing/ProductListing';
import ProductDetails from './components/ProductDetails/ProductDetails';
import Cart from './components/Cart/Cart';
import Checkout from './components/Checkout/Checkout';
import PaymentScreen from './components/PaymentScreen/PaymentScreen';
import OrderSuccess from './components/OrderSuccess/OrderSuccess';
import Account from './components/Account/Account';
import SignIn from './components/SignIn/SignIn';
import AddNewAddress from './components/AddNewAddress/AddNewAddress';
import Orders from './components/Orders/Orders';
import ViewCartButton from './components/ViewCartButton/ViewCartButton';
import WhatsAppFloat from './components/WhatsAppFloat/WhatsAppFloat';

import ViewDetails from './components/ViewDetails/ViewDetails';
import Footer from './components/Footer/Footer';

function App() {
  const { isMaintenanceMode, loading: maintenanceLoading } = useMaintenanceMode();
  
  const {
    cart,
    user,
    setUser,
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
    fetchCartCount,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    navigateTo
  } = useAppState();

  // Handle payment callback URL
  React.useEffect(() => {
    const path = window.location.pathname;
    const search = window.location.search;
    
    if (path === '/order-success' && search.includes('status=')) {
      navigateTo('order-success');
    }
  }, []); // Remove navigateTo from dependencies to prevent re-runs

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home products={products} categories={categories} heroSlides={heroSlides} addToCart={addToCart} navigateTo={navigateTo} user={user} selectedCategory={selectedCategory} userDetails={userDetails} fetchCartCount={fetchCartCount} />;
      case 'products':
        return <ProductListing addToCart={addToCart} navigateTo={navigateTo} user={user} selectedCategory={selectedCategory} userDetails={userDetails} fetchCartCount={fetchCartCount} />;
      case 'productDetails':
        return <ProductDetails product={selectedProduct} productDetails={productDetails} addToCart={addToCart} navigateTo={navigateTo} user={user} previousPage={previousPage} userDetails={userDetails} fetchCartCount={fetchCartCount} />;
      case 'product-details':
        return <ProductDetails products={products} addToCart={addToCart} navigateTo={navigateTo} productId={selectedProduct?.id} user={user} userDetails={userDetails} fetchCartCount={fetchCartCount} />;
      case 'cart':
        return <Cart cart={cart} updateQuantity={updateCartQuantity} removeItem={removeFromCart} total={getCartTotal} navigateTo={navigateTo} user={user} userDetails={userDetails} fetchCartCount={fetchCartCount} />;
      case 'checkout':
        return <Checkout cart={cart} total={getCartTotal} clearCart={clearCart} navigateTo={navigateTo} user={user} checkoutData={checkoutData} userDetails={userDetails} />;
      case 'payment':
        return <PaymentScreen navigateTo={navigateTo} />;
      case 'order-success':
        return <OrderSuccess navigateTo={navigateTo} />;
      case 'account':
        return <Account user={user} navigateTo={navigateTo} />;
      case 'addNewAddress':
        return <AddNewAddress navigateTo={navigateTo} userDetails={userDetails} user={user} previousPage={previousPage} />;
      case 'addressManagement':
        return <AddressManagement navigateTo={navigateTo} userDetails={userDetails} />;
      case 'orders':
        return <Orders navigateTo={navigateTo} userDetails={userDetails} />;
      case 'viewDetails':
        return <ViewDetails navigateTo={navigateTo} userDetails={userDetails} orderId={selectedOrderId} />;
      case 'auth':
        // Show the previous page content when auth modal is open
        switch (previousPage) {
          case 'products':
            return <ProductListing addToCart={addToCart} navigateTo={navigateTo} user={user} selectedCategory={selectedCategory} userDetails={userDetails} fetchCartCount={fetchCartCount} />;
          case 'productDetails':
            return <ProductDetails product={selectedProduct} productDetails={productDetails} addToCart={addToCart} navigateTo={navigateTo} user={user} previousPage={previousPage} userDetails={userDetails} fetchCartCount={fetchCartCount} />;
          case 'product-details':
            return <ProductDetails products={products} addToCart={addToCart} navigateTo={navigateTo} productId={selectedProduct?.id} user={user} userDetails={userDetails} fetchCartCount={fetchCartCount} />;
          case 'cart':
            return <Cart cart={cart} updateQuantity={updateCartQuantity} removeItem={removeFromCart} total={getCartTotal} navigateTo={navigateTo} user={user} userDetails={userDetails} fetchCartCount={fetchCartCount} />;
          case 'checkout':
            return <Checkout cart={cart} total={getCartTotal} clearCart={clearCart} navigateTo={navigateTo} user={user} checkoutData={checkoutData} userDetails={userDetails} />;
          default:
            return <Home products={products} categories={categories} heroSlides={heroSlides} addToCart={addToCart} navigateTo={navigateTo} user={user} selectedCategory={selectedCategory} userDetails={userDetails} fetchCartCount={fetchCartCount} />;
        }
      default:
        return <Home products={products} categories={categories} heroSlides={heroSlides} addToCart={addToCart} navigateTo={navigateTo} user={user} selectedCategory={selectedCategory} userDetails={userDetails} fetchCartCount={fetchCartCount} />;
    }
  };

  // Show loading screen while checking maintenance mode
  if (maintenanceLoading) {
    return (
      <div className="App">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1.2rem',
          color: '#666'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  // Show maintenance mode if active
  if (isMaintenanceMode) {
    return <MaintenanceMode />;
  }

  return (
    <div className="App">
      <Header 
        cartItemsCount={getCartItemsCount()} 
        user={user}
        userDetails={userDetails}
        navigateTo={navigateTo}
      />
      
      <main className="main-content">
        {renderPage()}
      </main>

      {currentPage !== 'cart' && currentPage !== 'checkout' && currentPage !== 'account' && currentPage !== 'products' && currentPage !== 'productDetails' && currentPage !== 'product-details' && currentPage !== 'addNewAddress' && currentPage !== 'orders' && currentPage !== 'viewDetails' && currentPage !== 'payment' && currentPage !== 'order-success' && <Footer navigateTo={navigateTo} />}
      
      {currentPage === 'auth' && <SignIn setUser={setUser} navigateTo={navigateTo} />}
      
      {currentPage !== 'cart' && currentPage !== 'checkout' && currentPage !== 'payment' && currentPage !== 'order-success' && (currentPage === 'home' || currentPage === 'productDetails' || currentPage === 'products') && (
        <>
          <ViewCartButton userDetails={userDetails} currentPage={currentPage} onViewCart={() => navigateTo('cart')} />
          <WhatsAppFloat />
        </>
      )}
    </div>
  );
}

export default App;