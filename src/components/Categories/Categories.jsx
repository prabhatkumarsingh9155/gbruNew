import React from 'react';
import './Categories.css';

const Categories = ({ categories, navigateTo, onCategorySelect, selectedCategory }) => {
  const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'];
  
  if (!categories || categories.length === 0) {
    return (
      <section className="categories-section-ct">
        <div className="container-ct">
          <div className="section-header-ct">
            <h2 className="section-title-ct">Category</h2>
          </div>
          <div className="categories-loading-ct">
            <p>Loading categories...</p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="categories-section-ct">
      <div className="container-ct">
        <div className="section-header-ct">
          <h2 className="section-title-ct">Category</h2>
        </div>
        <div className="categories-grid-ct" style={{ marginTop: '0.5rem' }}>
          {categories.map((category, index) => (
            <div key={category.id || index} className="category-item-ct">
              <button
                className={`category-card-ct ${selectedCategory === (category.subcategory_name || category.name) ? 'active' : ''}`}
                style={{ 
                  '--category-color': category.color || colors[index % colors.length],
                  backgroundImage: category.image ? `url(${category.image})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
                onClick={() => {
                  const categoryName = category.subcategory_name || category.name;
                  if (onCategorySelect) {
                    onCategorySelect(categoryName);
                  }
                  navigateTo('home', null, categoryName);
                }}
              >
                {category.image && <div className="category-overlay-ct"></div>}
              </button>
              <h3 className="category-name-ct">{category.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;