/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { currency } from "../../lib/format";

export default function ProductCard({ item }) {
  return (
    <Link to={`/products/${item.id}`} className="card-clean block overflow-hidden p-3">
      <img
        src={item.primary_image_url || "https://placehold.co/400x300?text=No+Image"}
        alt={item.name}
        className="mb-3 h-40 w-full rounded-xl object-cover"
      />
      <p className="line-clamp-2 min-h-[48px] font-semibold text-slate-800">{item.name}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">{item.category_name}</p>
      <p className="mt-2 text-lg font-bold text-red-500">{currency(item.price)}</p>
    </Link>
  );
}

