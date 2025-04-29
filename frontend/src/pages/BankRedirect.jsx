import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/style.css";

const BankRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactionId, mobileNumber } = location.state || {};

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate("/otp-verification", {
        state: { transactionId, mobileNumber },
      });
    }, 4000); // simulate 4-second redirect delay

    return () => clearTimeout(timeout);
  }, [navigate, transactionId, mobileNumber]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
      <h2 className="text-2xl font-bold mb-4">Redirecting to your Bank...</h2>
      <div className="w-16 h-16 border-4 border-blue-400 border-dashed rounded-full animate-spin mt-4"></div>
    </div>
  );
};

export default BankRedirect;
