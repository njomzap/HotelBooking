import React from "react";
import { Navigate } from "react-router-dom";


export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const accessToken = localStorage.getItem("accessToken"); 
  const role = localStorage.getItem("role");   

  if (!accessToken) return <Navigate to="/login" />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/" />; 
  }

  return children;
}
