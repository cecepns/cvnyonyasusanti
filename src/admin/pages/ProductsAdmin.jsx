/* eslint-disable react/prop-types */
import { useState } from "react";
import ReactQuill from "react-quill";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import { useFetchWithHeaders } from "../../hooks/useFetch";
import { api, apiErrorMessage } from "../../lib/api";
import { currency } from "../../lib/format";

export default function ProductsAdmin({ headers }) {
  const { data: products, setData: setProducts } = useFetchWithHeaders("/admin/products", [], headers);
  const { data: categories } = useFetchWithHeaders("/admin/categories", [], headers);
  const initial = { name: "", price: "", category_id: "", short_description: "", description: "" };
  const [form, setForm] = useState(initial);
  const [images, setImages] = useState([]);
  const [editId, setEditId] = useState(null);
  const [keepImageIds, setKeepImageIds] = useState([]);

  const save = async () => {
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("keepImageIds", JSON.stringify(keepImageIds));
      images.forEach((f) => fd.append("images", f));
      const saveRes = editId
        ? await api.put(`/admin/products/${editId}`, fd, { headers })
        : await api.post("/admin/products", fd, { headers });
      toast.success(saveRes.data?.message || (editId ? "Produk diperbarui" : "Produk ditambahkan"));
      const res = await api.get("/admin/products", { headers });
      setProducts(res.data);
      setForm(initial);
      setImages([]);
      setEditId(null);
      setKeepImageIds([]);
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
    setKeepImageIds(item.images.map((x) => x.id));
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
            placeholder="Harga"
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
        <input className="mt-3 rounded-lg border p-2" type="file" multiple onChange={(e) => setImages(Array.from(e.target.files || []))} />
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((f) => (
            <img key={f.name} src={URL.createObjectURL(f)} alt={f.name} className="h-16 w-16 rounded object-cover" />
          ))}
        </div>
        <button onClick={save} className="mt-3 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600">
          {editId ? "Update Produk" : "Tambah Produk"}
        </button>
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
              </div>
              <div className="flex gap-2">
                <button onClick={() => edit(p)} className="text-blue-500">
                  <Pencil size={18} />
                </button>
                <button onClick={() => del(p.id)} className="text-red-500">
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

