/* eslint-disable react/prop-types */
import { Link, useLocation } from "react-router-dom";
import { Images, LayoutDashboard, ListTree, Package, Settings, Wallet } from "lucide-react";
import AdminPages from "./AdminPages";

export default function AdminLayout({ token, setToken }) {
  const location = useLocation();
  const menu = [
    { to: "/admin", icon: LayoutDashboard, text: "Dashboard" },
    { to: "/admin/banners", icon: Images, text: "Banner" },
    { to: "/admin/categories", icon: ListTree, text: "Kategori" },
    { to: "/admin/products", icon: Package, text: "Produk" },
    { to: "/admin/payments", icon: Wallet, text: "Payment" },
    { to: "/admin/settings", icon: Settings, text: "Settings" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-64 border-r border-slate-200 bg-white p-4">
        <h2 className="mb-4 text-xl font-bold">Admin Panel</h2>
        <div className="space-y-2">
          {menu.map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                location.pathname === m.to ? "bg-slate-100" : ""
              }`}
            >
              <m.icon size={18} /> {m.text}
            </Link>
          ))}
          <button className="btn-primary mt-4 w-full" onClick={() => setToken("")}>
            Logout
          </button>
        </div>
      </aside>
      <div className="flex-1 p-6">
        <AdminPages token={token} />
      </div>
    </div>
  );
}

