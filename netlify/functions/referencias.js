/**
 * Netlify Function: Obtener referencias desde Google Sheets
 * Lee directamente del Apps Script de Google
 */

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Método no permitido' })
    };
  }

  try {
    const GOOGLE_SHEET_URL = process.env.GOOGLE_SHEET_URL;

    if (!GOOGLE_SHEET_URL) {
      console.error('⚠️ GOOGLE_SHEET_URL no configurada en variables de entorno');
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ok: false,
          error: 'Google Sheet no configurada'
        })
      };
    }

    console.log('[Referencias] Obteniendo desde Google Sheets...');

    // Llamar al Apps Script de Google
    const response = await fetch(GOOGLE_SHEET_URL, {
      method: 'GET',
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`Google Sheets respondió con status ${response.status}`);
    }

    const text = await response.text();
    let referencias = [];

    try {
      referencias = JSON.parse(text);
      if (!Array.isArray(referencias)) {
        referencias = [];
      }
    } catch (parseError) {
      console.warn('[Referencias] Respuesta no es JSON válido, retornando array vacío');
    }

    console.log(`✅ [Referencias] ${referencias.length} referencias obtenidas`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=300' // Cache de 5 minutos
      },
      body: JSON.stringify({
        ok: true,
        referencias: referencias,
        count: referencias.length,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('❌ [Referencias] Error:', error.message);

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};