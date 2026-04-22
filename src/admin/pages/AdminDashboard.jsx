/* eslint-disable react/prop-types */
import { useFetchWithHeaders } from "../../hooks/useFetch";

export default function AdminDashboard({ headers }) {
  const { data } = useFetchWithHeaders("/admin/dashboard", {}, headers);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Object.entries(data).map(([k, v]) => (
        <div key={k} className="rounded-xl bg-white p-4 shadow">
          <p className="text-slate-500">{k}</p>
          <p className="text-2xl font-bold">{v?.total || 0}</p>
        </div>
      ))}
    </div>
  );
}

