import React from "react";
import { Home, User, Bell, Calendar, CalendarCheck, List } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const BottomNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, notificaciones } = useAppContext();

  // Ruta Home según rol
  const getHomePath = () => {
    if (!usuario?.rol_jerarquico) return "/";
    switch (usuario.rol_jerarquico) {
      case "ADMINISTRADOR":
        return "/admin";
      case "JEFE_ZONA":
        return "/zona";
      case "JEFE_DEPENDENCIA":
        return "/dependencia";
      case "FUNCIONARIO":
        return "/funcionario";
      default:
        return "/";
    }
  };

  // 🔥 Notificaciones del usuario
  const notificacionesUsuario = notificaciones.filter(
    (n) => n.usuario_id === usuario.id
  );

  const notificacionesCount = notificacionesUsuario.length;

  const menuItems = [
    { key: "home", icon: Home, path: getHomePath() },
    { key: "dependencia", icon: List, path: "/detalle-dependencia" },
    { key: "escalafon", icon: Calendar, path: "/escalafon-servicio" },
    { key: "licencias", icon: CalendarCheck, path: "/licencias" },
    { key: "notificaciones", icon: Bell, path: "/notificaciones" },
    { key: "perfil", icon: User, path: "/perfil" },
  ];

  // Filtrar items según rol
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.path === "/escalafon-servicio" || item.path === "/licencias") {
      return !["ADMINISTRADOR", "JEFE_ZONA"].includes(usuario?.rol_jerarquico);
    } else if (item.path === "/detalle-dependencia") {
      return !["ADMINISTRADOR", "FUNCIONARIO", "JEFE_DEPENDENCIA"].includes(
        usuario?.rol_jerarquico
      );
    }
    return true;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-blue-100 dark:border-slate-700 shadow-lg z-50 pb-4">
      <div className="flex justify-around items-center h-16">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          const handleClick = () => {
            if (item.key === "notificaciones") {
              navigate("/notificaciones", {
                state: { notificaciones: notificacionesUsuario },
              });
            } else {
              navigate(item.path);
            }
          };

          return (
            <button
              key={item.key}
              onClick={handleClick}
              className={`flex flex-col items-center justify-center transition-all ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-400 hover:text-blue-500 dark:hover:text-blue-300"
              }`}
            >
              <div
                className={`relative p-2 rounded-full ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950 shadow-sm"
                    : "bg-transparent"
                }`}
              >
                <Icon size={24} />

                {/* BADGE DE NOTIFICACIONES */}
                {item.key === "notificaciones" && notificacionesCount > 0 && (
                  <span
                    className="
                      absolute -top-1 -right-1
                      bg-red-600 text-white text-[10px] 
                      min-w-[18px] h-[18px]
                      flex items-center justify-center 
                      rounded-full shadow
                    "
                  >
                    {notificacionesCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavbar;
