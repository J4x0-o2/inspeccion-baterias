# Configuración de Google Sheets para Inspección de Baterías

## Estructura General

Un único **Google Sheet** con **DOS HOJAS (pestañas)**:
1. **"Referencias"** - Catálogo de referencias de baterías
2. **"Inspecciones"** - Registro de inspecciones realizadas

---

## Instrucciones Paso a Paso

### 1. Crear Google Sheet

- Ve a [sheets.google.com](https://sheets.google.com)
- Crea una hoja nueva con el nombre: **"Inspección Baterías"**

### 2. Crear las DOS hojas (pestañas)

#### **Hoja 1: "Referencias"**

| Referencia | Descripción | Estado |
|-----------|------------|--------|
| 244105506R | Batería modelo 1 | Activa |
| 244103318R | Batería modelo 2 | Activa |

- **Fila 1 (Encabezados)**: `Referencia`, `Descripción`, `Estado`
- **Filas siguientes**: Datos de referencias

#### **Hoja 2: "Inspecciones"**

| Referencia | Inspector | Carga (V) | Peso (kg) | Días | Fórmula | Observaciones | Fecha | Estado |
|-----------|-----------|----------|----------|------|---------|---------------|-------|--------|
| 244105506R | Juan Pérez | 12.5 | 18.3 | 45 | 0 | Batería OK | 2026-01-20 | Aceptada |

- **Fila 1 (Encabezados)**: `Referencia`, `Inspector`, `Carga (V)`, `Peso (kg)`, `Días`, `Fórmula`, `Observaciones`, `Fecha`, `Estado`
- **Filas siguientes**: Se llenarán automáticamente desde la app

### 3. Crear Google Apps Script

- Abre el Sheet
- Ve a **Extensiones > Apps Script**
- Reemplaza todo el contenido con este código:

```javascript
const REFERENCIAS_SHEET = "Referencias";
const INSPECCIONES_SHEET = "Inspecciones";

/**
 * OBTENER REFERENCIAS
 * GET request para obtener el catálogo de referencias
 */
function doGet(e) {
  const action = e.parameter.action || "getReferencias";
  
  if (action === "getReferencias") {
    return obtenerReferencias();
  } else if (action === "getInspecciones") {
    return obtenerInspecciones();
  }
  
  return ContentService.createTextOutput(
    JSON.stringify({ error: "Acción no reconocida" })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * GUARDAR INSPECCIÓN
 * POST request para guardar nuevas inspecciones
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(INSPECCIONES_SHEET);
    
    if (!sheet) {
      return ContentService.createTextOutput(
        JSON.stringify({ ok: false, error: "Hoja Inspecciones no encontrada" })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Agregar fila con los datos de la inspección
    sheet.appendRow([
      data.refBateria || "",
      data.inspector || "",
      data.carga || "",
      data.peso || "",
      data.dias || "",
      data.formula || "",
      data.observaciones || "",
      data.fecha || new Date().toISOString().split('T')[0],
      data.estado || "Pendiente"
    ]);
    
    console.log(`[Inspección] Guardada para referencia: ${data.refBateria}`);
    
    return ContentService.createTextOutput(
      JSON.stringify({ 
        ok: true, 
        message: "Inspección guardada en Google Sheets"
      })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error("Error en doPost:", error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * OBTENER REFERENCIAS desde la hoja "Referencias"
 */
function obtenerReferencias() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(REFERENCIAS_SHEET);
    
    if (!sheet) {
      return ContentService.createTextOutput(
        JSON.stringify([])
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const referencias = [];
    
    // Omitir encabezado (primera fila)
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) { // Si hay contenido en la columna Referencia
        referencias.push({
          referencia: data[i][0],
          descripcion: data[i][1] || "",
          estado: data[i][2] || "Activa"
        });
      }
    }
    
    console.log(`[Referencias] Devueltas: ${referencias.length}`);
    
    return ContentService.createTextOutput(
      JSON.stringify(referencias)
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error("Error en obtenerReferencias:", error.toString());
    return ContentService.createTextOutput(
      JSON.stringify([])
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * OBTENER INSPECCIONES desde la hoja "Inspecciones"
 */
function obtenerInspecciones() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(INSPECCIONES_SHEET);
    
    if (!sheet) {
      return ContentService.createTextOutput(
        JSON.stringify([])
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const inspecciones = [];
    
    // Omitir encabezado (primera fila)
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) { // Si hay contenido en la columna Referencia
        inspecciones.push({
          referencia: data[i][0],
          inspector: data[i][1] || "",
          carga: data[i][2] || "",
          peso: data[i][3] || "",
          dias: data[i][4] || "",
          formula: data[i][5] || "",
          observaciones: data[i][6] || "",
          fecha: data[i][7] || "",
          estado: data[i][8] || ""
        });
      }
    }
    
    console.log(`[Inspecciones] Devueltas: ${inspecciones.length}`);
    
    return ContentService.createTextOutput(
      JSON.stringify(inspecciones)
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error("Error en obtenerInspecciones:", error.toString());
    return ContentService.createTextOutput(
      JSON.stringify([])
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 4. Desplegar el Apps Script

- Haz clic en **"Implementar"** (Deploy)
- Selecciona **"Nueva implementación"**
- Tipo: **"Aplicación web"**
- Ejecutar como: Tu cuenta de Google
- Quién tiene acceso: **"Cualquiera que tenga el enlace"**
- Copia la URL de implementación

Ejemplo de URL:
```
https://script.google.com/macros/s/AKfycbyV5epZcuCmeqbUn0AxDIJppvZyasqwR71nn6hXLs4D/usercurrentapp
```

### 5. Configurar Netlify Environment Variables

Ve a tu sitio en [netlify.com](https://netlify.com):
1. **Site settings > Build & deploy > Environment**
2. Agrega esta variable:
   - `GOOGLE_SHEET_URL`: La URL del Apps Script que copiaste

Ejemplo:
```
GOOGLE_SHEET_URL = https://script.google.com/macros/s/AKfycbyV5epZcuCmeqbUn0AxDIJppvZyasqwR71nn6hXLs4D/usercurrentapp
```

### 6. Cómo funciona

✅ **Lectura de Referencias:**
- La app lee automáticamente cada hora desde la hoja "Referencias"
- Cualquier cambio en Google Sheets se refleja en el formulario

✅ **Guardado de Inspecciones:**
- Cada inspección se guarda en Google Sheets automáticamente
- Los datos se almacenan en la hoja "Inspecciones"
- También se guardan localmente en IndexedDB

✅ **Sin Admin:**
- No hay panel de admin
- Todo se gestiona directamente en Google Sheets
- Los cambios se sincronizan automáticamente

### 7. Ejemplo de Flujo

1. **Modifica referencias en Google Sheets** → Hoja "Referencias"
2. **App sincroniza automáticamente** → Cada hora
3. **Los cambios aparecen en el formulario** → Sin reload necesario
4. **Completa inspección y guarda** → Se envía a Sheets (hoja "Inspecciones")
5. **Ves los datos en Google Sheets** → Todo centralizado

---

## Resumen Visual

```
┌─────────────────────────────────────────┐
│  Google Sheet: "Inspección Baterías"    │
├─────────────────────────────────────────┤
│                                         │
│  📋 Hoja 1: "Referencias"              │
│  ├─ Referencia                         │
│  ├─ Descripción                        │
│  └─ Estado                             │
│                                         │
│  📊 Hoja 2: "Inspecciones"             │
│  ├─ Referencia                         │
│  ├─ Inspector                          │
│  ├─ Carga, Peso, Días, Fórmula         │
│  ├─ Observaciones                      │
│  └─ Fecha, Estado                      │
│                                         │
└─────────────────────────────────────────┘
```

¡Listo! Todo en un solo Sheet con dos hojas bien organizadas.
