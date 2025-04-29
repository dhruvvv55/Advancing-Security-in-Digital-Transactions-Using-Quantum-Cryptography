import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Payment from "./pages/Payment";
import OTPVerification from "./pages/OTPVerification";
import UPIProcessing from "./pages/UPIProcessing";
import NetBankingProcessing from "./pages/NetBankingProcessing";
import Success from "./pages/Success";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BankRedirect from "./pages/BankRedirect"; // ✅ Import the new BankRedirect page

const App = () => {
  const [cart, setCart] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, []);

  return (
    <Router>
      <Navbar setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path="/" element={<Home cart={cart} setCart={setCart} />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/cart"
          element={isAuthenticated ? <Cart cart={cart} setCart={setCart} /> : <Navigate to="/login" />}
        />
        <Route
          path="/payment"
          element={isAuthenticated ? <Payment cart={cart} /> : <Navigate to="/login" />}
        />
        <Route
          path="/upi-processing"
          element={isAuthenticated ? <UPIProcessing /> : <Navigate to="/login" />}
        />
        <Route
          path="/netbanking-processing"
          element={isAuthenticated ? <NetBankingProcessing /> : <Navigate to="/login" />}
        />
        <Route
          path="/otp-verification"
          element={isAuthenticated ? <OTPVerification /> : <Navigate to="/login" />}
        />
        <Route
          path="/success"
          element={isAuthenticated ? <Success setCart={setCart} /> : <Navigate to="/login" />}
        />
        <Route
          path="/bank-redirect"
          element={isAuthenticated ? <BankRedirect /> : <Navigate to="/login" />} // ✅ New route
        />
      </Routes>
    </Router>
  );
};

export default App;
