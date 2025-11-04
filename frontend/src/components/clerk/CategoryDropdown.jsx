// frontend/src/components/clerk/CategoryDropdown.jsx
import React from "react";
import "./CategoryDropdown.css";

const CategoryDropdown = ({
  title,
  categories,
  selectedCategory,
  onCategorySelect,
  placeholder = "Select category",
  disabled = false,
}) => {
  return (
    <div className="category-dropdown">
      <label className="dropdown-label">{title}</label>
      <select
        className={`dropdown-select ${
          disabled ? "dropdown-select--disabled" : ""
        }`}
        value={selectedCategory?._id || ""}
        onChange={(e) => {
          if (e.target.value === "") {
            onCategorySelect(null);
          } else {
            const category = categories.find(
              (cat) => cat._id === e.target.value
            );
            onCategorySelect(category);
          }
        }}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryDropdown;
