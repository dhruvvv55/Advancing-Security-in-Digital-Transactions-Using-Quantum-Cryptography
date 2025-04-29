import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import ReCAPTCHA from "react-google-recaptcha";
import "../styles/style.css";

// Import local icon assets
import googleIcon from "../assets/google.png";
import appleIcon from "../assets/apple.png";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const Login = ({ setIsAuthenticated }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [passwordShown, setPasswordShown] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/icon?family=Material+Symbols+Rounded";
    document.head.appendChild(link);
  }, []);

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      if (!identifier.trim()) {
        setError("Please enter an email or mobile number.");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }
      if (!captchaValue) {
        setError("Please verify that you are not a robot.");
        setLoading(false);
        return;
      }

      const payload = {
        identifier: identifier.trim(),
        password: password,
        captcha: captchaValue, // Include the captcha value in the payload
      };

      console.log("Sending Login Request:", JSON.stringify(payload, null, 2));

      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log("Received Response:", data);

        if (response.ok) {
          console.log("Login successful:", data);
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("identifier", identifier.trim());
          setIsAuthenticated(true);
          navigate("/cart");
        } else {
          console.error("Login failed:", data);
          setError(data.detail || "Invalid credentials.");
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Error logging in:", error);
        setError("Something went wrong. Please try again.");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    },
    [identifier, password, navigate, setIsAuthenticated, captchaValue]
  );

  const onCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  const togglePasswordVisibility = () => {
    setPasswordShown((prev) => !prev);
  };

  return (
    <div className="login-container">
      {/* Display any error message */}
      {error && (
        <p style={{ color: "red", textAlign: "center", marginBottom: "0.5rem" }}>
          {error}
        </p>
      )}

      <h2 className="form-title">Log in with</h2>

      {/* Social login buttons */}
      <div className="social-login">
        <button type="button" className="social-button">
          <img src={googleIcon} alt="Google" className="social-icon" />
          Google
        </button>
        <button type="button" className="social-button">
          <img src={appleIcon} alt="Apple" className="social-icon" />
          Apple
        </button>
      </div>

      <div className="separator">
        <span>or</span>
      </div>

      <form onSubmit={handleLogin} className="login-form">
        {/* Email Field */}
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Email address"
            className="input-field"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          {/* Icon on the left */}
          <i className="material-symbols-rounded">mail</i>
        </div>

        {/* Password Field with Show/Hide */}
        <div className="input-wrapper">
          <input
            type={passwordShown ? "text" : "password"}
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {/* Lock icon on the left */}
          <i className="material-symbols-rounded">lock</i>
          {/* Eye icon on the right (toggles password visibility) */}
          <i
            onClick={togglePasswordVisibility}
            className="material-symbols-rounded eye-icon"
          >
            {passwordShown ? "visibility" : "visibility_off"}
          </i>
        </div>

        {/* Forgot Password Link */}
        <a href="#" className="forgot-password-link">
          Forgot password?
        </a>

        {/* reCAPTCHA */}
        <ReCAPTCHA
          sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
          onChange={onCaptchaChange}
          style={{ marginTop: "1rem" }}
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="login-button"
          disabled={loading || !captchaValue}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      {/* Sign Up Prompt */}
      <p className="signup-prompt">
        Don&apos;t have an account?{" "}
        <a href="/register" className="signup-link">
          Sign up
        </a>
      </p>
    </div>
  );
};

Login.propTypes = {
  setIsAuthenticated: PropTypes.func.isRequired,
};

export default Login;
