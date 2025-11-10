// utils/turnoHelpers.js
export function getTurnoProps(turno) {
    if (!turno) return { clase: "text-sm text-gray-700 dark:text-gray-300 bg-transparent", contenido: "-" };
  
    const t = turno.toLowerCase();
  
    if (t === "licencia") return { clase: "text-sm text-black bg-yellow-400 font-bold", contenido: "L" };
    if (t === "l.ext") return { clase: "text-sm text-black bg-yellow-400 font-bold", contenido: "L.Ext" };
    if (["custodia", "curso", "ch", "brou"].includes(t)) return { clase: "text-sm text-white bg-blue-600 font-bold", contenido: turno };
    if (t === "guardia" || turno === "T") return { clase: "text-sm text-black bg-white font-bold", contenido: "T" };
    if (t === "descanso") return { clase: "text-sm text-white bg-black font-bold", contenido: "D" };
    if (["1er", "2do", "3er"].includes(turno)) return { clase: "text-sm text-white bg-blue-600 font-bold", contenido: turno };
  
    return { clase: "text-sm text-gray-700 dark:text-gray-300 bg-transparent", contenido: turno };
  }
  