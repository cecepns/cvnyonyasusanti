/* eslint-disable react/prop-types */
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import toast from "react-hot-toast";
import { MessageCircle, ShoppingCart } from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { currency, whatsappLink } from "../../lib/format";

export default function ProductDetailPage({ addCart, settings }) {
  const { id } = useParams();
  const { data: product, loading } = useFetch(`/products/${id}`, null);

  if (loading) return <div className="container-app p-8">Loading...</div>;
  if (!product) return <div className="container-app p-8">Produk tidak ditemukan</div>;

  return (
    <div className="container-app grid gap-8 py-8 md:grid-cols-2">
      <div>
        <Swiper modules={[Navigation]} navigation className="rounded-3xl">
          {product.images.map((img) => (
            <SwiperSlide key={img.id}>
              <img src={img.image_url} alt={product.name} className="h-72 w-full rounded-2xl object-cover md:h-[420px]" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="card-clean p-6">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="mt-2 text-sm text-slate-600">{product.category_name}</p>
        <p className="mt-4 text-2xl font-bold text-red-500">{currency(product.price)}</p>
        <p className="mt-4 text-slate-700">{product.short_description}</p>
        <div className="prose mt-4 max-w-none" dangerouslySetInnerHTML={{ __html: product.description || "" }} />
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              addCart(product);
              toast.success("Produk berhasil ditambahkan ke keranjang");
            }}
            className="btn-primary inline-flex items-center gap-2 px-5 py-3"
          >
            <ShoppingCart size={20} strokeWidth={2} aria-hidden />
            Tambah Keranjang
          </button>
          <a
            href={whatsappLink(settings?.whatsapp, `Halo, saya ingin beli produk: ${product.name}`)}
            target="_blank"
            rel="noreferrer"
            className="btn-primary inline-flex items-center gap-2 px-5 py-3"
          >
            <MessageCircle size={20} strokeWidth={2} aria-hidden />
            Beli Sekarang
          </a>
        </div>
      </div>
    </div>
  );
}

