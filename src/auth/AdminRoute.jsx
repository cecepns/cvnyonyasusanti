/* eslint-disable react/prop-types */
import { Navigate } from "react-router-dom";

export default function AdminRoute({ token, children }) {
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}

