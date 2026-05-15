/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
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
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  const variants = product?.variants || [];
  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) || null,
    [variants, selectedVariantId]
  );

  const displayPrice = selectedVariant ? selectedVariant.price : product?.price;
  const galleryImages = useMemo(() => {
    if (!product) return [];
    if (selectedVariant?.image_url) {
      return [{ id: `variant-${selectedVariant.id}`, image_url: selectedVariant.image_url }];
    }
    return product.images || [];
  }, [product, selectedVariant]);

  if (loading) return <div className="container-app p-8">Loading...</div>;
  if (!product) return <div className="container-app p-8">Produk tidak ditemukan</div>;

  const handleAddCart = () => {
    if (variants.length > 0 && !selectedVariant) {
      toast.error("Pilih varian produk terlebih dahulu");
      return;
    }
    addCart(product, selectedVariant);
    toast.success("Produk berhasil ditambahkan ke keranjang");
  };

  const waText = selectedVariant
    ? `Halo, saya ingin beli produk: ${product.name} - varian ${selectedVariant.name}`
    : `Halo, saya ingin beli produk: ${product.name}`;

  return (
    <div className="container-app grid gap-8 py-8 md:grid-cols-2">
      <div>
        <Swiper modules={[Navigation]} navigation className="rounded-3xl">
          {galleryImages.map((img) => (
            <SwiperSlide key={img.id}>
              <img
                src={img.image_url}
                alt={product.name}
                className="h-72 w-full rounded-2xl object-cover md:h-[420px]"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="card-clean p-6">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="mt-2 text-sm text-slate-600">{product.category_name}</p>
        <p className="mt-4 text-2xl font-bold text-red-500">{currency(displayPrice)}</p>

        {variants.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold text-slate-700">Pilih Varian</p>
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => {
                const active = selectedVariantId === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`rounded-xl border px-4 py-2 text-left transition ${
                      active
                        ? "border-red-500 bg-red-50 text-red-600"
                        : "border-slate-200 bg-white text-slate-700 hover:border-red-300"
                    }`}
                  >
                    <span className="block font-semibold">{v.name}</span>
                    <span className="block text-sm">{currency(v.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <p className="mt-4 text-slate-700">{product.short_description}</p>
        <div className="prose mt-4 max-w-none" dangerouslySetInnerHTML={{ __html: product.description || "" }} />
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleAddCart}
            className="btn-primary inline-flex items-center gap-2 px-5 py-3"
          >
            <ShoppingCart size={20} strokeWidth={2} aria-hidden />
            Tambah Keranjang
          </button>
          <a
            href={whatsappLink(settings?.whatsapp, waText)}
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
