// Este archivo gestiona la comunicación con Google Sheets a través de Google Apps Script, permitiendo enviar datos del formulario a una hoja de cálculo.

const API_CONFIG = {
    // REEMPLAZA con la URL que te dio Google al publicar como Web App
    url: "https://script.google.com/macros/s/AKfycbyV5epXHNj8tG9CpUbvXHt8AeVRbepZcuCmeqbUn0AxDIJppvZyasqwR71nn6hXLs4D/exec",
    // REEMPLAZA con tu clave (debe ser igual a la del Code.gs)
    key: "123KKj" 
};

async function sendToGoogleSheets(data) {
    // Verificar si el campo de días está en rojo (días >= 21)
    const diasAlerta = data.dias >= 21;
    
    // Añadimos la API Key y el estado de alerta al objeto de datos antes de enviar
    const payload = {
        ...data,
        apiKey: API_CONFIG.key,
        diasAlerta: diasAlerta  // Enviar si días >= 21
    };

    try {
        const response = await fetch(API_CONFIG.url, {
            method: "POST",
            mode: "no-cors", // Importante para Google Apps Script
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload)
        });

        // Nota: Con "no-cors", no podemos leer la respuesta JSON, 
        // pero si no hay excepción, asumimos que se envió.
        return { status: "success" };
    } catch (error) {
        console.error("Error en el envío:", error);
        return { status: "error", message: error.message };
    }
}