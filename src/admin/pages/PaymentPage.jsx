/* eslint-disable react/prop-types */
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useFetchWithHeaders } from "../../hooks/useFetch";
import { api } from "../../lib/api";

export default function PaymentPage({ headers }) {
  const { data, setData } = useFetchWithHeaders("/admin/payment-methods", [], headers);
  const [form, setForm] = useState({ name: "", account_name: "", account_number: "", is_active: 1 });
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);

  const save = async () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append("image", image);
    if (editId) await api.put(`/admin/payment-methods/${editId}`, fd, { headers });
    else await api.post("/admin/payment-methods", fd, { headers });
    const res = await api.get("/admin/payment-methods", { headers });
    setData(res.data);
    setForm({ name: "", account_name: "", account_number: "", is_active: 1 });
    setImage(null);
    setEditId(null);
  };

  const del = async (id) => {
    await api.delete(`/admin/payment-methods/${id}`, { headers });
    setData((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Manajemen Payment Method</h1>
      <div className="mb-4 rounded-xl bg-white p-4 shadow">
        <div className="grid gap-2 md:grid-cols-2">
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Nama metode"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Nama akun"
            value={form.account_name}
            onChange={(e) => setForm({ ...form, account_name: e.target.value })}
          />
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Nomor akun"
            value={form.account_number}
            onChange={(e) => setForm({ ...form, account_number: e.target.value })}
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
            className="rounded-lg border p-2 md:col-span-2"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </div>
        <button onClick={save} className="mt-3 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600">
          {editId ? "Update" : "Tambah"}
        </button>
      </div>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-xl bg-white p-3 shadow">
            <div className="flex items-center gap-3">
              {item.image_url && <img src={item.image_url} alt={item.name} className="h-10 w-10 rounded object-cover" />}
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs text-slate-500">
                  {item.account_name} - {item.account_number}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditId(item.id);
                  setForm({
                    name: item.name || "",
                    account_name: item.account_name || "",
                    account_number: item.account_number || "",
                    is_active: Number(item.is_active || 0),
                  });
                }}
                className="text-blue-500"
              >
                <Pencil size={18} />
              </button>
              <button onClick={() => del(item.id)} className="text-red-500">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

