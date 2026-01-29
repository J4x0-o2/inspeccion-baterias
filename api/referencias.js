/**
 * Vercel API: Obtener referencias de baterías
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

    // Fallback: referencias hardcodeadas como último recurso
    const fallbackRefs = [
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

    return res.status(200).json({
      ok: true,
      referencias: fallbackRefs,
      count: fallbackRefs.length,
      timestamp: new Date().toISOString()
    });
  }
}
  }
}
