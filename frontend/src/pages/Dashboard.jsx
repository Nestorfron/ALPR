import React, { useState, useEffect, useRef } from "react";
import Tesseract from "tesseract.js";
import { postData } from "../utils/api"; // Asegúrate de que esta función esté configurada correctamente.

export default function Dashboard() {
  const [cameraActive, setCameraActive] = useState(false);
  const [plates, setPlates] = useState([]);
  const [processing, setProcessing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const token = localStorage.getItem("access_token");

  // ================== Manejar cámara ==================
  useEffect(() => {
    if (cameraActive) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error("Error accessing camera:", err));
    } else {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    }
  }, [cameraActive]);

  // ================== Cargar historial ==================
  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setPlates(
          data.map((h) => ({
            plate: h.plate,
            status: h.status,
            scannedAt: new Date(h.checked_at).toLocaleTimeString(),
          }))
        );
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };
    fetchHistory();
  }, [token]);

  // ================== Escaneo de placa ==================
  const handleScan = async () => {
    if (!videoRef.current) return;
    setProcessing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // OCR
    const { data } = await Tesseract.recognize(canvas, "eng", {
      logger: (m) => console.log(m),
    });
    const text = data.text.replace(/\s/g, "").toUpperCase();
    const plateRegex = /[A-Z]{1,3}-?[0-9]{1,4}/;
    const match = text.match(plateRegex);
    const scannedPlate = match ? match[0] : null;

    if (!scannedPlate) {
      setPlates([
        {
          plate: "No detectada",
          status: "Desconocida",
          scannedAt: new Date().toLocaleTimeString(),
        },
        ...plates,
      ]);
      setProcessing(false);
      return;
    }

    try {
      const payload = {
        plate: scannedPlate,
        raw_text: scannedPlate,
        confidence: 0.95,
      };
      const res = await postData("/plates/check", payload, token);
      setPlates([
        {
          plate: res.plate,
          status: res.status,
          scannedAt: new Date().toLocaleTimeString(),
        },
        ...plates,
      ]);
    } catch (err) {
      console.error("Error escaneando placa:", err);
      setPlates([
        {
          plate: scannedPlate,
          status: "Error API",
          scannedAt: new Date().toLocaleTimeString(),
        },
        ...plates,
      ]);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Dashboard - Lector de Matrículas OCR</h1>

      <div className="mb-4">
        <button
          onClick={() => setCameraActive(!cameraActive)}
          className={`px-4 py-2 rounded text-white ${
            cameraActive ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {cameraActive ? "Detener Cámara" : "Activar Cámara"}
        </button>

        {cameraActive && (
          <button
            onClick={handleScan}
            className="ml-4 px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
            disabled={processing}
          >
            {processing ? "Procesando..." : "Escanear Placa"}
          </button>
        )}
      </div>

      {cameraActive && (
        <>
          <video ref={videoRef} autoPlay playsInline className="w-full max-w-md border rounded mb-4" />
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}

      <h2 className="text-xl font-semibold mb-2">Historial de Escaneos</h2>
      <div className="space-y-2">
        {plates.length === 0 && <p>No se han escaneado placas aún.</p>}
        {plates.map((p, index) => (
          <div
            key={index}
            className={`p-2 rounded ${
              p.status === "Requerida"
                ? "bg-red-200"
                : p.status === "Normal"
                ? "bg-green-200"
                : "bg-yellow-200"
            } flex justify-between`}
          >
            <span>{p.plate}</span>
            <span>{p.status}</span>
            <span className="text-gray-600">{p.scannedAt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
