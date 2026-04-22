import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import AOS from "aos";
import { useFetch } from "./hooks/useFetch";
import { useAdminAuth } from "./auth/useAdminAuth";
import AdminRoute from "./auth/AdminRoute";
import AdminLogin from "./auth/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import PublicLayout from "./public/components/PublicLayout";
import HomePage from "./public/pages/HomePage";
import ProductsPage from "./public/pages/ProductsPage";
import ProductDetailPage from "./public/pages/ProductDetailPage";
import CartPage from "./public/pages/CartPage";

function App() {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart_data") || "[]"));
  const [token, setToken] = useAdminAuth();
  const { data: homeSettings } = useFetch("/settings/public", { settings: null, paymentMethods: [] });
  const { data: banners, loading: loadingBanners } = useFetch("/banners", []);
  const { data: categories } = useFetch("/categories", []);
  const { data: products } = useFetch("/products?limit=8", []);

  useEffect(() => {
    AOS.init({ duration: 700 });
  }, []);

  useEffect(() => {
    localStorage.setItem("cart_data", JSON.stringify(cart));
  }, [cart]);

  const addCart = (product) => {
    setCart((prev) => {
      const found = prev.find((x) => x.id === product.id);
      if (found) return prev.map((x) => (x.id === product.id ? { ...x, qty: x.qty + 1 } : x));
      return [...prev, { id: product.id, name: product.name, price: Number(product.price), qty: 1 }];
    });
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicLayout settings={homeSettings.settings} cart={cart}>
            <HomePage
              settings={homeSettings.settings}
              paymentMethods={homeSettings.paymentMethods}
              banners={banners}
              categories={categories}
              products={products}
              loadingBanners={loadingBanners}
            />
          </PublicLayout>
        }
      />
      <Route
        path="/products"
        element={
          <PublicLayout settings={homeSettings.settings} cart={cart}>
            <ProductsPage />
          </PublicLayout>
        }
      />
      <Route
        path="/products/:id"
        element={
          <PublicLayout settings={homeSettings.settings} cart={cart}>
            <ProductDetailPage addCart={addCart} settings={homeSettings.settings} />
          </PublicLayout>
        }
      />
      <Route
        path="/cart"
        element={
          <PublicLayout settings={homeSettings.settings} cart={cart}>
            <CartPage cart={cart} setCart={setCart} settings={homeSettings.settings} />
          </PublicLayout>
        }
      />
      <Route path="/admin/login" element={<AdminLogin setToken={setToken} />} />
      <Route
        path="/admin/*"
        element={
          <AdminRoute token={token}>
            <AdminLayout token={token} setToken={setToken} />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

export default App;
