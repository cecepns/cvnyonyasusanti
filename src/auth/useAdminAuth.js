import { useState } from "react";

export function useAdminAuth() {
  const [token, setToken] = useState(localStorage.getItem("admin_token") || "");

  const set = (val) => {
    setToken(val);
    if (val) localStorage.setItem("admin_token", val);
    else localStorage.removeItem("admin_token");
  };

  return [token, set];
}

