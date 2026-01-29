# 🚀 CI/CD Setup - Guía Configuración

Este documento explica cómo configurar CI/CD automático para desplegar la app en Vercel usando GitHub Actions.

## 📋 Requisitos Previos

- ✅ Repositorio en GitHub
- ✅ Proyecto en Vercel
- ✅ Rama `develop` y `master` creadas

## ⚙️ PASO 1: Obtener Vercel Token

### 1.1 Ir a Vercel Settings

1. Ve a: https://vercel.com/account/tokens
2. Haz click en **"Create Token"**
3. Nombre: `GITHUB_CI_CD`
4. **Copia el token** (será algo como: `abc123xyz...`)

### 1.2 Copiar y guardar el token

Guárdalo en un lugar seguro (lo necesitarás en el siguiente paso).

## ⚙️ PASO 2: Obtener Project ID y Org ID (Opcional pero recomendado)

### 2.1 Obtener Project ID

```bash
# Ejecuta en tu carpeta del proyecto
vercel project ls

# Copiar el ID del proyecto
# Ejemplo: abc123xyz
```

O ve a: https://vercel.com/J4x0-o2/inspeccion-baterias/settings (reemplaza tu username)

### 2.2 Obtener Org ID

```bash
vercel org ls

# Copiar el ID de la organización
```

O en Vercel → Settings → General → Team ID

## 🔐 PASO 3: Guardar Secrets en GitHub

### 3.1 Ir a GitHub Secrets

1. Ve a tu repositorio: https://github.com/J4x0-o2/inspeccion-baterias
2. **Settings** → **Secrets and variables** → **Actions**
3. Haz click en **"New repository secret"**

### 3.2 Crear cada Secret

Crea los siguientes secrets (sin comillas):

| Name | Value |
|------|-------|
| `VERCEL_TOKEN` | Tu token de Vercel (de Paso 1) |
| `VERCEL_ORG_ID` | Tu Org ID (de Paso 2.2) |
| `VERCEL_PROJECT_ID` | Tu Project ID (de Paso 2.1) |

**Pasos para crear cada uno:**

1. Click en **"New repository secret"**
2. En **"Name"** escribir: `VERCEL_TOKEN`
3. En **"Secret"** pegar el valor
4. Click en **"Add secret"**
5. Repetir para cada uno

## ✅ PASO 4: Verificar Workflows

### 4.1 Ver que los workflows existen

Ir a tu repo → **Actions**

Deberías ver:
- ✅ 🔍 Validar Código (`validate.yml`)
- ✅ 🚀 Deploy a Vercel (`deploy.yml`)
- ✅ 👀 Preview en Vercel (`preview.yml`)

### 4.2 Probar el workflow

1. Haz un cambio en la rama `develop`
2. Haz `git push`
3. Ve a **Actions** en GitHub
4. Deberías ver que el workflow **"🔍 Validar Código"** se ejecuta

## 🔄 FLUJO DE TRABAJO CON CI/CD

### Desarrollo Normal

```
1. Creas rama: git checkout -b feature/mi-feature
2. Haces cambios
3. git add . && git commit -m "..."
4. git push origin feature/mi-feature

5. En GitHub, haces un Pull Request (PR) a develop

6. GitHub Actions automáticamente:
   ✅ Valida tu código
   ✅ Si está OK → Te deja hacer merge
   ✅ Si hay errores → Te muestra qué está mal

7. Haces merge a develop (en GitHub)

8. Tu rama develop está actualizada
```

### Desplegar a Producción

```
1. En GitHub, haces un Pull Request de develop → master

2. GitHub Actions automáticamente:
   ✅ Valida el código
   ✅ Crea Preview URL
   ✅ Te deja revisar cambios en URL preview

3. Haces merge a master (cuando estés seguro)

4. GitHub Actions automáticamente:
   ✅ Valida el código
   ✅ Despliega a Vercel producción
   ✅ Tu app se actualiza en tiempo real

5. ¡Listo! Tu app está en producción
```

## 🧪 Pruebas de CI/CD

### Test 1: Validar en develop

1. En rama `develop`, haz un cambio pequeño
2. Haz `git push`
3. Ve a **Actions** → Deberías ver "🔍 Validar Código"
4. Espera a que termine (debe estar ✅)

### Test 2: PR a master

1. En GitHub, haz un PR de `develop` → `master`
2. Ve a **Actions** → Deberías ver 3 workflows ejecutándose
3. Deberías ver una **Preview URL** en los comentarios del PR
4. Haz click en la URL para ver preview

### Test 3: Merge a master

1. Haz merge del PR a `master`
2. Ve a **Actions**
3. Espera a que termine "🚀 Deploy a Vercel"
4. Deberías ver en Vercel que el deployment fue exitoso
5. Espera ~2 minutos
6. Visita tu app: https://inspeccion-baterias.vercel.app
7. ¡Deberías ver los cambios!

## 🐛 Troubleshooting

### "Falta VERCEL_TOKEN"

**Solución:**
1. Ve a repo → Settings → Secrets → Revisa que `VERCEL_TOKEN` exista
2. Si no existe, créalo siguiendo Paso 3

### "Workflow falla en validación"

**Solución:**
1. Ve a **Actions** y haz click en el workflow fallido
2. Lee el error (está en rojo)
3. Ejemplos comunes:
   - `manifest.json` no es JSON válido → Arregla el JSON
   - Falta un archivo crítico → Agrégalo
   - Sintaxis error → Revisa el código

### "Deploy a Vercel falla"

**Solución:**
1. Verifica que `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID` sean correctos
2. Verifica que `VERCEL_TOKEN` sea válido (no haya expirado)
3. Revisa en Vercel → Dashboard si hay alertas

## 📊 Monitoreo

### Ver logs de workflows

1. Ve a repo → **Actions**
2. Click en el workflow que quieras ver
3. Click en el job para ver logs detallados
4. Puedes ver exactamente qué pasó en cada step

### Ver deployments en Vercel

1. Ve a https://vercel.com/J4x0-o2/inspeccion-baterias
2. Click en **"Deployments"**
3. Puedes ver todos los deployments automáticos
4. Ver logs, URLs, etc.

## 🎯 Ramas y sus flujos

| Rama | Cuándo se ejecuta | Qué hace |
|------|------------------|---------|
| `feature/*` | Push | (Nada, solo si haces PR) |
| `develop` | Push | ✅ Valida código |
| PR develop → master | Creación | ✅ Valida + 👀 Preview |
| `master` | Merge | ✅ Valida + 🚀 Despliega Prod |

## ✨ Ventajas de este setup

✅ **Automático** - No haces nada, sucede solo
✅ **Seguro** - Valida antes de desplegar
✅ **Rápido** - Deploy en 1-2 minutos
✅ **Reversible** - Fácil volver atrás si algo sale mal
✅ **Rastreable** - Ves exactamente qué se desplegó
✅ **Notificaciones** - GitHub te avisa si falla

## 📞 Soporte

Si algo no funciona:

1. Revisa los logs en **Actions**
2. Verifica que los secrets estén correctos
3. Asegúrate que vercel.json, package.json, manifest.json sean válidos
4. Revisa que index.html exista y tenga los scripts

---

**¡Tu CI/CD está listo para usar!** 🎉
