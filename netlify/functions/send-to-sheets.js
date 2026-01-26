/**
 * Netlify Function: Guardar inspecciones en Google Sheets
 * Proxy seguro que reenvía datos de inspecciones a Google Apps Script
 */

exports.handler = async (event, context) => {
  // Solo acepta POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Método no permitido' })
    };
  }

  try {
    // Obtener URL del Google Apps Script desde variables de entorno
    const GOOGLE_SHEET_URL = process.env.GOOGLE_SHEET_URL;

    if (!GOOGLE_SHEET_URL) {
      console.error('⚠️ GOOGLE_SHEET_URL no configurada');
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ok: false,
          error: 'Google Sheet no configurada en el servidor'
        })
      };
    }

    // Parsear datos de la inspección
    const datos = JSON.parse(event.body);

    console.log('[Guardar Inspección] Enviando a Google Sheets...');

    // Enviar a Google Apps Script (pasar todos los datos)
    const response = await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    });

    if (!response.ok) {
      throw new Error(`Google Sheets respondió con status ${response.status}`);
    }

    const result = await response.json();

    console.log(`✅ [Guardar Inspección] Éxito para referencia: ${datos.refBateria}`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: true,
        message: 'Inspección guardada en Google Sheets',
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('❌ [Guardar Inspección] Error:', error.message);

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: false,
        error: error.message
      })
    };
  }
};
