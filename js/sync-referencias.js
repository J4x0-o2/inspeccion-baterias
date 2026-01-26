/**
 * SINCRONIZADOR DE REFERENCIAS MEJORADO
 * Verifica cambios en Google Sheets y actualiza automáticamente
 * Sin necesidad de reload
 */

const SYNC_INTERVAL = 60 * 60 * 1000; // 1 hora
const REFERENCIAS_HASH_KEY = 'referencias_hash';
const REFERENCIAS_SYNC_KEY = 'referencias_ultima_sincro';

// ========== CÁLCULO DE HASH ==========

function calcularHash(referencias) {
    const str = JSON.stringify(referencias);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
}

function obtenerHashLocal() {
    return localStorage.getItem(REFERENCIAS_HASH_KEY) || '';
}

function guardarHashLocal(hash) {
    localStorage.setItem(REFERENCIAS_HASH_KEY, hash);
    localStorage.setItem(REFERENCIAS_SYNC_KEY, new Date().toISOString());
}

// ========== VERIFICACIÓN Y ACTUALIZACIÓN ==========

async function verificarYActualizarReferencias() {
    try {
        console.log('[Sync Referencias] Verificando cambios...');
        
        const response = await fetch('/.netlify/functions/referencias', {
            method: 'GET',
            cache: 'no-cache'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        const referencias = data.referencias || [];
        
        if (!Array.isArray(referencias)) {
            console.warn('[Sync Referencias] Respuesta inválida');
            return false;
        }
        
        const hashRemoto = calcularHash(referencias);
        const hashLocal = obtenerHashLocal();
        
        // Primera vez
        if (!hashLocal) {
            guardarHashLocal(hashRemoto);
            console.log('[Sync Referencias] ✅ Referencias inicializadas');
            return false;
        }
        
        // Detectar cambios
        if (hashRemoto !== hashLocal) {
            console.log('[Sync Referencias] 🔄 Cambios detectados');
            guardarHashLocal(hashRemoto);
            
            // Actualizar el select sin reload
            actualizarSelectReferencias(referencias);
            mostrarNotificacionActualizacion();
            
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.warn('[Sync Referencias] ⚠️ Error:', error.message);
        return false;
    }
}

// ========== ACTUALIZAR SELECT SIN RELOAD ==========

function actualizarSelectReferencias(referencias) {
    const select = document.getElementById('refBateria');
    if (!select) {
        console.warn('[Sync Referencias] Select no encontrado');
        return;
    }
    
    const valorActual = select.value;
    
    // Limpiar opciones (excepto placeholder)
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Agregar nuevas opciones
    referencias.forEach(ref => {
        const valor = ref.referencia || ref;
        const opcion = document.createElement('option');
        opcion.value = valor;
        opcion.text = valor;
        select.appendChild(opcion);
    });
    
    // Restaurar selección si existía
    if (valorActual && select.querySelector(`option[value="${valorActual}"]`)) {
        select.value = valorActual;
    }
    
    console.log(`[Sync Referencias] ✅ Select actualizado: ${referencias.length} referencias`);
}

// ========== NOTIFICACIÓN DE ACTUALIZACIÓN ==========

function mostrarNotificacionActualizacion() {
    // Remover notificación anterior si existe
    const notifAnterior = document.getElementById('referencias-update-notification');
    if (notifAnterior) {
        notifAnterior.remove();
    }
    
    const notif = document.createElement('div');
    notif.id = 'referencias-update-notification';
    notif.className = 'fixed top-20 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-[9998] animate-bounce';
    notif.innerHTML = `
        <p class="font-semibold">✅ Referencias actualizadas</p>
        <p class="text-sm opacity-90">Se sincronizaron nuevas referencias de Google Sheets</p>
    `;
    
    document.body.appendChild(notif);
    
    // Remover automáticamente después de 5 segundos
    setTimeout(() => {
        notif.style.transition = 'opacity 0.5s';
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 500);
    }, 5000);
}

// ========== INICIALIZACIÓN ==========

function iniciarSincronizadorReferencias() {
    // Verificar inmediatamente
    verificarYActualizarReferencias();
    
    // Luego cada 1 hora
    setInterval(() => {
        verificarYActualizarReferencias();
    }, SYNC_INTERVAL);
    
    console.log('[Sync Referencias] ✅ Sincronizador iniciado (cada 60 minutos)');
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarSincronizadorReferencias);
} else {
    iniciarSincronizadorReferencias();
}
