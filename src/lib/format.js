export const currency = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);

export const whatsappLink = (number, message) =>
  `https://wa.me/${(number || "").replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

