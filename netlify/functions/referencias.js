/**
 * Netlify Function: Gestión de referencias (Lee/Escribe en Google Sheets)
 */

exports.handler = async (event, context) => {
  if (!['GET', 'POST'].includes(event.httpMethod)) {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_URL;
    const GOOGLE_SHEETS_KEY = process.env.GOOGLE_SHEETS_KEY;

    if (!GOOGLE_SHEETS_URL || !GOOGLE_SHEETS_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Configuración incompleta' })
      };
    }

    // GET: Obtener referencias desde Google Sheets
    if (event.httpMethod === 'GET') {
      const response = await fetch(GOOGLE_SHEETS_URL + '?action=getReferencias', {
        method: 'GET'
      });

      const text = await response.text();
      
      try {
        const referencias = JSON.parse(text);
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ok: true,
            referencias: Array.isArray(referencias) ? referencias : [],
            timestamp: new Date().toISOString()
          })
        };
      } catch (e) {
        // Si no es JSON válido, retornar array vacío
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ok: true,
            referencias: [],
            timestamp: new Date().toISOString()
          })
        };
      }
    }

    // POST: Guardar referencias en Google Sheets
    if (event.httpMethod === 'POST') {
      const datos = JSON.parse(event.body);

      const payload = {
        action: 'guardarReferencias',
        apiKey: GOOGLE_SHEETS_KEY,
        baterias: datos.baterias || [],
        timestamp: new Date().toISOString()
      };

      const response = await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      console.log(`[Referencias] Guardadas: ${payload.baterias.length} referencias`);

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ok: true,
          message: 'Referencias guardadas en Google Sheets',
          count: payload.baterias.length,
          timestamp: new Date().toISOString()
        })
      };
    }

  } catch (error) {
    console.error('Error en referencias:', error.message);
    
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

