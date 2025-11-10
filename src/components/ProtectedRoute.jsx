import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({
  children,
  allow = ["administrador", "tutor", "estudiante"],
}) => {
  const { rol } = useContext(AuthContext);
  const location = useLocation();

  if (!rol || !allow.includes(rol)) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: location,
          error: "Acceso denegado. Inicia sesión con un usuario autorizado.",
        }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
