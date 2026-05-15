/* eslint-disable react/prop-types */
import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import { useFetchWithHeaders } from "../../hooks/useFetch";
import { api, apiErrorMessage } from "../../lib/api";

export default function ShippingPage({ headers }) {
  const { data, setData } = useFetchWithHeaders("/admin/shipping-methods", [], headers);
  const [form, setForm] = useState({ name: "", is_active: 1, sort_order: 0 });
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);

  const resetForm = () => {
    setForm({ name: "", is_active: 1, sort_order: 0 });
    setImage(null);
    setEditId(null);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Nama jasa kirim wajib diisi");
      return;
    }
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append("image", image);
      const saveRes = editId
        ? await api.put(`/admin/shipping-methods/${editId}`, fd, { headers })
        : await api.post("/admin/shipping-methods", fd, { headers });
      toast.success(saveRes.data?.message || (editId ? "Jasa kirim diperbarui" : "Jasa kirim ditambahkan"));
      const res = await api.get("/admin/shipping-methods", { headers });
      setData(res.data);
      resetForm();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Gagal menyimpan jasa kirim"));
    }
  };

  const edit = (item) => {
    setEditId(item.id);
    setForm({
      name: item.name || "",
      is_active: Number(item.is_active ?? 1),
      sort_order: Number(item.sort_order ?? 0),
    });
    setImage(null);
  };

  const del = async (id) => {
    try {
      const res = await api.delete(`/admin/shipping-methods/${id}`, { headers });
      toast.success(res.data?.message || "Jasa kirim dihapus");
      setData((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Gagal menghapus jasa kirim"));
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Manajemen Jasa Kirim</h1>
      <div className="mb-4 rounded-xl bg-white p-4 shadow">
        <div className="grid gap-2 md:grid-cols-2">
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Nama ekspedisi (JNT, SiCepat, dll)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="rounded-lg border px-3 py-2"
            type="number"
            placeholder="Urutan tampil"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
          />
          <select
            className="rounded-lg border px-3 py-2"
            value={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: Number(e.target.value) })}
          >
            <option value={1}>Aktif</option>
            <option value={0}>Nonaktif</option>
          </select>
          <input
            type="file"
            accept="image/*"
            className="rounded-lg border p-2"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </div>
        {image && (
          <img src={URL.createObjectURL(image)} alt="Preview" className="mt-3 h-16 w-16 rounded object-contain" />
        )}
        <div className="mt-3 flex gap-2">
          <button onClick={save} className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600">
            {editId ? "Update" : "Tambah"}
          </button>
          {editId && (
            <button type="button" onClick={resetForm} className="rounded-lg border px-4 py-2 text-slate-600">
              Batal
            </button>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-xl bg-white p-3 shadow">
            <div className="flex items-center gap-3">
              {item.image_url && (
                <img src={item.image_url} alt={item.name} className="h-12 w-12 rounded object-contain" />
              )}
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs text-slate-500">
                  Urutan: {item.sort_order ?? 0} · {item.is_active ? "Aktif" : "Nonaktif"}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => edit(item)} className="text-blue-500" type="button">
                <Pencil size={18} />
              </button>
              <button onClick={() => del(item.id)} className="text-red-500" type="button">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
