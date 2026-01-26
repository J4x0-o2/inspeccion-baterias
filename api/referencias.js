/**
 * Vercel API: Obtener referencias desde Google Sheets
 * Lee directamente del Apps Script de Google
 */

export default async function handler(req, res) {
  // Solo acepta GET
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' });
  }

  try {
    const GOOGLE_SHEET_URL = process.env.GOOGLE_SHEET_URL;

    if (!GOOGLE_SHEET_URL) {
      console.error('⚠️ GOOGLE_SHEET_URL no configurada en variables de entorno');
      return res.status(500).json({
        ok: false,
        error: 'Google Sheet no configurada en vercel.json'
      });
    }

    console.log('[Referencias] URL:', GOOGLE_SHEET_URL.substring(0, 80) + '...');
    console.log('[Referencias] Obteniendo desde Google Sheets...');

    // Agregar parámetro v= para evitar caché y forzar ejecución fresca
    const url = GOOGLE_SHEET_URL + '?v=' + new Date().getTime();
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    console.log('[Referencias] Status de Google:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Google respondió con ${response.status}: ${errorText.substring(0, 200)}`);
      throw new Error(`Google Sheets error: ${response.status}`);
    }

    const text = await response.text();
    console.log('[Referencias] Response raw length:', text.length);
    
    let referencias = [];

    // Intentar parsear como JSON
    try {
      referencias = JSON.parse(text);
      if (!Array.isArray(referencias)) {
        console.warn('[Referencias] Respuesta no es un array:', typeof referencias);
        referencias = [];
      }
    } catch (parseError) {
      console.error('[Referencias] Error parseando JSON:', parseError.message);
      console.error('[Referencias] Primeros 500 caracteres:', text.substring(0, 500));
      referencias = [];
    }

    console.log(`✅ [Referencias] ${referencias.length} referencias obtenidas`);

    res.setHeader('Cache-Control', 'max-age=300'); // Cache de 5 minutos
    return res.status(200).json({
      ok: true,
      referencias: referencias,
      count: referencias.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Referencias] Error:', error.message);

    return res.status(500).json({
      ok: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
