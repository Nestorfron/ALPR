import React, { useEffect } from "react";
import BottomNavbar from "../components/BottomNavbar";


const Notificaciones = () => {
  useEffect(() => {
    console.log("Notificaciones");
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
      <main className="flex-1 px-6 py-8 space-y-6">
        {/* Encabezado */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-blue-700 dark:text-blue-400">
            Notificaciones
          </h1>
        </div>

        {/* Contenido */}
        <div className="space-y-6">
          <div className="p-4 bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
              Notificación 1
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Esta es una notificación de prueba.
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
              Notificación 2
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Esta es una notificación de prueba.
            </p>
          </div>
        </div>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default Notificaciones;