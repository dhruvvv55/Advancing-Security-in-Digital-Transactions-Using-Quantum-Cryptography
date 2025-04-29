import API_BASE_URL from "../config";

const FALLBACK_BANKS = [
  { id: "hdfc", name: "HDFC Bank" },
  { id: "icici", name: "ICICI Bank" },
  { id: "sbi", name: "State Bank of India" },
  { id: "axis", name: "Axis Bank" },
  { id: "kotak", name: "Kotak Mahindra Bank" },
];

export const fetchBanks = async () => {
  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const response = await fetch(`${API_BASE_URL}/banks/list`);

      if (!response.ok) {
        throw new Error(`Failed to fetch banks. Status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      attempt++;
      console.error(`Attempt ${attempt}: Error fetching banks -`, err.message);

      if (attempt >= MAX_RETRIES) {
        console.warn("Using fallback bank list due to API failure.");
        return FALLBACK_BANKS;
      }
    }
  }
};

// ✅ Fetch Registered Mobile Number for OTP
export const fetchMobileNumber = async (cardNumber, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/card/get-mobile-number`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ card_number: cardNumber }),
    });

    const data = await response.json(); // ✅ Ensure we parse JSON before checking the response

    if (!response.ok) {
      console.error("Failed to fetch mobile number:", data);
      return null;
    }

    return data.mobile_number;
  } catch (error) {
    console.error("Error fetching mobile number:", error);
    return null;
  }
};

// ✅ Process Payment Function
export const processPayment = async (paymentDetails, token) => {
  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const payload = {
        amount: Number(paymentDetails.amount) || 0,
        payment_method: paymentDetails.payment_method || "",
        status: "Pending",
        card_number: paymentDetails.card_number ? String(paymentDetails.card_number) : "",
        upi_id: paymentDetails.upi_id ? String(paymentDetails.upi_id) : "",
        bank_code: paymentDetails.bank_code ? String(paymentDetails.bank_code) : "",
      };

      console.log("Sending Payment Request:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_BASE_URL}/transactions/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 404) {
        throw new Error("Endpoint not found. Check API route configuration.");
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Response is not valid JSON:", parseError);
        throw new Error("Invalid server response");
      }

      console.log("Received Response:", data);

      if (!response.ok) {
        console.error("Payment Failed:", data);

        if (response.status === 422) {
          throw new Error(`Validation Error: ${JSON.stringify(data, null, 2)}`);
        }

        throw new Error(data.detail || "Payment failed");
      }

      return data;
    } catch (processError) {
      attempt++;
      console.error(`Attempt ${attempt}: Error processing payment -`, processError.message);

      if (attempt >= MAX_RETRIES) {
        return { error: "Payment failed after multiple attempts", details: processError.message };
      }
    }
  }
};
