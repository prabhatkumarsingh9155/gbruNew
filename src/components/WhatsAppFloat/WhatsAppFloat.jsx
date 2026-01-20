import React, { useState, useEffect } from 'react';
import './WhatsAppFloat.css';

const WhatsAppFloat = () => {
  const [isStickyVisible, setIsStickyVisible] = useState(false);

  useEffect(() => {
    const handleStickyBarVisible = (e) => {
      setIsStickyVisible(e.detail.visible);
    };

    window.addEventListener('stickyBarVisible', handleStickyBarVisible);

    return () => {
      window.removeEventListener('stickyBarVisible', handleStickyBarVisible);
    };
  }, []);
  const handleWhatsAppClick = () => {
    const message = `Hi, I checked on your website about your products. I need more information.`;
    const whatsappUrl = `https://wa.me/919225094932?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className={`whatsapp-float ${isStickyVisible ? 'sticky-visible' : ''}`} onClick={handleWhatsAppClick}>
      <svg viewBox="0 0 32 32" className="whatsapp-icon">
        <path fill="currentColor" d="M16 0c-8.837 0-16 7.163-16 16 0 2.825 0.737 5.607 2.137 8.048l-2.137 7.952 7.933-2.127c2.42 1.37 5.173 2.127 8.067 2.127 8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 29.467c-2.482 0-4.908-0.646-7.07-1.87l-0.507-0.292-4.713 1.262 1.262-4.669-0.292-0.508c-1.207-2.100-1.847-4.507-1.847-6.924 0-7.435 6.050-13.485 13.485-13.485s13.485 6.050 13.485 13.485c0 7.435-6.050 13.485-13.485 13.485zM21.960 18.828c-0.28-0.14-1.657-0.817-1.913-0.911s-0.443-0.14-0.63 0.14c-0.187 0.28-0.723 0.911-0.887 1.099s-0.327 0.21-0.607 0.070c-0.28-0.14-1.183-0.436-2.253-1.39-0.833-0.743-1.395-1.66-1.558-1.940s-0.017-0.431 0.123-0.571c0.126-0.126 0.28-0.327 0.42-0.491s0.187-0.28 0.28-0.467c0.093-0.187 0.047-0.35-0.023-0.491s-0.63-1.519-0.863-2.079c-0.227-0.547-0.458-0.473-0.63-0.481-0.163-0.008-0.35-0.010-0.537-0.010s-0.49 0.070-0.747 0.35c-0.257 0.28-0.98 0.958-0.98 2.337s1.003 2.711 1.143 2.898c0.14 0.187 1.978 3.020 4.792 4.237 0.67 0.289 1.193 0.462 1.601 0.592 0.673 0.214 1.286 0.184 1.77 0.112 0.54-0.081 1.657-0.677 1.890-1.331s0.233-1.215 0.163-1.331c-0.070-0.117-0.257-0.187-0.537-0.327z"></path>
      </svg>
    </div>
  );
};

export default WhatsAppFloat;
