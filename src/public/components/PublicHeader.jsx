/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, ShoppingCart, X } from "lucide-react";

export default function PublicHeader({ settings, cart = [] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const cartCount = cart.reduce((sum, item) => sum + (item.qty || 0), 0);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const cartLabel = cartCount > 0 ? `Keranjang, ${cartCount} item` : "Keranjang";

  const cartLinkClass =
    "btn-primary relative inline-flex items-center justify-center gap-2 rounded-full px-4 py-2";

  const cartBadge =
    cartCount > 0 ? (
      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold leading-none text-red-600 ring-2 ring-red-500">
        {cartCount > 99 ? "99+" : cartCount}
      </span>
    ) : null;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      {menuOpen ? (
        <div
          className="fixed inset-0 z-0 bg-slate-900/40 md:hidden"
          aria-hidden
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <div className="relative z-10 bg-white container-app flex items-center justify-between gap-3 py-3">
        <Link to="/" className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 md:flex-initial">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover sm:h-11 sm:w-11"
          />
          <div className="min-w-0">
            <span className="block text-xs font-semibold text-slate-500 sm:text-sm">Official Store</span>
            <span className="block truncate text-sm font-bold sm:text-base">
              {settings?.site_name || "CV Nyonya Susanti"}
            </span>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <nav
            className="hidden items-center gap-1 text-sm font-medium md:flex md:gap-2 lg:gap-4"
            aria-label="Utama"
          >
            <Link to="/" className="rounded-lg px-3 py-2 hover:bg-slate-100">
              Home
            </Link>
            <Link to="/products" className="rounded-lg px-3 py-2 hover:bg-slate-100">
              Products
            </Link>
            <Link to="/cart" className={cartLinkClass} aria-label={cartLabel}>
              <ShoppingCart size={16} aria-hidden />
              <span>Cart</span>
              {cartBadge}
            </Link>
          </nav>

          <Link
            to="/cart"
            className={`${cartLinkClass} aspect-square min-h-10 min-w-10 px-0 md:hidden`}
            aria-label={cartLabel}
          >
            <ShoppingCart size={18} aria-hidden />
            {cartBadge}
          </Link>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-800 hover:bg-slate-100 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        className={`absolute left-0 right-0 top-full z-10 border-t border-slate-100 bg-white shadow-lg md:hidden ${
          menuOpen ? "block" : "hidden"
        }`}
        aria-hidden={!menuOpen}
        aria-label="Menu mobile"
      >
        <div className="container-app flex flex-col gap-1 py-2">
          <Link
            to="/"
            className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-slate-100"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/products"
            className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-slate-100"
            onClick={() => setMenuOpen(false)}
          >
            Products
          </Link>
        </div>
      </nav>
    </header>
  );
}
