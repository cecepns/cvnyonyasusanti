/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useFetchWithHeaders } from "../../hooks/useFetch";
import { api, apiErrorMessage } from "../../lib/api";

export default function SettingsPage({ headers }) {
  const { data, setData } = useFetchWithHeaders("/admin/settings", {}, headers);
  const [form, setForm] = useState({});

  useEffect(() => setForm(data || {}), [data]);

  const save = async () => {
    try {
      const res = await api.put("/admin/settings", form, { headers });
      setData(res.data);
      toast.success("Pengaturan berhasil disimpan");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Gagal menyimpan pengaturan"));
    }
  };

  return (
    <div className="max-w-3xl rounded-xl bg-white p-5 shadow">
      <h1 className="mb-4 text-2xl font-bold">Settings Website</h1>
      {["site_name", "email", "whatsapp", "contact_address", "footer_info", "footer_links"].map((key) => (
        <input
          key={key}
          className="mb-3 w-full rounded-lg border px-3 py-2"
          placeholder={key}
          value={form[key] || ""}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        />
      ))}
      <button onClick={save} className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600">
        Simpan
      </button>
    </div>
  );
}

