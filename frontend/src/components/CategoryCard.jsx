import './CategoryCard.css';

const CategoryCard = ({ category, onClick, isActive }) => {
  const categoryIcons = {
    Sandwich: '🍔',
    Pizza: '🍕',
    Drinks: '🥤',
    Sides: '🍟',
    Desserts: '🍰'
  };

  return (
    <div 
      className={`category-card ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="category-icon">{categoryIcons[category]}</div>
      <div className="category-name">{category}</div>
    </div>
  );
};

export default CategoryCard;