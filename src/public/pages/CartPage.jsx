/* eslint-disable react/prop-types */
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { currency, whatsappLink } from "../../lib/format";

export default function CartPage({ cart, setCart, settings }) {
  const total = useMemo(
    () => cart.reduce((acc, item) => acc + Number(item.price || 0) * item.qty, 0),
    [cart]
  );
  const waMessage = cart
    .map((i) => `- ${i.name} (${i.qty}x) = ${currency(i.price * i.qty)}`)
    .join("\n");

  if (cart.length === 0) {
    return (
      <div className="container-app max-w-5xl py-12 text-center">
        <h1 className="section-title">Keranjang</h1>
        <p className="mt-4 text-slate-600">Keranjang masih kosong.</p>
        <Link to="/products" className="btn-primary mt-6 inline-block px-6 py-3">
          Lihat produk
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app max-w-5xl py-8">
      <h1 className="section-title">Keranjang</h1>
      <div className="space-y-3">
        {cart.map((item) => (
          <div
            key={item.id}
            className="card-clean flex flex-wrap items-center justify-between gap-3 p-4 sm:flex-nowrap"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-slate-500">{currency(item.price)}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg border px-3 py-1"
                  onClick={() =>
                    setCart((prev) =>
                      prev.map((x) =>
                        x.id === item.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x
                      )
                    )
                  }
                >
                  -
                </button>
                <span className="min-w-6 text-center tabular-nums">{item.qty}</span>
                <button
                  type="button"
                  className="rounded-lg border px-3 py-1"
                  onClick={() =>
                    setCart((prev) =>
                      prev.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x))
                    )
                  }
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                aria-label={`Hapus ${item.name} dari keranjang`}
                onClick={() => setCart((prev) => prev.filter((x) => x.id !== item.id))}
              >
                <Trash2 size={18} aria-hidden />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm">
        <p className="font-semibold">Total: {currency(total)}</p>
        <a
          className="btn-primary"
          href={whatsappLink(
            settings?.whatsapp,
            `Halo, checkout keranjang:\n${waMessage}\n\nTotal: ${currency(total)}`
          )}
          target="_blank"
          rel="noreferrer"
        >
          Checkout via WhatsApp
        </a>
      </div>
    </div>
  );
}

