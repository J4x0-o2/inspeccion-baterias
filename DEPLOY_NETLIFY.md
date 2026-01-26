# 🚀 Despliegue en Netlify - Guía Completa

## Paso 1: Preparar credenciales de Google Sheets

Tu URL actual es:
```
https://script.google.com/macros/s/AKfycbyV5epXHNj8tG9CpUbvXHt8AeVRbepZcuCmeqbUn0AxDIJppvZyasqwR71nn6hXLs4D/exec
```

Tu API Key es:
```
123KKj
```

⚠️ **IMPORTANTE**: Estas credenciales están ahora **OCULTAS en Netlify** (no en el código)

## Paso 2: Crear cuenta en Netlify

1. Ve a https://netlify.com
2. Regístrate con GitHub (recomendado) o email
3. Confirma tu correo electrónico

## Paso 3: Conectar repositorio

### Opción A: GitHub (recomendado)

```bash
cd /home/j4x/Documents/W/inspeccion-baterias
git init
git add .
git commit -m "Initial commit: PWA con Netlify Functions"
# Sube a GitHub (crea repo en github.com primero)
git remote add origin https://github.com/TU_USUARIO/inspeccion-baterias.git
git push -u origin main
```

Luego en Netlify Dashboard:
1. Click "New site from Git"
2. Selecciona GitHub
3. Encuentra "inspeccion-baterias"
4. Deploy

### Opción B: Desplegar directamente sin Git

```bash
npm install -g netlify-cli
cd /home/j4x/Documents/W/inspeccion-baterias
netlify login
netlify deploy --prod
```

## Paso 4: Configurar variables de entorno en Netlify

1. Ve a tu sitio en Netlify Dashboard
2. Click "Site Settings" → "Build & Deploy" → "Environment"
3. Click "Edit variables"
4. Añade estas variables:

| Variable | Valor |
|----------|-------|
| `GOOGLE_SHEETS_URL` | `https://script.google.com/macros/s/AKfycbyV5epXHNj8tG9CpUbvXHt8AeVRbepZcuCmeqbUn0AxDIJppvZyasqwR71nn6hXLs4D/exec` |
| `GOOGLE_SHEETS_KEY` | `123KKj` |

## Paso 5: Forzar redeploy

Después de añadir variables de entorno:
1. En Netlify Dashboard → "Deploys"
2. Click "Trigger deploy" → "Deploy site"

## ✅ Verificación

Abre tu sitio y verifica que:
- ✓ La PWA se carga correctamente
- ✓ Puedes crear registros de baterías
- ✓ Los datos se sincronizan con Google Sheets
- ✓ Funciona offline (IndexedDB)

## 🔍 Monitoreo

En Netlify Dashboard → "Functions" puedes ver:
- Logs de ejecución
- Errores
- Tiempos de respuesta

## 🛡️ Seguridad

- ✅ Credenciales protegidas en servidor
- ✅ Cliente no expone secretos
- ✅ HTTPS automático
- ✅ Sin CORS issues

## Troubleshooting

### "Function not found"
- Asegúrate que carpeta `netlify/functions/` existe
- Haz trigger de redeploy en Netlify

### "Variables de entorno no configuradas"
- Ve a Site Settings → Build & Deploy → Environment
- Confirma que las variables están añadidas
- Haz otro deploy

### Datos no se sincronizan
- Abre DevTools → "Network" tab
- Verifica llamadas a `/.netlify/functions/send-to-sheets`
- Revisa Netlify Function logs

---

**Actualizado**: 26 de enero de 2026
