const API_BASE_URL = "http://127.0.0.1:8000";  // Correct API Base URL // ✅ FastAPI Backend URL

export const OTP_SEND_API = `${API_BASE_URL}/otp/send`; // ✅ API to send OTP
export const OTP_VERIFY_API = `${API_BASE_URL}/otp/verify`; // ✅ API to verify OTP
export const PAYMENT_PROCESS_API = `${API_BASE_URL}/payments/process`; // ✅ API to process payment

export default API_BASE_URL;
