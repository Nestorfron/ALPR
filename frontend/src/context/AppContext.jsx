import React, { createContext, useState, useEffect, useContext } from "react";
import { fetchData, loginUser, logoutUser } from "../utils/api";
import { estaTokenExpirado } from "../utils/tokenUtils";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("access_token") || null);
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);

  // ================== Fetch usuario ==================
  const fetchAppData = async () => {
    if (!token || !userId) return;
    setLoading(true);

    try {
      const usuarioData = await fetchData(`/users/${userId}`, token);
      setUsuario(usuarioData);
    } catch (error) {
      console.error("Error cargando datos del usuario:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // ================== useEffect para cargar usuario ==================
  useEffect(() => {
    if (token && userId && !estaTokenExpirado(token)) {
      fetchAppData();
    } else {
      setLoading(false);
    }
  }, [token, userId]);

  // ================== Login ==================
  const login = async (username, password) => {
    try {
      const data = await loginUser(username, password); // Debe devolver { access_token, user }
      if (data.access_token && data.user?.id) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("userId", data.user.id);
        setToken(data.access_token);
        setUserId(data.user.id);

        await fetchAppData();
        return data;
      } else {
        throw new Error("Login incompleto: falta token o user.id");
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      throw new Error(err?.message || "Error al iniciar sesión");
    }
  };

  // ================== Logout ==================
  const logout = () => {
    logoutUser();
    localStorage.removeItem("access_token");
    localStorage.removeItem("userId");
    setToken(null);
    setUserId(null);
    setUsuario(null);
    setLoading(false);
  };

  // ================== Recargar datos del usuario ==================
  const recargarDatos = async () => {
    await fetchAppData();
  };

  return (
    <AppContext.Provider
      value={{
        usuario,
        token,
        loading,
        login,
        logout,
        recargarDatos,
        setUsuario,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
