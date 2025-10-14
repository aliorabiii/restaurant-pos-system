import './ProductCard.css';

const ProductCard = ({ product, onClick }) => {
  return (
    <div className="product-card" onClick={onClick}>
      <div className="product-image">
        <span className="product-emoji">
          {product.category === 'Sandwich' && '🍔'}
          {product.category === 'Pizza' && '🍕'}
          {product.category === 'Drinks' && '🥤'}
          {product.category === 'Sides' && '🍟'}
          {product.category === 'Desserts' && '🍰'}
        </span>
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-price">${product.price.toFixed(2)}</div>
      </div>
      <button className="select-btn">Select</button>
    </div>
  );
};

export default ProductCard;