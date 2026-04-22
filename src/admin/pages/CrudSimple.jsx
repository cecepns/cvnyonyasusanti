/* eslint-disable react/prop-types */
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useFetchWithHeaders } from "../../hooks/useFetch";
import { api } from "../../lib/api";

export default function CrudSimple({ title, endpoint, headers, hasImage = false }) {
  const { data, setData } = useFetchWithHeaders(`/admin/${endpoint}`, [], headers);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);

  const create = async () => {
    const fd = new FormData();
    fd.append("name", name);
    if (image) fd.append("image", image);
    if (editId) await api.put(`/admin/${endpoint}/${editId}`, fd, { headers });
    else await api.post(`/admin/${endpoint}`, fd, { headers });
    const res = await api.get(`/admin/${endpoint}`, { headers });
    setData(res.data);
    setName("");
    setImage(null);
    setEditId(null);
  };

  const del = async (id) => {
    await api.delete(`/admin/${endpoint}/${id}`, { headers });
    setData((p) => p.filter((x) => x.id !== id));
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Manajemen {title}</h1>
      <div className="mb-4 rounded-xl bg-white p-4 shadow">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            placeholder={`Nama ${title}`}
          />
          {hasImage && (
            <input
              type="file"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="rounded-lg border p-2"
            />
          )}
          <button onClick={create} className="rounded-lg bg-red-500 px-4 text-white hover:bg-red-600">
            {editId ? <Pencil size={18} /> : <Plus size={18} />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-xl bg-white p-3 shadow">
            <div className="flex items-center gap-3">
              {item.image_url && (
                <img src={item.image_url} alt={item.name} className="h-10 w-10 rounded object-cover" />
              )}
              <span>{item.name}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditId(item.id);
                  setName(item.name);
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

