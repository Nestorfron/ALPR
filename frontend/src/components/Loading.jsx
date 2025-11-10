import React from "react";

const Loading = ({ message = "Cargando..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="w-16 h-16 border-4 border-blue-300 dark:border-blue-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mb-4"></div>
      <p className="text-blue-700 dark:text-blue-300 font-medium">{message}</p>
    </div>
  );
};

export default Loading;
