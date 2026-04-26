export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
  stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY ?? "",
};
