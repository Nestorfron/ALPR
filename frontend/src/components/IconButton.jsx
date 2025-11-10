import React from "react";
import clsx from "clsx";

/**
 * IconButton: botón reutilizable para iconos
 * Props:
 * - icon: componente de icono (obligatorio)
 * - onClick: función al hacer click
 * - size: "sm" | "md" | "lg"
 * - tooltip: texto de ayuda al pasar el mouse
 * - className: clases adicionales
 */
const IconButton = ({ icon: Icon, onClick, size = "md", tooltip = "", className = "" }) => {
  const sizes = {
    sm: "w-8 h-8 p-1",
    md: "w-10 h-10 p-2",
    lg: "w-12 h-12 p-3",
  };

  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={clsx(
        "flex items-center justify-center rounded-full bg-transparent hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors text-blue-600 dark:text-blue-300",
        sizes[size],
        className
      )}
    >
      <Icon size={20} />
    </button>
  );
};

export default IconButton;
