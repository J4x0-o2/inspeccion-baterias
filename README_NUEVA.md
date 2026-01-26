# 📱 Sistema de Inspección de Baterías - PWA

Sistema moderno y progresivo para registrar inspecciones de baterías, con sincronización automática a Google Sheets.

---

## 🎯 Características

✅ **Aplicación Web Progresiva (PWA)** - Funciona offline  
✅ **Sincronización Automática** - Con Google Sheets  
✅ **Sin Panel Admin** - Todo se gestiona en Sheets  
✅ **Datos Centralizados** - Un único Google Sheet con dos hojas  
✅ **Responsive Design** - Mobile, Tablet y Desktop  
✅ **Contador Automático** - Se reinicia cada 24 horas  
✅ **Validaciones** - De voltaje y peso por referencia  

---

## 📋 Estructura de Datos

### Google Sheets: "Inspección Baterías"

#### **Hoja 1: Referencias**
| Campo | Descripción |
|-------|-------------|
| Referencia | Código de batería (ej: 244105506R) |
| Descripción | Modelo o descripción |
| Estado | Activa/Inactiva |

#### **Hoja 2: Inspecciones**
| Campo | Descripción |
|-------|-------------|
| Referencia | Código de batería |
| Inspector | Nombre del inspector |
| Carga (V) | Voltaje medido |
| Peso (kg) | Peso de la batería |
| Días | Días desde recarga |
| Fórmula | Valor de fórmula |
| Observaciones | Notas adicionales |
| Fecha | Fecha de inspección |
| Estado | Pendiente/Aceptada/Rechazada |

---

## 🚀 Configuración Rápida

### 1️⃣ Crear Google Sheet

```
1. Ve a sheets.google.com
2. Crea nuevo Sheet: "Inspección Baterías"
3. Renombra la primera hoja a "Referencias"
4. Agrega una segunda hoja llamada "Inspecciones"
```

### 2️⃣ Configurar Hojas

**Hoja "Referencias"** - Fila 1 (Encabezados):
```
Referencia | Descripción | Estado
```

Luego agrega tus referencias:
```
244105506R | Batería modelo 1 | Activa
244103318R | Batería modelo 2 | Activa
```

**Hoja "Inspecciones"** - Fila 1 (Encabezados):
```
Referencia | Inspector | Carga (V) | Peso (kg) | Días | Fórmula | Observaciones | Fecha | Estado
```

### 3️⃣ Crear Google Apps Script

En el Google Sheet:
1. **Extensiones > Apps Script**
2. Copia el código de `GOOGLE_SHEETS_SETUP.md`
3. Guarda como `Código`

### 4️⃣ Desplegar Apps Script

1. Haz click en **"Implementar"**
2. Selecciona **"Nueva implementación"**
3. Tipo: **"Aplicación web"**
4. Ejecutar como: Tu cuenta
5. Acceso: **"Cualquiera que tenga el enlace"**
6. **Copiar URL de implementación** (se verá así):
   ```
   https://script.google.com/macros/s/AKfycby...../usercurrentapp
   ```

### 5️⃣ Configurar Netlify

En tu sitio Netlify:
1. **Site settings > Build & deploy > Environment**
2. **Add environment variable**
3. Nombre: `GOOGLE_SHEET_URL`
4. Valor: Pega la URL del Apps Script
5. **Redeploy** tu sitio

### 6️⃣ ¡Listo! 🎉

La app ya funciona con sincronización automática.

---

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

---

## 📱 Uso de la Aplicación

### Usar Formulario
1. Selecciona referencia de batería
2. Completa fechas de inspección
3. Rellena datos visuales y técnicos
4. Agrega inspector y observaciones
5. Haz click en **"Guardar Inspección"**

### Sincronización
- ✅ Se guarda **localmente** automáticamente
- ✅ Se sincroniza a **Google Sheets** cuando hay conexión
- ✅ Se sincroniza cada hora aunque no hagas cambios
- ⏳ Si estás offline, se guarda y sincroniza cuando vuelva la conexión

### Gestionar Referencias
1. Ve a tu **Google Sheet**
2. Abre la hoja **"Referencias"**
3. Agrega o modifica referencias
4. Los cambios aparecen en la app cada hora
5. Sin necesidad de reload manual

---

## 🔄 Flujo de Sincronización

```
Usuario completa formulario
        ↓
Se guarda en IndexedDB (local)
        ↓
App intenta sincronizar a Google Sheets
        ↓
Si hay conexión → Se guarda en Sheets
Si no hay conexión → Se reintenta automáticamente
        ↓
Cada 1 hora: Verifica cambios en Referencias
```

---

## 🔧 Archivos Principales

```
/
├── index.html              # Página principal
├── manifest.json          # Configuración PWA
├── sw.js                  # Service Worker
├── js/
│   ├── app.js             # Lógica del formulario
│   ├── api.js             # Cliente HTTP
│   ├── database.js        # Gestión IndexedDB
│   ├── sync.js            # Motor de sincronización
│   ├── referencias-sync.js # Sincronización de referencias
│   ├── sync-referencias.js # Detector de cambios
│   ├── config.js          # Configuración
│   └── ...
├── netlify/functions/
│   ├── referencias.js     # Obtiene referencias de Sheets
│   └── send-to-sheets.js  # Guarda inspecciones en Sheets
└── GOOGLE_SHEETS_SETUP.md # Instrucciones detalladas
```

---

## 📊 Variables de Entorno

### Netlify
```
GOOGLE_SHEET_URL = https://script.google.com/macros/s/.../usercurrentapp
```

Solo necesita **UNA** variable.

---

## 🐛 Troubleshooting

### Las referencias no se cargan
1. Verifica que `GOOGLE_SHEET_URL` esté configurada en Netlify
2. Comprueba que el Apps Script está desplegado
3. Abre la consola (F12) y busca errores

### Las inspecciones no se guardan en Sheets
1. Verifica conexión a internet
2. Abre la consola para ver el error exacto
3. Comprueba que la hoja "Inspecciones" existe

### Las referencias no se actualizan
1. Verifica que la hoja "Referencias" tiene los datos correctos
2. Espera hasta 1 hora para la siguiente sincronización
3. O recarga la página manualmente

---

## 📞 Soporte

Si encuentras problemas:
1. Abre la consola del navegador (F12)
2. Busca mensajes de error en rojo
3. Comparte los errores en el repositorio

---

## 📄 Licencia

Privado - Uso interno

---

**Última actualización:** Enero 2026
