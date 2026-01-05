// js/app.js

const form = document.getElementById('battery-form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Función auxiliar para obtener valores de forma segura y evitar el error "null"
    const getValue = (id) => {
        const el = document.getElementById(id);
        if (!el) {
            console.error(`Error: No se encontró el elemento con ID: ${id}`);
            return "";
        }
        return el.value;
    };

    // 1. Capturar datos coincidiendo EXACTAMENTE con los IDs del HTML
    const formData = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        deviceType: getDeviceType(),
        
        // Datos del Formulario
        refBateria: getValue('refBateria'),
        inspector: getValue('inspector'),
        fechaInspeccion: getValue('fechaInspeccion'),
        fechaFabricacion: getValue('fechaFabricacion'),
        fechaRecarga: getValue('fechaRecarga'),
        
        bornes: getValue('bornes'),
        calcomanias: getValue('calcomanias'),
        tapones: getValue('tapones'),
        fugas: getValue('fugas'),
        aspectoGeneral: getValue('aspectoGeneral'),
        
        carga: parseFloat(getValue('carga')) || 0,
        peso: parseFloat(getValue('peso')) || 0,
        formula: parseInt(getValue('formula')) || 0,
        dias: parseInt(getValue('dias')) || 0,
        
        observaciones: getValue('observaciones')
    };

    try {
        // 2. Guardar en IndexedDB (Capa Local)
        await saveLocal(formData);
        
        // 3. Feedback visual
        alert("REGISTRO GUARDADO LOCALMENTE");
        form.reset();

        // 4. Intentar sincronizar ahora mismo
        if (typeof syncData === 'function') {
            syncData();
        }
        
    } catch (err) {
        console.error("Error al guardar:", err);
        alert("Error crítico al guardar los datos.");
    }
});

// Detectar tipo de dispositivo
function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "Móvil";
    return "Desktop";
}

// Actualizar indicador de conexión
function updateOnlineStatus() {
    const statusDot = document.getElementById('online-status');
    const statusText = document.getElementById('status-text');
    
    if (navigator.onLine) {
        if(statusDot) statusDot.className = "h-2 w-2 rounded-full bg-green-600 mr-2";
        if(statusText) statusText.innerText = "Online";
        if (typeof syncData === 'function') syncData();
    } else {
        if(statusDot) statusDot.className = "h-2 w-2 rounded-full bg-red-600 mr-2";
        if(statusText) statusText.innerText = "Offline";
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();