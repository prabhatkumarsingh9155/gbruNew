import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../../config/apiConfig';
import './TrustGallery.css';

const TrustGallery = ({ user }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [trustImages, setTrustImages] = useState([
    {
      image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=300&h=200&fit=crop",
      title: "Happy Customers",
      description: "Satisfied customers worldwide"
    },
    {
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop",
      title: "Partner Farmers",
      description: "Working with local farmers"
    },
    {
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=200&fit=crop",
      title: "Quality Team",
      description: "Ensuring product quality"
    }
  ]);

  // API configuration
  const API_KEY = API_CONFIG.API_KEY;
  const API_SECRET = API_CONFIG.API_SECRET;

  // Fetch trust gallery images from API when user is logged in
  const fetchTrustImages = async () => {
    try {
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.erp_api.banner.banner_home_bottom_api.get_home_banner_bottom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
          'X-API-SECRET': API_SECRET
        },
        body: JSON.stringify({ page: 1, page_size: 20 })
      });
      
      const data = await response.json();
      
      if (response.ok && data.message && data.message.status && data.message.data && data.message.data.data) {
        const apiImages = data.message.data.data.map((item, index) => ({
          image: item.image_path,
          title: `Partner ${index + 1}`,
          description: "Trusted quality partner"
        }));
        setTrustImages(apiImages);
      }
    } catch (error) {
      console.error('Error fetching trust images:', error);
    }
  };

  // Fetch images when user login status changes
  useEffect(() => {
    if (user) {
      fetchTrustImages();
    } else {
      setTrustImages([
        {
          image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=300&h=200&fit=crop",
          title: "Happy Customers",
          description: "Satisfied customers worldwide"
        },
        {
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop",
          title: "Partner Farmers",
          description: "Working with local farmers"
        },
        {
          image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=200&fit=crop",
          title: "Quality Team",
          description: "Ensuring product quality"
        }
      ]);
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % trustImages.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [trustImages]);

  return (
    <section className="trust-gallery-section">
      <div className="container">
        <div className="gallery-header">
          <h2 className="gallery-title">Trusted Partners</h2>
          <p className="gallery-subtitle">Meet the people behind our quality products</p>
        </div>
        
        <div className="gallery-carousel">
          {trustImages.map((item, index) => (
            <div 
              key={index} 
              className={`gallery-slide ${index === currentSlide ? 'active' : ''}`}
            >
              <div className="gallery-image">
                <img src={item.image} alt={item.title} />
                <div className="gallery-overlay">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            </div>
          ))}
          
          <div className="gallery-indicators">
            {trustImages.map((_, index) => (
              <button
                key={index}
                className={`gallery-indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
        
        <div className="trust-stats">
          <div className="stat-item">
            <span className="stat-number">10K+</span>
            <span className="stat-label">Happy Customers</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">Partner Farmers</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">99%</span>
            <span className="stat-label">Quality Assured</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustGallery;