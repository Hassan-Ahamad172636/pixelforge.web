import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

// Props:
// authProtected: true  => Only accessible if user is logged in (has token)
// authProtected: false => Only accessible if user is NOT logged in (no token)
const Interceptor = ({ authProtected }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  // Agar route protected hai aur token nahi hai → redirect to "/"
  if (authProtected && !token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Agar route NOT protected hai aur token hai → redirect to "/chat"
  if (!authProtected && token) {
    return <Navigate to="/chat" state={{ from: location }} replace />;
  }

  // Agar sab theek hai → Outlet render kare
  return <Outlet />;
};

export default Interceptor;
