/* eslint-disable react/prop-types */
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import WhatsAppButton from "../components/WhatsAppButton";

export default function HomePage({
  settings,
  banners,
  categories,
  products,
  paymentMethods,
  loadingBanners,
}) {
  return (
    <main>
      <section className="container-app py-8" data-aos="fade-up">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <p className="mb-2 text-sm font-semibold text-red-500">Selamat datang di toko online kami</p>
          <h1 className="text-3xl font-black leading-tight text-slate-900 md:text-5xl">
            Produk Pilihan Berkualitas, Harga Kompetitif
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Belanja berbagai kebutuhan produk Anda dengan pengalaman belanja yang cepat, mudah, dan aman.
          </p>
        </div>
        {loadingBanners ? (
          <div className="h-72 animate-pulse rounded-3xl bg-slate-200 md:h-96" />
        ) : (
          <div className="home-banner-swiper relative">
            <Swiper
              modules={[Navigation]}
              navigation={{
                prevEl: ".home-banner-swiper .banner-nav-prev",
                nextEl: ".home-banner-swiper .banner-nav-next",
              }}
              className="banner-swiper rounded-3xl"
              loop={banners.length > 1}
            >
              {banners.map((banner) => (
                <SwiperSlide key={banner.id}>
                  <div className="relative h-72 overflow-hidden rounded-3xl bg-slate-100 md:h-96">
                    {banner.image_url && (
                      <img src={banner.image_url} alt={banner.title} className="h-full w-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                    <div className="absolute bottom-7 left-7 right-7 md:right-24">
                      <p className="text-xs font-semibold uppercase tracking-widest text-red-200">Promo Banner</p>
                      <div className="mt-1 text-2xl font-bold text-white md:text-3xl">{banner.title}</div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            {banners.length > 1 && (
              <>
                <button
                  type="button"
                  className="banner-nav-prev swiper-nav-btn absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/90 text-slate-800 shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 md:left-4 md:h-12 md:w-12 [&.swiper-button-disabled]:pointer-events-none [&.swiper-button-disabled]:opacity-25"
                  aria-label="Slide sebelumnya"
                >
                  <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2.25} />
                </button>
                <button
                  type="button"
                  className="banner-nav-next swiper-nav-btn absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/90 text-slate-800 shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 md:right-4 md:h-12 md:w-12 [&.swiper-button-disabled]:pointer-events-none [&.swiper-button-disabled]:opacity-25"
                  aria-label="Slide berikutnya"
                >
                  <ChevronRight className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2.25} />
                </button>
              </>
            )}
          </div>
        )}
      </section>

      <section className="container-app py-3" data-aos="fade-up">
        <h2 className="section-title">Kategori Produk</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((cat) => (
            <div key={cat.id} className="card-clean p-4 text-center">
              {cat.image_url ? (
                <img src={cat.image_url} alt={cat.name} className="mx-auto mb-3 h-20 w-20 rounded-full border border-slate-200 object-cover" />
              ) : null}
              <p className="font-semibold text-slate-700">{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-app py-8" data-aos="fade-up">
        <h2 className="section-title">Produk Terbaru</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {paymentMethods?.length > 0 && (
        <section className="container-app py-4" data-aos="fade-up">
          <h2 className="section-title">Metode Pembayaran</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {paymentMethods.map((p) => (
              <div key={p.id} className="card-clean p-4">
                {p.image_url ? <img src={p.image_url} alt={p.name} className="mb-3 h-12 object-contain" /> : null}
                <p className="font-semibold text-slate-800">{p.name}</p>
                <p className="text-sm text-slate-500">{p.account_name}</p>
                <p className="text-sm text-slate-500">{p.account_number}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container-app pb-8 pt-2" data-aos="fade-up">
        <div className="card-clean flex flex-col items-start justify-between gap-4 p-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-red-500">Butuh estimasi pengiriman?</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900 md:text-2xl">Cek Ongkos Kirim</h2>
            <p className="mt-1 text-sm text-slate-600">
              Cek ongkir dari berbagai ekspedisi berdasarkan kota tujuan dan berat barang.
            </p>
          </div>
          <a
            href="https://ongkoskirim.id/"
            target="_blank"
            rel="noreferrer"
            className="btn-primary px-5 py-3"
          >
            Cek Ongkir Sekarang
          </a>
        </div>
      </section>

      <Footer settings={settings} />
      <WhatsAppButton number={settings?.whatsapp} />
    </main>
  );
}

