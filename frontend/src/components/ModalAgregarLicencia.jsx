import React, { useState } from "react";
import dayjs from "dayjs";
import { postData } from "../utils/api";

export default function ModalAgregarLicencia({ usuario, dia, onCerrar, recargarLicencias, token }) {
  // Aseguramos que dia sea startOf('day')
  const diaInicial = dia.startOf("day");

  const [tipo, setTipo] = useState("reglamentaria");
  const [fechaInicio, setFechaInicio] = useState(diaInicial.format("YYYY-MM-DD"));
  const [fechaFin, setFechaFin] = useState(diaInicial.format("YYYY-MM-DD"));
  const [motivo, setMotivo] = useState("");
  const [estado, setEstado] = useState("aprobado");

  const handleSubmit = async () => {
    if (!token) return;

    if (!fechaInicio || !fechaFin || !tipo) {
      alert("Completa todos los campos.");
      return;
    }

    try {
      await postData(
        "/licencias",
        {
          usuario_id: usuario.id,
          // Enviamos fechas como ISO con startOf('day') para evitar desfases
          fecha_inicio: dayjs(fechaInicio).startOf("day").toISOString(),
          fecha_fin: dayjs(fechaFin).startOf("day").toISOString(),
          tipo,
          motivo,
          estado,
        },
        token,
        { "Content-Type": "application/json" }
      );
      recargarLicencias();
      onCerrar();
    } catch (error) {
      console.error("Error creando licencia:", error);
      alert("No se pudo crear la licencia.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-96 shadow-lg">
        <div className="mb-3">
          <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Tipo de licencia</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full border rounded px-2 py-1 dark:bg-slate-700 dark:text-gray-200"
          >
            <option value="reglamentaria">Reglamentaria</option>
            <option value="extraordinaria">Extraordinaria</option>
            <option value="compensacion">Compensación Horas</option>
            <option value="medica">Médica</option>
          </select>
        </div>

        <div className="mb-3 flex gap-2">
          <div className="flex-1">
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Fecha Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full border rounded px-2 py-1 dark:bg-slate-700 dark:text-gray-200"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Fecha Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full border rounded px-2 py-1 dark:bg-slate-700 dark:text-gray-200"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Motivo</label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full border rounded px-2 py-1 dark:bg-slate-700 dark:text-gray-200"
            rows={3}
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full border rounded px-2 py-1 dark:bg-slate-700 dark:text-gray-200"
          >
            <option value="">Seleccionar estado</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onCerrar}
            className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
