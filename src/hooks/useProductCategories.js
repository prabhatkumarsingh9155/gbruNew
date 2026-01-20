import { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/apiConfig';

export const useProductCategories = (user) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(() => {
    try {
      const savedCategory = localStorage.getItem('selectedCategory');
      return savedCategory || null;
    } catch {
      return null;
    }
  });

  const FILTER_CATEGORIES = true;

  const fetchCategoriesFromAPI = async () => {
    try {
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.erp_api.subcategory_api.get_brand_subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_CONFIG.API_KEY,
          'X-API-SECRET': API_CONFIG.API_SECRET
        },
        body: JSON.stringify({ page: 1, page_size: 200, brand_id: 'Gbru' })
      });
      const data = await response.json();
      if (data && data.message && data.message.data && data.message.data.data) {
        let apiCategories;
        
        if (FILTER_CATEGORIES) {
          const allowedSubcategories = [
           'Seed Drill', 'Flat Submersible Cable', 'Aluminium Service Cable', 
          ];
          
          apiCategories = data.message.data.data
            .filter(category => allowedSubcategories.includes(category.sub_cat_id))
            .map(category => ({
              id: category.sub_cat_id,
              name: category.subcategory_name,
              image: category.image,
              category: category.category
            }));
        } else {
          apiCategories = data.message.data.data.map(category => ({
            id: category.sub_cat_id,
            name: category.subcategory_name,
            image: category.image,
            category: category.category
          }));
        }
        
        setCategories(apiCategories);
        
        if (!selectedCategory && apiCategories.length > 0) {
          setSelectedCategory(apiCategories[0].name);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      localStorage.setItem('selectedCategory', selectedCategory);
    } else {
      localStorage.removeItem('selectedCategory');
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (user) {
      fetchCategoriesFromAPI();
    } else {
      // Show dummy categories when no user is logged in
      setCategories([
        { id: 'electronics', name: 'Electronics', subcategory_name: 'Electronics', color: '#10b981', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop' },
        { id: 'solar', name: 'Solar', subcategory_name: 'Solar', color: '#f59e0b', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&h=200&fit=crop' },
        { id: 'tools', name: 'Tools', subcategory_name: 'Tools', color: '#3b82f6', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300&h=200&fit=crop' },
        { id: 'hardware', name: 'Hardware', subcategory_name: 'Hardware', color: '#ef4444', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop' }
      ]);
    }
  }, [user]); // Fetch categories for all users, not dependent on user login

  return {
    categories,
    selectedCategory,
    setSelectedCategory
  };
};
