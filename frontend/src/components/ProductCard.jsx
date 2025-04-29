import PropTypes from "prop-types";
import "../styles/style.css";

const ProductCard = ({ product, addToCart }) => {
  return (
    <div className="product-card">
      <h2>{product.name}</h2>
      <p>₹{product.price}</p> {/* ✅ Changed "$" to "₹" */}
      <button onClick={() => addToCart(product)} className="button">Add to Cart</button>
    </div>
  );
};

// ✅ Add PropTypes Validation
ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
  addToCart: PropTypes.func.isRequired,
};

export default ProductCard;
