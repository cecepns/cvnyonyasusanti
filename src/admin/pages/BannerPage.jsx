/* eslint-disable react/prop-types */
import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import { useFetchWithHeaders } from "../../hooks/useFetch";
import { api, apiErrorMessage } from "../../lib/api";

export default function BannerPage({ headers }) {
  const { data, setData } = useFetchWithHeaders("/admin/banners", [], headers);
  const [title, setTitle] = useState("");
  const [sort, setSort] = useState("0");
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);

  const create = async () => {
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("sort_order", sort);
      if (image) fd.append("image", image);
      const saveRes = editId
        ? await api.put(`/admin/banners/${editId}`, fd, { headers })
        : await api.post("/admin/banners", fd, { headers });
      toast.success(saveRes.data?.message || (editId ? "Banner diperbarui" : "Banner ditambahkan"));
      const res = await api.get("/admin/banners", { headers });
      setData(res.data);
      setTitle("");
      setSort("0");
      setImage(null);
      setEditId(null);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Gagal menyimpan banner"));
    }
  };

  const del = async (id) => {
    try {
      const res = await api.delete(`/admin/banners/${id}`, { headers });
      toast.success(res.data?.message || "Banner dihapus");
      setData((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Gagal menghapus banner"));
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Manajemen Banner</h1>
      <div className="mb-4 rounded-xl bg-white p-4 shadow">
        <div className="grid gap-2 md:grid-cols-4">
          <input
            className="rounded-lg border px-3 py-2 md:col-span-2"
            placeholder="Judul banner"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="rounded-lg border px-3 py-2"
            type="number"
            placeholder="Urutan"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          />
          <input type="file" className="rounded-lg border p-2" onChange={(e) => setImage(e.target.files?.[0] || null)} />
        </div>
        <button onClick={create} className="mt-3 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600">
          {editId ? "Update Banner" : "Tambah Banner"}
        </button>
      </div>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-xl bg-white p-3 shadow">
            <div className="flex items-center gap-3">
              {item.image_url && <img src={item.image_url} alt={item.title} className="h-12 w-16 rounded object-cover" />}
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-xs text-slate-500">Sort: {item.sort_order}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditId(item.id);
                  setTitle(item.title || "");
                  setSort(String(item.sort_order || 0));
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

