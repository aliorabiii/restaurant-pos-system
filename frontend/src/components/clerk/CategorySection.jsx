import React from "react";
import "./CategorySection.css";

const CategorySection = ({
  title,
  categories,
  selectedCategory,
  onCategorySelect,
  type = "main",
}) => {
  if (categories.length === 0) return null;

  return (
    <div className="category-section">
      <h3 className="section-title">{title}</h3>
      <div className={`categories-grid ${type}-categories-grid`}>
        {categories.map((category) => (
          <button
            key={category._id}
            className={`category-card ${type}-category-card ${
              selectedCategory?._id === category._id ? "selected" : ""
            }`}
            onClick={() => onCategorySelect(category)}
          >
            <div className="category-icon">
              {category.name.charAt(0).toUpperCase()}
            </div>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
