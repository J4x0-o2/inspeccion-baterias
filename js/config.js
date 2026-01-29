// ============================================
// CONFIGURACIÓN GENERAL DE LA APP
// ============================================
// Credenciales sensibles se obtienen desde variables de entorno (Vercel)
// Las referencias base se definen aquí para uso offline

// REFERENCIAS BASE (HARDCODEADAS)
const REFERENCIAS_BASE = [
  {
    id: "1",
    referencia: "244105506R",
    cargaMin: 12.7,
    cargaMax: 12.95,
    pesoMin: 14.8,
    pesoMax: 16.1
  },
  {
    id: "2",
    referencia: "244103318R",
    cargaMin: 12.7,
    cargaMax: 13.01,
    pesoMin: 16.55,
    pesoMax: 17.97
  }
];

// CREDENCIALES: Se obtienen desde variables de entorno (Vercel)
// En desarrollo local, usar .env.local o similar
// En producción (Vercel), están configuradas en Settings > Environment Variables
const API_ENDPOINTS = {
    googleSheets: {
        url: process.env.GOOGLE_SHEETS_URL || "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
        key: process.env.GOOGLE_SHEETS_KEY || "YOUR_KEY"
    }
};

// Función para obtener referencias base
function getReferenciasBase() {
    return REFERENCIAS_BASE;
}

// Función para obtener configuración de forma segura (solo desde sync.js)
function getAPIConfig() {
    return API_ENDPOINTS.googleSheets;
}

