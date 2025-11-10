import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Perfil from "./pages/Perfil";
import AdminPanel from "./pages/AdminPanel";
import Zona from "./pages/Zona";
import Dependencia from "./pages/Dependencia";
import Funcionario from "./pages/Funcionario";
import Notificaciones from "./pages/Notificaciones";
import CrearUsuario from "./pages/CrearUsuario";
import CrearJefatura from "./pages/CrearJefatura";
import CrearZona from "./pages/CrearZona";
import CrearDependencia from "./pages/CrearDependencia";
import CrearTurno from "./pages/CrearTurno";


function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateSW, setUpdateSW] = useState(() => () => {});

  useEffect(() => {
    const updateServiceWorker = registerSW({
      onNeedRefresh() {
        setUpdateAvailable(true);
      },
      onOfflineReady() {
        console.log("App lista para funcionar offline 🚀");
      },
    });

    setUpdateSW(() => updateServiceWorker);
  }, []);

  const handleUpdate = () => {
    updateSW();
    setUpdateAvailable(false);
    window.location.reload();
  };

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/Login" element={ <Login /> } />
          <Route path="/" element={ <Home /> } />
          <Route path="/perfil" element={ <Perfil /> } />
          <Route path="/admin" element={ <AdminPanel /> } />
          <Route path="/zona" element={ <Zona /> } />
          <Route path="/dependencia" element={ <Dependencia /> } />
          <Route path="/funcionario" element={ <Funcionario /> } />
          <Route path="/notificaciones" element={ <Notificaciones /> } />
          <Route path="/crear-usuario/:dependenciaId" element={ <CrearUsuario /> } />
          <Route path="/crear-jefatura" element={ <CrearJefatura /> } />
          <Route path="/crear-zona/:jefaturaId" element={ <CrearZona /> } />
          <Route path="/crear-dependencia/:zonaId" element={ <CrearDependencia /> } />
          <Route path="/crear-turno" element={ <CrearTurno /> } />
        </Routes>
      </BrowserRouter>

      {updateAvailable && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#333",
            color: "#fff",
            padding: "1rem",
            textAlign: "center",
            zIndex: 9999,
          }}
        >
          🔄 Nueva versión disponible.&nbsp;
          <button
            onClick={handleUpdate}
            style={{
              cursor: "pointer",
              background: "#fff",
              color: "#333",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
            }}
          >
            Actualizar
          </button>
        </div>
      )}
    </>
  );
}

export default App;
