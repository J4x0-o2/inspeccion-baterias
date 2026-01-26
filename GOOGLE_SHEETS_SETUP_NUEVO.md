# Configuración de Google Sheets - Inspección de Baterías

## 📋 Estructura del Google Sheet

**UN único Google Sheet** con **DOS hojas (pestañas)**:
1. **"Referencias"** - Catálogo con rangos de validación
2. **"Inspecciones"** - Registro de inspecciones

---

## 🚀 Pasos de Configuración

### 1️⃣ Crear el Google Sheet Base

- Ve a [sheets.google.com](https://sheets.google.com)
- Crea un nuevo Sheet con nombre: **"Inspección Baterías"**
- Renombra la primera hoja a **"Referencias"**
- Agrega una segunda hoja llamada **"Inspecciones"**

### 2️⃣ Configurar la Hoja "Referencias"

**Encabezados (Fila 1) - EXACTAMENTE así:**

```
Referencia | Carga Min | Carga Max | Peso Min | Peso Max
```

**Datos de ejemplo (Filas 2+):**

```
244105506R | 12.70 | 12.95 | 14.80 | 16.10
244103318R | 12.70 | 13.00 | 16.55 | 17.97
```

### 3️⃣ Configurar la Hoja "Inspecciones"

**Encabezados (Fila 1) - Se crean automáticamente:**

```
ID Registro | Fecha Servidor | Referencia | F. Inspección | F. Fabricación | 
F. Recarga | Bornes | Calcomanías | Tapones | Aspecto | Fugas | Carga | 
Peso | Fórmula | Días | Observaciones | Inspector | Dispositivo
```

**Nota:** Esta hoja se llena automáticamente desde la app.

### 4️⃣ Crear el Google Apps Script

1. Abre tu Google Sheet **"Inspección Baterías"**
2. Ve a **Extensiones > Apps Script**
3. Borra todo el código por defecto
4. **Copia y pega el contenido completo del archivo `code.gs`** de esta carpeta
5. Haz clic en **"Guardar"** (Ctrl+S)

### 5️⃣ Desplegar el Apps Script

1. Haz clic en el botón **"Implementar"** (Deploy)
2. Selecciona **"Nueva implementación"**
3. Tipo: **Aplicación web**
4. Ejecutar como: **Tu cuenta de Google**
5. Quién tiene acceso: **Cualquiera que tenga el enlace**
6. **Copia la URL** que aparece (se verá así):

```
https://script.google.com/macros/s/AKfycbyV5epZcuCmeqbUn0AxDIJppvZyasqwR71nn6hXLs4D/usercurrentapp
```

⚠️ **GUARDA ESTA URL**, la necesitarás para Netlify.

### 6️⃣ Configurar Netlify

1. Ve a tu sitio en [netlify.com](https://netlify.com)
2. **Site settings > Build & deploy > Environment variables**
3. Haz clic en **"Add environment variable"**
4. Nombre: `GOOGLE_SHEET_URL`
5. Valor: Pega la URL de tu Apps Script
6. Haz clic en **"Deploy site"** para que los cambios tomen efecto

Resultado:
```
GOOGLE_SHEET_URL = https://script.google.com/macros/s/AKfycby.../usercurrentapp
```

---

## ✅ Cómo Funciona

### Lectura de Referencias

1. Usuario abre la app
2. La app obtiene referencias de Google Sheets
3. **Incluye los rangos:** Carga Min/Max, Peso Min/Max
4. Los carga en el select de referencias
5. **Cada hora sincroniza automáticamente** para detectar cambios

### Validación Automática

```javascript
// Cuando usuario ingresa valores:

Carga: 13.0V
↓
Compara con rango en Sheets: 12.70 - 12.95
↓
¡Está FUERA! → Campo se pone ROJO ❌

Peso: 15.5kg
↓
Compara con rango en Sheets: 14.80 - 16.10  
↓
¡Está DENTRO! → Campo se pone BLANCO ✅
```

### Guardado de Inspecciones

1. Usuario completa formulario
2. Click en **"Guardar Inspección"**
3. Se guarda **localmente** en IndexedDB
4. Aparece notificación de éxito
5. App intenta sincronizar a Google Sheets
6. Si hay conexión → Se agrega fila en "Inspecciones"
7. Si no hay conexión → Se reintenta automáticamente cada 5 minutos

---

## 📊 Ejemplo de Flujo

```
┌─────────────────┐
│ Google Sheet    │
│ "Referencias"   │
└────────┬────────┘
         │ Carga min/max, Peso min/max
         ↓
┌─────────────────┐
│ La App PWA      │
│ (index.html)    │
└────────┬────────┘
         │ Valida automáticamente
         │ contra estos rangos
         ↓
┌─────────────────┐
│ Formulario      │
│ (Campos rojos   │
│  si fuera rango)│
└────────┬────────┘
         │ Usuario guarda
         ↓
┌─────────────────┐
│ Google Sheet    │
│ "Inspecciones"  │
│ (nueva fila)    │
└─────────────────┘
```

---

## 🔧 Estructura de Datos Exacta

### Hoja "Referencias"

```
Columna 1: Referencia (ej: 244105506R)
Columna 2: Carga Min (ej: 12.70)
Columna 3: Carga Max (ej: 12.95)
Columna 4: Peso Min (ej: 14.80)
Columna 5: Peso Max (ej: 16.10)
```

### Hoja "Inspecciones"

```
Col 1:  ID Registro (generado por app)
Col 2:  Fecha Servidor (auto)
Col 3:  Referencia
Col 4:  F. Inspección
Col 5:  F. Fabricación
Col 6:  F. Recarga
Col 7:  Bornes
Col 8:  Calcomanías
Col 9:  Tapones
Col 10: Aspecto (aspectoGeneral)
Col 11: Fugas
Col 12: Carga
Col 13: Peso
Col 14: Fórmula
Col 15: Días
Col 16: Observaciones
Col 17: Inspector
Col 18: Dispositivo
```

---

## 🧪 Probar que Funciona

1. Abre tu app
2. En el formulario, el select debería mostrar tus referencias
   - Si NO aparecen → Google Sheets vacío o Apps Script no está configurado
3. Selecciona una referencia
4. Ingresa valores FUERA del rango
   - El campo debería ponerse ROJO
5. Ingresa valores DENTRO del rango
   - El campo debería ponerse BLANCO
6. Completa un formulario y guarda
   - Debería guardar localmente
   - En 1-2 segundos, sincroniza a Google Sheets
   - Verifica que aparezca la fila en "Inspecciones"

---

## ⚠️ Troubleshooting

**Las referencias no aparecen en el select**
- Verifica que la hoja "Referencias" tiene datos
- Comprueba que GOOGLE_SHEET_URL está en Netlify
- Abre consola (F12) para ver errores

**Los campos no se ponen rojos/blancos**
- Verifica que los rangos en Sheets están bien (números, no texto)
- Abre consola para verificar que obtiene los rangos

**Las inspecciones no se guardan en Sheets**
- Verifica que la hoja "Inspecciones" existe
- Abre consola (F12) para ver el error exacto
- Comprueba que hay conexión a internet

---

## 📝 Resumen

✅ Google Sheet con DOS hojas  
✅ Referencias con rangos de validación  
✅ Validación automática en tiempo real  
✅ Sincronización automática cada hora  
✅ Funciona offline  
✅ Sin hardcodeado en el código  

¡Listo para producción!
