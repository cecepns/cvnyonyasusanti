/* eslint-disable react/prop-types */
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "../../lib/format";

export default function WhatsAppButton({ number }) {
  return (
    <div className="fixed bottom-6 right-6">
      <span
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 size-[4.25rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/45 animate-pulse"
        aria-hidden
      />
      <a
        href={whatsappLink(number, "Halo admin, saya ingin tanya produk")}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat WhatsApp"
        className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full bg-green-500 text-white shadow-xl transition hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
      >
        <MessageCircle size={22} aria-hidden />
      </a>
    </div>
  );
}

