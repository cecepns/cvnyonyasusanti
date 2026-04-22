import { useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import ProductCard from "../components/ProductCard";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const { data: products } = useFetch(`/products?limit=100&search=${encodeURIComponent(search)}`, []);

  return (
    <div className="container-app py-8">
      <h1 className="section-title">Semua Produk</h1>
      <input
        className="mb-5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-red-500 focus:outline-none md:w-96"
        placeholder="Cari produk..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

