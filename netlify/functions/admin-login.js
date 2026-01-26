/**
 * Netlify Function: Validar contraseña de admin
 * Compara contra variable de entorno segura
 */

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    const datos = JSON.parse(event.body);
    const passwordIngresada = datos.password;

    // Obtener contraseña desde variable de entorno
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_PASSWORD) {
      console.error('Variable ADMIN_PASSWORD no configurada');
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: 'Configuración incompleta' })
      };
    }

    // Validar contraseña
    if (passwordIngresada === ADMIN_PASSWORD) {
      // Generar token simple (timestamp + hash)
      const token = Buffer.from(`${Date.now()}:${ADMIN_PASSWORD}`).toString('base64');

      console.log('[Admin Login] ✅ Login exitoso');

      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          token: token,
          message: 'Login exitoso',
          timestamp: new Date().toISOString()
        })
      };
    } else {
      console.warn('[Admin Login] ❌ Contraseña incorrecta');

      return {
        statusCode: 401,
        body: JSON.stringify({
          ok: false,
          error: 'Contraseña incorrecta'
        })
      };
    }

  } catch (error) {
    console.error('Error en admin-login:', error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: error.message
      })
    };
  }
};
