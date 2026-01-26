/**
 * Google Apps Script para Inspección de Baterías
 * Gestiona referencias e inspecciones en Google Sheets
 */

// ========== CONFIGURACIÓN ==========
const API_KEY = "123KKj"; // Cambiar por un string aleatorio
const SHEET_NAME = "Inspecciones";
const REFERENCIAS_SHEET = "Referencias";

// ========== FUNCIÓN PRINCIPAL - POST ==========

function doPost(e) {
  const res = { status: "error", message: "Unknown error" };
  
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Determinar acción
    if (data.action === "getReferencias") {
      return handleGetReferencias();
    } else if (data.action === "guardarReferencias") {
      return handleGuardarReferencias(data);
    } else {
      // Acción por defecto: guardar inspección
      return handleGuardarInspeccion(data);
    }

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: error.message 
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

// ========== FUNCIÓN PRINCIPAL - GET ==========

function doGet(e) {
  try {
    if (e.parameter.action === "getReferencias") {
      return handleGetReferencias();
    }
    // Si no hay acción, devolver referencias (default)
    return handleGetReferencias();
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: error.message 
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

// ========== MANEJO DE INSPECCIONES ==========

function handleGuardarInspeccion(data) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // Crear hoja si no existe
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      // Agregar encabezados
      sheet.appendRow([
        "ID Registro",
        "Fecha Servidor",
        "Referencia",
        "F. Inspección",
        "F. Fabricación",
        "F. Recarga",
        "Bornes",
        "Calcomanías",
        "Tapones",
        "Aspecto",
        "Fugas",
        "Carga",
        "Peso",
        "Fórmula",
        "Días",
        "Observaciones",
        "Inspector",
        "Dispositivo"
      ]);
    }

    // Evitar duplicados
    const ids = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues().flat();
    if (ids.includes(data.id)) {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        message: "Ya registrado" 
      }))
      .setMimeType(ContentService.MimeType.JSON);
    }

    // Insertar datos
    sheet.appendRow([
      data.id || "",
      new Date(),
      data.refBateria || "",
      data.fechaInspeccion || "",
      data.fechaFabricacion || "",
      data.fechaRecarga || "",
      data.bornes || "",
      data.calcomanias || "",
      data.tapones || "",
      data.aspectoGeneral || "",
      data.fugas || "",
      data.carga || "",
      data.peso || "",
      data.formula || "",
      data.dias || "",
      data.observaciones || "",
      data.inspector || "",
      data.deviceType || ""
    ]);

    Logger.log("[✅ Inspección] Guardada para: " + data.refBateria);

    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success",
      message: "Inspección guardada"
    }))
    .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("[❌ Error] Guardar inspección: " + error.message);
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: error.message 
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

// ========== MANEJO DE REFERENCIAS ==========

function handleGetReferencias() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(REFERENCIAS_SHEET);
    
    if (!sheet) {
      Logger.log("[⚠️ Referencias] Hoja no encontrada");
      return ContentService.createTextOutput(JSON.stringify([]))
             .setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    
    // Saltar encabezado (primera fila)
    const referencias = data.slice(1).map(row => ({
      referencia: row[0],
      cargaMin: parseFloat(row[1]) || 0,
      cargaMax: parseFloat(row[2]) || 0,
      pesoMin: parseFloat(row[3]) || 0,
      pesoMax: parseFloat(row[4]) || 0
    })).filter(r => r.referencia && r.referencia.trim() !== "");

    Logger.log("[✅ Referencias] " + referencias.length + " referencias obtenidas");

    return ContentService.createTextOutput(JSON.stringify(referencias))
           .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("[❌ Error] getReferencias: " + error.message);
    return ContentService.createTextOutput(JSON.stringify([]))
           .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleGuardarReferencias(data) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(REFERENCIAS_SHEET);
    
    // Crear hoja si no existe
    if (!sheet) {
      sheet = spreadsheet.insertSheet(REFERENCIAS_SHEET);
      sheet.appendRow([
        "Referencia",
        "Carga Min",
        "Carga Max",
        "Peso Min",
        "Peso Max"
      ]);
    }

    // Limpiar datos antiguos (mantener encabezado)
    if (sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
    }

    // Insertar nuevas referencias
    if (data.baterias && Array.isArray(data.baterias)) {
      data.baterias.forEach(bateria => {
        sheet.appendRow([
          bateria.referencia || "",
          bateria.cargaMin || "",
          bateria.cargaMax || "",
          bateria.pesoMin || "",
          bateria.pesoMax || ""
        ]);
      });
    }

    Logger.log("[✅ Referencias] " + (data.baterias ? data.baterias.length : 0) + " guardadas");

    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      message: "Referencias guardadas",
      count: data.baterias ? data.baterias.length : 0
    }))
    .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("[❌ Error] guardarReferencias: " + error.message);
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: error.message 
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}
