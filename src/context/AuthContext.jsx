// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from "react";

// Crear el contexto
export const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Provider que envolverá tu app
export const AuthProvider = ({ children }) => {
  // Inicializar el rol desde localStorage si existe
  const [rol, setRol] = useState(() => {
    const storedRol = localStorage.getItem("userRol");
    return storedRol || null;
  });

  // Función para establecer el rol de forma segura
  const setRolSeguro = (nuevoRol) => {
    if (nuevoRol) {
      localStorage.setItem("userRol", nuevoRol);
    } else {
      localStorage.removeItem("userRol");
    }
    setRol(nuevoRol);
  };

  // Función para cerrar sesión y limpiar todo el localStorage
  const logout = () => {
    localStorage.clear(); // Limpia todo el localStorage
    setRol(null);
    window.location.href = "/#/"; // Redirecciona a la página de login
  };

  // Verificamos el rol al montar el componente
  useEffect(() => {
    const storedRol = localStorage.getItem("userRol");
    if (storedRol && rol !== storedRol) {
      setRol(storedRol);
    }
  }, []);

  // Guardar el rol en localStorage cada vez que cambie
  useEffect(() => {
    if (rol) {
      localStorage.setItem("userRol", rol);
    } else {
      localStorage.removeItem("userRol");
    }
  }, [rol]);

  const value = {
    rol,
    setRol: setRolSeguro,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
