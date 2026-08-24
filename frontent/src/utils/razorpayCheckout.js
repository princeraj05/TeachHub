import axios from "axios";

const loadCheckout = () => new Promise((resolve, reject) => {
  if (window.Razorpay) return resolve();
  const script = document.createElement("script"); script.src = "https://checkout.razorpay.com/v1/checkout.js"; script.async = true;
  script.onload = resolve; script.onerror = () => reject(new Error("Could not load secure payment checkout")); document.body.appendChild(script);
});

// No amount, purpose, school, payer, or receiver is accepted here. Those are exclusively backend-derived.
export async function startBackendPayment({ apiBase, token, createOrderEndpoint, customer }) {
  const headers = { Authorization: `Bearer ${token}` };
  const { data: order } = await axios.post(`${apiBase}${createOrderEndpoint}`, {}, { headers });
  await loadCheckout();
  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: order.razorpayKeyId,
      order_id: order.razorpayOrderId,
      amount: order.amount,
      currency: order.currency,
      name: "TeachHub",
      prefill: { name: customer?.name || "", email: customer?.email || "" },
      handler: async response => {
        try {
          const verified = await axios.post(`${apiBase}/api/payments/verify-checkout`, response, { headers });
          resolve(verified.data); // Display only this backend-confirmed status.
        } catch (error) { reject(error); }
      },
      modal: { ondismiss: () => reject(new Error("Payment checkout was cancelled")) }
    });
    checkout.open();
  });
}
