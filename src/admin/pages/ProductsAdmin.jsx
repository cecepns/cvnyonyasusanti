/* eslint-disable react/prop-types */
import { useState } from "react";
import ReactQuill from "react-quill";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useFetchWithHeaders } from "../../hooks/useFetch";
import { api, apiErrorMessage } from "../../lib/api";
import { currency } from "../../lib/format";

const emptyVariant = () => ({ name: "", price: "", imageFile: null, image_url: null });

export default function ProductsAdmin({ headers }) {
  const { data: products, setData: setProducts } = useFetchWithHeaders("/admin/products", [], headers);
  const { data: categories } = useFetchWithHeaders("/admin/categories", [], headers);
  const initial = { name: "", price: "", category_id: "", short_description: "", description: "" };
  const [form, setForm] = useState(initial);
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [editId, setEditId] = useState(null);
  const [keepImageIds, setKeepImageIds] = useState([]);
  const [keepVariantIds, setKeepVariantIds] = useState([]);

  const resetForm = () => {
    setForm(initial);
    setImages([]);
    setVariants([]);
    setEditId(null);
    setKeepImageIds([]);
    setKeepVariantIds([]);
  };

  const save = async () => {
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("keepImageIds", JSON.stringify(keepImageIds));
      fd.append("keepVariantIds", JSON.stringify(keepVariantIds));
      fd.append(
        "variants",
        JSON.stringify(
          variants.map((v) => ({
            id: v.id || null,
            name: v.name,
            price: v.price,
            hasNewImage: !!v.imageFile,
          }))
        )
      );
      images.forEach((f) => fd.append("images", f));
      variants.forEach((v) => {
        if (v.imageFile) fd.append("variant_images", v.imageFile);
      });

      const saveRes = editId
        ? await api.put(`/admin/products/${editId}`, fd, { headers })
        : await api.post("/admin/products", fd, { headers });
      toast.success(saveRes.data?.message || (editId ? "Produk diperbarui" : "Produk ditambahkan"));
      const res = await api.get("/admin/products", { headers });
      setProducts(res.data);
      resetForm();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Gagal menyimpan produk"));
    }
  };

  const edit = (item) => {
    setEditId(item.id);
    setForm({
      name: item.name,
      price: item.price,
      category_id: item.category_id,
      short_description: item.short_description || "",
      description: item.description || "",
    });
    setKeepImageIds((item.images || []).map((x) => x.id));
    const itemVariants = item.variants || [];
    setVariants(
      itemVariants.map((v) => ({
        id: v.id,
        name: v.name,
        price: v.price,
        image_url: v.image_url,
        imageFile: null,
      }))
    );
    setKeepVariantIds(itemVariants.map((v) => v.id));
  };

  const del = async (id) => {
    try {
      const res = await api.delete(`/admin/products/${id}`, { headers });
      toast.success(res.data?.message || "Produk dihapus");
      setProducts((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Gagal menghapus produk"));
    }
  };

  const updateVariant = (index, patch) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  const removeVariant = (index) => {
    setVariants((prev) => {
      const target = prev[index];
      if (target?.id) setKeepVariantIds((ids) => ids.filter((id) => id !== target.id));
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Manajemen Produk</h1>
      <div className="mb-5 rounded-xl bg-white p-4 shadow">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Nama produk"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="rounded-lg border px-3 py-2"
            type="number"
            placeholder="Harga dasar"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <select
            className="rounded-lg border px-3 py-2"
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          >
            <option value="">Pilih kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Deskripsi singkat"
            value={form.short_description}
            onChange={(e) => setForm({ ...form, short_description: e.target.value })}
          />
        </div>
        <div className="mt-3">
          <ReactQuill theme="snow" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
        </div>

        <div className="mt-5 rounded-lg border border-slate-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Varian Produk</h2>
            <button
              type="button"
              onClick={() => setVariants((prev) => [...prev, emptyVariant()])}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
            >
              <Plus size={16} /> Tambah Varian
            </button>
          </div>
          {variants.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada varian. Harga dasar produk akan dipakai.</p>
          ) : (
            <div className="space-y-3">
              {variants.map((v, index) => (
                <div key={v.id || `new-${index}`} className="rounded-lg border border-slate-100 p-3">
                  <div className="grid gap-2 md:grid-cols-3">
                    <input
                      className="rounded-lg border px-3 py-2"
                      placeholder="Nama varian"
                      value={v.name}
                      onChange={(e) => updateVariant(index, { name: e.target.value })}
                    />
                    <input
                      className="rounded-lg border px-3 py-2"
                      type="number"
                      placeholder="Harga varian"
                      value={v.price}
                      onChange={(e) => updateVariant(index, { price: e.target.value })}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      className="rounded-lg border p-2"
                      onChange={(e) =>
                        updateVariant(index, { imageFile: e.target.files?.[0] || null })
                      }
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    {v.image_url && !v.imageFile && (
                      <img src={v.image_url} alt={v.name} className="h-14 w-14 rounded object-cover" />
                    )}
                    {v.imageFile && (
                      <img
                        src={URL.createObjectURL(v.imageFile)}
                        alt={v.name}
                        className="h-14 w-14 rounded object-cover"
                      />
                    )}
                    {v.id && editId && (
                      <label className="text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={keepVariantIds.includes(v.id)}
                          onChange={(e) =>
                            setKeepVariantIds((prev) =>
                              e.target.checked ? [...prev, v.id] : prev.filter((id) => id !== v.id)
                            )
                          }
                        />{" "}
                        simpan varian
                      </label>
                    )}
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-red-500"
                      aria-label="Hapus varian"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <input
          className="mt-3 rounded-lg border p-2"
          type="file"
          multiple
          onChange={(e) => setImages(Array.from(e.target.files || []))}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((f) => (
            <img key={f.name} src={URL.createObjectURL(f)} alt={f.name} className="h-16 w-16 rounded object-cover" />
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={save} className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600">
            {editId ? "Update Produk" : "Tambah Produk"}
          </button>
          {editId && (
            <button type="button" onClick={resetForm} className="rounded-lg border px-4 py-2 text-slate-600">
              Batal
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {products.map((p) => (
          <div key={p.id} className="rounded-xl bg-white p-4 shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-slate-500">
                  {currency(p.price)} - {p.category_name}
                </p>
                {p.variants?.length > 0 && (
                  <p className="mt-1 text-xs text-slate-500">
                    {p.variants.length} varian: {p.variants.map((v) => v.name).join(", ")}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => edit(p)} className="text-blue-500" type="button">
                  <Pencil size={18} />
                </button>
                <button onClick={() => del(p.id)} className="text-red-500" type="button">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              {p.images?.map((img) => (
                <div key={img.id} className="text-center">
                  <img src={img.image_url} alt="" className="h-14 w-14 rounded object-cover" />
                  {editId === p.id && (
                    <label className="mt-1 block text-xs">
                      <input
                        type="checkbox"
                        checked={keepImageIds.includes(img.id)}
                        onChange={(e) =>
                          setKeepImageIds((prev) =>
                            e.target.checked ? [...prev, img.id] : prev.filter((id) => id !== img.id)
                          )
                        }
                      />{" "}
                      keep
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
