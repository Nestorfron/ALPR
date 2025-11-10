import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { postData } from "../utils/api"; 
import Navbar from "../components/BottomNavbar";
import { useAppContext } from "../context/AppContext";
import { estaTokenExpirado } from "../utils/tokenUtils";


export default function CrearUsuario() {
  const navigate = useNavigate();
  const { jefaturas, token, usuario, recargarDatos } = useAppContext();

  const [formData, setFormData] = useState({
    grado: "",
    nombre: "",
    correo: "",
    password: "",
    rol_jerarquico: "",
    dependencia_id: "",
    zona_id: "",
    turno_id: "",
    estado: "Activo",
    is_admin: false,
  });

  const dependencias = jefaturas?.flatMap(jefatura =>
    jefatura.zonas?.flatMap(zona => zona.dependencias || []) || []
  ) || [];
  

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (name, value) => {
    let message = "";
    switch (name) {
      case "correo":
        if (!/\S+@\S+\.\S+/.test(value)) message = "Correo inválido";
        break;
      case "password":
        if (value.length < 6) message = "Debe tener al menos 6 caracteres";
        break;
      case "nombre":
        if (value.trim().length < 3) message = "Debe tener al menos 3 letras";
        break;
      default:
        if (!value.trim()) message = "Campo obligatorio";
    }
    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: fieldValue }));
    validate(name, fieldValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasErrors = Object.values(errors).some((e) => e);
    if (hasErrors) return alert("Corrige los errores antes de enviar");
  
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
  
      const payload = {
        ...formData,
        dependencia_id: formData.dependencia_id || null,
        zona_id: formData.zona_id || null,
        turno_id: formData.turno_id || null,
      };
  
      const data = await postData("usuarios", payload, token); 
      if (data) setSuccess(true);
      recargarDatos();
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      grado: "",
      nombre: "",
      correo: "",
      password: "",
      rol_jerarquico: "",
      dependencia_id: "",
      zona_id: "",
      turno_id: "",
      estado: "Activo",
      is_admin: false,
    });
    setErrors({});
    setSuccess(false);
  };

  useEffect(() => {
    if (!token || estaTokenExpirado(token)) {
      navigate("/login");
    }
  }, [token, navigate]);


  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="flex-grow flex flex-col items-center p-4 pb-24">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 space-y-4"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <PlusCircle className="text-blue-600 dark:text-blue-300" size={28} />
            <h1 className="text-xl font-semibold text-blue-900 dark:text-blue-200">
              Crear nuevo usuario
            </h1>
          </div>

          <div className="space-y-3">
            {[{ name: "grado", placeholder: "Grado" },
              { name: "nombre", placeholder: "Nombre completo" },
              { name: "correo", placeholder: "Correo electrónico", type: "email" },
              { name: "password", placeholder: "Contraseña", type: "password" }
            ].map(({ name, placeholder, type = "text" }) => (
              <div key={name}>
                <input
                  type={type}
                  name={name}
                  placeholder={placeholder}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                  className={`w-full border rounded-lg px-3 py-2 bg-transparent outline-none focus:ring-2 transition-all ${
                    errors[name]
                      ? "border-red-400 focus:ring-red-400"
                      : "border-blue-200 dark:border-slate-700 focus:ring-blue-400"
                  }`}
                />
                {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
              </div>
            ))}

            <select
              name="rol_jerarquico"
              value={formData.rol_jerarquico}
              onChange={handleChange}
              required
              className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Seleccionar rol</option>
              <option value="ADMINISTRADOR">Administrador</option>
              <option value="JEFE_ZONA">Jefe de Zona</option>
              <option value="JEFE_DEPENDENCIA">Jefe de Dependencia</option>
              <option value="FUNCIONARIO">Funcionario</option>
            </select>

            <select
              name="dependencia_id"
              value={formData.dependencia_id}
              onChange={handleChange}
              className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Seleccionar dependencia (opcional)</option>
              {dependencias.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.nombre}
                </option>
              ))}
            </select>

            {["zona_id", "turno_id"].map((name) => (
              <input
                key={name}
                type="number"
                name={name}
                placeholder={`${name.replace("_", " ").toUpperCase()} (opcional)`}
                value={formData[name]}
                onChange={handleChange}
                className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
              />
            ))}

            <label className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300 mt-2">
              <input
                type="checkbox"
                name="is_admin"
                checked={formData.is_admin}
                onChange={handleChange}
                className="accent-blue-600"
              />
              ¿Es administrador?
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-medium transition-all ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Creando usuario..." : "Crear usuario"}
          </button>

          <button
            type="button"
            onClick={() => navigate(usuario.rol_jerarquico === "JEFE_DEPENDENCIA" ? "/dependencia" : "/admin")}
            className="w-full py-2 text-sm text-blue-600 dark:text-blue-300 mt-2 underline hover:opacity-80"
          >
            ← Volver
          </button>
        </form>
      </div>

      <Navbar />

      <AnimatePresence>
        {success && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center max-w-sm w-full"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <CheckCircle2 className="text-green-500 w-16 h-16 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                Usuario creado con éxito
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                El nuevo usuario fue registrado correctamente.
              </p>
              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={resetForm}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-all"
                >
                  Crear otro
                </button>
                <button
                  onClick={() => navigate(usuario.rol_jerarquico === "JEFE_DEPENDENCIA" ? "/dependencia" : "/admin")}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:text-white px-5 py-2 rounded-lg font-medium transition-all"
                >
                  Volver
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
