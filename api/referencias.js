/**
 * Devuelve las referencias base definidas en config.js
 * Solo referencias públicas, sin datos sensibles
 */

// Importar referencias base desde config.js
const config = require('../js/config.js');

export default async function handler(req, res) {
  // Solo acepta GET
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' });
  }

  try {
    // Obtener referencias base de config.js
    const referencias = config.REFERENCIAS_BASE || [];
    
    console.log(`[Referencias] Devolviendo ${referencias.length} referencias base`);

    // Cache por 24 horas
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    return res.status(200).json({
      ok: true,
      referencias: referencias,
      count: referencias.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Referencias] Error:', error.message);

    // Fallback: usar referencias de config.js como último recurso
    const fallbackRefs = config.REFERENCIAS_BASE || [];

    return res.status(200).json({
      ok: true,
      referencias: fallbackRefs,
      count: fallbackRefs.length,
      timestamp: new Date().toISOString()
    });
  }
}
