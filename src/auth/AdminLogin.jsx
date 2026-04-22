/* eslint-disable react/prop-types */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function AdminLogin({ setToken }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/admin/login", form);
      setToken(res.data.token);
      nav("/admin");
    } catch {
      setError("Login gagal");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <h1 className="mb-4 text-2xl font-bold">Admin Login</h1>
        <input
          className="mb-3 w-full rounded-xl border px-4 py-2"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          className="mb-3 w-full rounded-xl border px-4 py-2"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
        <button className="btn-primary w-full">Login</button>
      </form>
    </div>
  );
}

