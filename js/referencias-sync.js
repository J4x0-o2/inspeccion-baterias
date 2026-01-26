/**
 * SINCRONIZADOR DE REFERENCIAS DESDE GOOGLE SHEETS
 * Lee referencias con rangos de carga y peso
 * Actualiza validaciones del formulario dinámicamente
 */

const REFERENCIAS_STORAGE_KEY = 'baterias_referencias_cache';
const REFERENCIAS_TIMESTAMP_KEY = 'baterias_referencias_timestamp';
const SYNC_INTERVAL = 60 * 60 * 1000; // 1 hora

// ========== FUNCIONES DE ALMACENAMIENTO ==========

function guardarReferenciasEnCache(referencias) {
  localStorage.setItem(REFERENCIAS_STORAGE_KEY, JSON.stringify(referencias));
  localStorage.setItem(REFERENCIAS_TIMESTAMP_KEY, new Date().getTime().toString());
  console.log(`💾 [Referencias] Cacheadas: ${referencias.length}`);
}

function obtenerReferenciasDelCache() {
  try {
    const cached = localStorage.getItem(REFERENCIAS_STORAGE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch (e) {
    console.error('❌ Error al obtener referencias del cache:', e);
    return [];
  }
}

// ========== OBTENER REFERENCIA PARA VALIDAR ==========

function obtenerReferencia(codigo) {
  const cached = obtenerReferenciasDelCache();
  return cached.find(r => r.referencia === codigo);
}

// ========== SINCRONIZACIÓN CON GOOGLE SHEETS ==========

async function sincronizarReferenciasDesdeSheets() {
  try {
    console.log('[📡 Referencias] Obteniendo de Google Sheets...');
    
    const response = await fetch('/api/referencias', {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const referencias = data.referencias || [];

    // Validar que tengamos referencias válidas
    if (Array.isArray(referencias) && referencias.length > 0) {
      guardarReferenciasEnCache(referencias);
      actualizarSelectReferencias(referencias);
      console.log(`✅ [Referencias] ${referencias.length} sincronizadas`);
      return referencias;
    } else {
      console.warn('⚠️ [Referencias] No hay referencias en Google Sheets');
      // Intentar con cache
      const cached = obtenerReferenciasDelCache();
      if (cached.length > 0) {
        console.log(`📱 [Referencias] Usando ${cached.length} referencias cacheadas`);
        actualizarSelectReferencias(cached);
        return cached;
      }
      return [];
    }
  } catch (error) {
    console.warn('⚠️ [Referencias] Error al sincronizar:', error.message);
    // Retornar referencias cacheadas como fallback
    const cached = obtenerReferenciasDelCache();
    if (cached.length > 0) {
      console.log(`📱 [Referencias] Usando ${cached.length} referencias del cache local`);
      actualizarSelectReferencias(cached);
    } else {
      console.error('❌ [Referencias] No hay referencias disponibles (sin cache)');
    }
    return cached;
  }
}

// ========== ACTUALIZAR SELECT DE REFERENCIAS ==========

function actualizarSelectReferencias(referencias) {
  const select = document.getElementById('refBateria');
  if (!select) {
    console.warn('⚠️ Select #refBateria no encontrado');
    return;
  }

  // Obtener el valor actual seleccionado
  const valorActual = select.value;

  // Mantener el placeholder
  const placeholder = select.options[0];
  
  // Limpiar opciones (excepto placeholder)
  while (select.options.length > 1) {
    select.remove(1);
  }

  // Cambiar placeholder según disponibilidad
  if (referencias.length === 0) {
    placeholder.text = '-- Sin referencias disponibles --';
  } else {
    placeholder.text = '-- Seleccionar referencia --';
  }

  // Agregar nuevas opciones
  referencias.forEach(ref => {
    const valor = ref.referencia;
    const label = `${valor}`;
    
    const option = document.createElement('option');
    option.value = valor;
    option.text = label;
    option.dataset.cargaMin = ref.cargaMin || '';
    option.dataset.cargaMax = ref.cargaMax || '';
    option.dataset.pesoMin = ref.pesoMin || '';
    option.dataset.pesoMax = ref.pesoMax || '';
    select.appendChild(option);
  });

  // Restaurar valor anterior si aún existe
  if (valorActual) {
    const existe = select.querySelector(`option[value="${valorActual}"]`);
    if (existe) {
      select.value = valorActual;
    }
  }

  console.log(`✅ [Referencias] Select actualizado: ${referencias.length} referencias`);
}

// ========== CARGAR REFERENCIAS AL INICIAR ==========

async function inicializarReferencias() {
  console.log('[🚀 Referencias] Inicializando...');
  
  // Primero cargar del cache para UX rápida
  const cached = obtenerReferenciasDelCache();
  if (cached.length > 0) {
    console.log(`📱 [Referencias] Mostrando ${cached.length} referencias del cache`);
    actualizarSelectReferencias(cached);
  }
  
  // Luego sincronizar con Google Sheets (actualiza si hay cambios)
  const referencias = await sincronizarReferenciasDesdeSheets();
  
  if (referencias.length === 0 && cached.length === 0) {
    console.warn('⚠️ [Referencias] No hay referencias disponibles');
  }
}

// ========== SINCRONIZACIÓN AUTOMÁTICA PERIÓDICA ==========

function iniciarSincronizacionPeriodica() {
  // Sincronizar cada hora
  setInterval(async () => {
    console.log('[⏰ Referencias] Verificando cambios...');
    await sincronizarReferenciasDesdeSheets();
  }, SYNC_INTERVAL);
  
  console.log(`✅ [Referencias] Sincronización automática activada (cada 60 min)`);
}

// ========== INICIAR TODO AL CARGAR ==========

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    inicializarReferencias();
    iniciarSincronizacionPeriodica();
  });
} else {
  inicializarReferencias();
  iniciarSincronizacionPeriodica();
}
