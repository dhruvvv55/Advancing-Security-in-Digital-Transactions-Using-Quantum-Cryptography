import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";
import "../styles/style.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const isValidMobile = (mobile) => /^[6-9]\d{9}$/.test(mobile);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!name.trim() || !email.trim() || !mobileNumber.trim() || !password || !confirmPassword) {
      setError("All fields are required!");
      setLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      setError("Invalid email format!");
      setLoading(false);
      return;
    }

    if (!isValidMobile(mobileNumber)) {
      setError("Invalid mobile number! Enter a 10-digit valid number.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long!");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    const userData = {
      name: name.trim(),
      email: email.trim(),
      mobile_number: mobileNumber.trim(),
      password: password,
    };

    console.log("Register Payload:", JSON.stringify(userData, null, 2)); // Log the payload

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log("Server Response:", data); // Log the response

      if (response.ok) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        if (data.detail) {
          setError(Array.isArray(data.detail) ? data.detail[0].msg : data.detail);
        } else {
          setError("Registration failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error registering:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Register</h2>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            className="register-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="register-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Mobile Number"
            className="register-input"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="register-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="register-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;