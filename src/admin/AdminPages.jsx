/* eslint-disable react/prop-types */
import { useMemo } from "react";
import { Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import BannerPage from "./pages/BannerPage";
import CrudSimple from "./pages/CrudSimple";
import PaymentPage from "./pages/PaymentPage";
import ProductsAdmin from "./pages/ProductsAdmin";
import SettingsPage from "./pages/SettingsPage";

export default function AdminPages({ token }) {
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  return (
    <Routes>
      <Route path="/" element={<AdminDashboard headers={headers} />} />
      <Route path="/banners" element={<BannerPage headers={headers} />} />
      <Route
        path="/categories"
        element={<CrudSimple title="Kategori" endpoint="categories" headers={headers} hasImage />}
      />
      <Route path="/payments" element={<PaymentPage headers={headers} />} />
      <Route path="/settings" element={<SettingsPage headers={headers} />} />
      <Route path="/products" element={<ProductsAdmin headers={headers} />} />
    </Routes>
  );
}

