/**
 * Admin Panel - Gestión de referencias de baterías
 * Login seguro con validación en servidor
 */

// ========== CONFIGURACIÓN ==========
const BATERIAS_STORAGE_KEY = 'baterias_referencias_admin';
const SESSION_KEY = 'admin_logged_in';
const TOKEN_KEY = 'admin_token';
let isLoggedIn = false;

// ========== VERIFICACIÓN DE AUTENTICACIÓN ==========

function verificarSesion() {
    const token = sessionStorage.getItem(TOKEN_KEY);
    isLoggedIn = !!token;
    
    if (isLoggedIn) {
        mostrarPanel();
    } else {
        mostrarLogin();
    }
}

function mostrarLogin() {
    document.getElementById('login-modal').classList.remove('hidden');
    document.querySelector('main').classList.add('hidden');
}

function mostrarPanel() {
    document.getElementById('login-modal').classList.add('hidden');
    document.querySelector('main').classList.remove('hidden');
    cargarBaterias();
}

// ========== MANEJO DEL LOGIN ==========

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const password = document.getElementById('admin-password').value;
    const errorMsg = document.getElementById('login-error');
    const submitBtn = document.querySelector('#login-form button[type="submit"]');
    
    // Deshabilitar botón y mostrar estado
    submitBtn.disabled = true;
    submitBtn.textContent = 'Validando...';
    errorMsg.classList.add('hidden');
    
    try {
        // Enviar contraseña a validar en servidor
        const response = await fetch('/.netlify/functions/admin-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: password })
        });

        const data = await response.json();

        if (data.ok) {
            // Guardar token en sesión
            sessionStorage.setItem(TOKEN_KEY, data.token);
            isLoggedIn = true;
            document.getElementById('admin-password').value = '';
            mostrarPanel();
        } else {
            errorMsg.textContent = '❌ ' + (data.error || 'Error en login');
            errorMsg.classList.remove('hidden');
            document.getElementById('admin-password').value = '';
        }
    } catch (error) {
        errorMsg.textContent = '❌ Error de conexión: ' + error.message;
        errorMsg.classList.remove('hidden');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '🔓 Acceder';
    }
});

// ========== MANEJO DEL LOGOUT ==========

document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem(TOKEN_KEY);
    isLoggedIn = false;
    location.reload();
});

// ========== GESTIÓN DE REFERENCIAS ==========

function obtenerBaterias() {
    const datos = localStorage.getItem(BATERIAS_STORAGE_KEY);
    return datos ? JSON.parse(datos) : [];
}

function guardarBaterias(baterias) {
    localStorage.setItem(BATERIAS_STORAGE_KEY, JSON.stringify(baterias));
    syncBateriasConIndexedDB(baterias);
    syncBateriasConServer(baterias);
}

async function syncBateriasConServer(baterias) {
    try {
        const response = await fetch('/.netlify/functions/send-to-sheets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'guardarReferencias',
                baterias: baterias,
                timestamp: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            console.log('✅ Referencias sincronizadas con Google Sheets');
        }
    } catch (error) {
        console.warn('⚠️ No se pudo sincronizar con servidor:', error.message);
    }
}

function syncBateriasConIndexedDB(baterias) {
    if (!window.indexedDB) return;
    
    const request = indexedDB.open('BateriasDB', 1);
    
    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('referencias')) {
            db.createObjectStore('referencias', { keyPath: 'id' });
        }
    };
    
    request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction('referencias', 'readwrite');
        const store = tx.objectStore('referencias');
        
        store.clear();
        baterias.forEach(b => store.add(b));
    };
}

function agregarBateria(datosForm) {
    const baterias = obtenerBaterias();
    
    if (baterias.some(b => b.referencia === datosForm.referencia)) {
        alert('❌ Esta referencia ya existe');
        return false;
    }
    
    const nuevaBateria = {
        id: datosForm.referencia,
        referencia: datosForm.referencia,
        cargaMin: parseFloat(datosForm.cargaMin),
        cargaMax: parseFloat(datosForm.cargaMax),
        pesoMin: parseFloat(datosForm.pesoMin),
        pesoMax: parseFloat(datosForm.pesoMax),
        fechaCreacion: new Date().toISOString()
    };
    
    if (nuevaBateria.cargaMin >= nuevaBateria.cargaMax) {
        alert('❌ La carga mínima debe ser menor a la máxima');
        return false;
    }
    
    if (nuevaBateria.pesoMin >= nuevaBateria.pesoMax) {
        alert('❌ El peso mínimo debe ser menor al máximo');
        return false;
    }
    
    baterias.push(nuevaBateria);
    guardarBaterias(baterias);
    
    console.log('✅ Batería agregada:', nuevaBateria);
    return true;
}

function eliminarBateria(referencia) {
    if (!confirm(`¿Eliminar la referencia ${referencia}?`)) {
        return false;
    }
    
    let baterias = obtenerBaterias();
    baterias = baterias.filter(b => b.referencia !== referencia);
    guardarBaterias(baterias);
    
    console.log('❌ Batería eliminada:', referencia);
    return true;
}


// ========== INTERFAZ DE USUARIO ==========

function cargarBaterias() {
    const baterias = obtenerBaterias();
    const listContainer = document.getElementById('baterias-list');
    
    if (baterias.length === 0) {
        listContainer.innerHTML = '<p class="text-gray-500 text-center py-8">No hay referencias configuradas aún</p>';
        return;
    }
    
    listContainer.innerHTML = baterias.map(bateria => `
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h3 class="text-lg font-bold text-blue-600">${bateria.referencia}</h3>
                    <div class="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div>
                            <span class="text-gray-600">Carga (Ah):</span>
                            <p class="font-semibold">${bateria.cargaMin} - ${bateria.cargaMax}</p>
                        </div>
                        <div>
                            <span class="text-gray-600">Peso (kg):</span>
                            <p class="font-semibold">${bateria.pesoMin} - ${bateria.pesoMax}</p>
                        </div>
                    </div>
                    <p class="text-xs text-gray-400 mt-2">
                        Creada: ${new Date(bateria.fechaCreacion).toLocaleDateString('es-ES')}
                    </p>
                </div>
                <button onclick="eliminarYRecargar('${bateria.referencia}')" 
                        class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-semibold transition">
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

function eliminarYRecargar(referencia) {
    if (eliminarBateria(referencia)) {
        cargarBaterias();
    }
}

function mostrarNotificacion(mensaje) {
    const notif = document.createElement('div');
    notif.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-[9998]';
    notif.textContent = mensaje;
    document.body.appendChild(notif);
    
    setTimeout(() => notif.remove(), 3000);
}

// ========== FORM SUBMISSION ==========

document.getElementById('admin-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const datosForm = {
        referencia: document.getElementById('ref-bateria').value.trim(),
        cargaMin: document.getElementById('carga-min').value,
        cargaMax: document.getElementById('carga-max').value,
        pesoMin: document.getElementById('peso-min').value,
        pesoMax: document.getElementById('peso-max').value
    };
    
    if (agregarBateria(datosForm)) {
        document.getElementById('admin-form').reset();
        cargarBaterias();
        mostrarNotificacion('✅ Batería agregada correctamente');
    }
});

// ========== INICIALIZACIÓN ==========

document.addEventListener('DOMContentLoaded', verificarSesion);
