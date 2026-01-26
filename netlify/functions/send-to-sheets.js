/**
 * Netlify Function: Proxy seguro para Google Sheets
 * Las credenciales se almacenan como variables de entorno en Netlify
 * El cliente NO tiene acceso directo a las credenciales
 */

exports.handler = async (event, context) => {
  // Solo acepta POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    // Obtener credenciales desde variables de entorno
    const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_URL;
    const GOOGLE_SHEETS_KEY = process.env.GOOGLE_SHEETS_KEY;

    if (!GOOGLE_SHEETS_URL || !GOOGLE_SHEETS_KEY) {
      console.error('Variables de entorno no configuradas');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Configuración del servidor incompleta' })
      };
    }

    // Parsear datos del cliente
    const data = JSON.parse(event.body);

    // Construir payload con credenciales seguras
    const payload = {
      ...data,
      apiKey: GOOGLE_SHEETS_KEY,
      timestamp: new Date().toISOString()
    };

    // Enviar a Google Sheets
    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    // Registrar resultado
    console.log(`[Google Sheets Sync] Status: ${response.status}, Data: ${JSON.stringify(data)}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        message: 'Datos sincronizados correctamente',
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Error en send-to-sheets:', error.message);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: error.message
      })
    };
  }
};
