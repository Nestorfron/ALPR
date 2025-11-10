import React from "react";
import { useAppContext } from "../context/AppContext";
import BottomNavbar from "../components/BottomNavbar";
import Loading from "../components/Loading";
import { Edit } from "lucide-react";

const Zona = () => {
  const { usuario, jefaturas, loading } = useAppContext();

  if (loading) return <Loading />;

  if (!usuario) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-slate-900">
        <p className="text-gray-600 dark:text-gray-300">
          No se encontró información del usuario.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
      <main className="flex-1 px-6 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-blue-700 dark:text-blue-400">
            Bienvenido, {usuario.nombre}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Rol: {usuario.rol_jerarquico === "JEFE_ZONA" ? "Jefe de zona" : ""}
          </p>
        </div>

        {usuario.rol_jerarquico === "JEFE_ZONA" ? (
          <div className="space-y-6">
            {jefaturas
              .sort((a, b) =>
                a.nombre.localeCompare(b.nombre, undefined, { numeric: true })
              )
              .map((jefatura) => {
                const zonasFiltradas =
                  jefatura.zonas?.filter(
                    (zona) => zona.id === usuario.zona_id
                  ) || [];

                if (zonasFiltradas.length === 0) return null;

                return (
                  <div key={jefatura.id} className="space-y-4">
                    <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400">
                      {jefatura.nombre}
                    </h2>

                    {zonasFiltradas
                      .sort((a, b) =>
                        a.nombre.localeCompare(b.nombre, undefined, {
                          numeric: true,
                        })
                      )
                      .map((zona) => (
                        <div
                          key={zona.id}
                          className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-700 overflow-x-auto"
                        >
                          {/* Título mejorado */}
                          <div className="px-4 py-3 bg-blue-50 dark:bg-slate-900 border-b border-blue-100 dark:border-slate-700 rounded-t-2xl">
                            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                              {zona.nombre}
                            </h3>
                          </div>

                          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-blue-50 dark:bg-slate-900">
                              <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Dependencia
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Jefe
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Funcionarios
                                </th>
                                <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Acciones
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                              {zona.dependencias
                                ?.sort((a, b) =>
                                  a.nombre.localeCompare(b.nombre, undefined, {
                                    numeric: true,
                                  })
                                )
                                .map((dep) => (
                                  <tr
                                    key={dep.id}
                                    className="hover:bg-blue-50 dark:hover:bg-slate-900 transition-colors"
                                  >
                                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                      {dep.nombre}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                      {(() => {
                                        const jefe = dep.usuarios?.find(
                                          (u) =>
                                            u.rol_jerarquico ===
                                            "JEFE_DEPENDENCIA"
                                        );
                                        return jefe
                                          ? `G${jefe.grado || ""} ${
                                              jefe.nombre
                                            }`
                                          : "Sin jefe";
                                      })()}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                      {dep.usuarios?.filter(
                                        (u) =>
                                          u.rol_jerarquico !==
                                          "JEFE_DEPENDENCIA"
                                      ).length || 0}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                      <button
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                                        onClick={() =>
                                          alert(`Editar ${dep.nombre}`)
                                        }
                                      >
                                        <Edit size={16} /> Editar
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400">
            Tenés acceso limitado a la información.
          </p>
        )}
      </main>

      <BottomNavbar />
    </div>
  );
};

export default Zona;
