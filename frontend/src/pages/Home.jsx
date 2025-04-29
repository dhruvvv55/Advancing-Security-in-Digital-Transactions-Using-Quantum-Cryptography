import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "../styles/style.css";

// Import product images from src/assets
import amazonEchoImg from "../assets/amazonecho.jpeg";
import kindleImg from "../assets/kindle.jpeg";
import firestickImg from "../assets/firestick.jpeg";
import nikeImg from "../assets/nike.jpeg";
import ringImg from "../assets/ring.jpeg";
import smartplugImg from "../assets/smartplug.jpeg";

// Define products array with image property
const products = [
  { id: 1, name: "Amazon Echo Dot (5th Gen)", price: 4499, image: amazonEchoImg },
  { id: 2, name: "Fire TV Stick 4K with Alexa Voice Remote", price: 5999, image: firestickImg },
  { id: 3, name: "Amazon Kindle Paperwhite", price: 999, image: kindleImg },
  { id: 4, name: "Amazon Smart Plug", price: 799, image: smartplugImg },
  { id: 5, name: "Ring Video Doorbell", price: 5999, image: ringImg },
  { id: 6, name: "Nike Jordan", price: 5999, image: nikeImg }
];

const Home = ({ cart, setCart }) => {
  // Add or increment quantity
  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      const updatedCart = cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Decrement quantity or remove if quantity becomes zero
  const removeFromCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity > 1) {
        const updatedCart = cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
        setCart(updatedCart);
      } else {
        setCart(cart.filter((item) => item.id !== product.id));
      }
    }
  };
  
  

  return (
    <div className="container">
      <h1>Products</h1>

      <div className="products">
        {products.map((product) => {
          // Check if product is in cart
          const cartItem = cart.find((item) => item.id === product.id);

          return (
            <div className="product-card" key={product.id}>
              {/* Display product image */}
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />

              <h2>{product.name}</h2>
              <p>₹{product.price}</p>

              {cartItem ? (
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button className="button" onClick={() => removeFromCart(product)}>-</button>
                  <span>{cartItem.quantity}</span>
                  <button className="button" onClick={() => addToCart(product)}>+</button>
                </div>
              ) : (
                <button className="button" onClick={() => addToCart(product)}>Add to Cart</button>
              )}
            </div>
          );
        })}
      </div>

      <Link to="/cart" className="button">
        Go to Cart
      </Link>
    </div>
  );
};

Home.propTypes = {
  cart: PropTypes.array.isRequired,
  setCart: PropTypes.func.isRequired,
};

export default Home;
