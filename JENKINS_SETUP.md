# 🚀 Inspección de Baterías - Versión Jenkins Ready

**Versión:** 1.2.5 - Jenkins Ready
**Estado:** Preparado para desplegar en servidor privado con Jenkins

## 📋 Configuración Requerida

### 1. Jenkins Setup
```bash
# Instalar Jenkins en servidor privado
sudo apt-get install openjdk-11-jdk jenkins nginx

# El Jenkinsfile está incluido en la raíz del repositorio
```

### 2. Credenciales en Jenkins
- `github-credentials` - Token de acceso a GitHub
- `prod-ssh-credentials` - SSH key para servidor privado
- `slack-webhook` - Webhook de Slack para notificaciones

### 3. Configurar Webhook en GitHub
```
Settings → Webhooks → Add webhook
- Payload URL: http://tu-jenkins-server:8080/github-webhook/
- Events: Push events, Pull requests
```

### 4. Variables de Entorno

En Jenkins → Manage Jenkins → Configure System:

```
GIT_REPO = https://github.com/tu-usuario/inspeccion-baterias.git
PROD_SERVER = 192.168.1.100
PROD_PATH = /var/www/inspeccion-baterias
```

## 📊 Pipeline Stages

```
🔍 Validate       → Valida JSON y estructura
🧪 Test           → Tests de seguridad
📌 Version Bump   → (Solo master) Actualiza versión
📦 Build          → Crea artifact ZIP
🚀 Deploy         → Despliega a producción
✅ Smoke Tests    → Verifica que funciona
📢 Notificaciones → Slack + Email
```

## 🔄 Flujo de Trabajo

1. **Feature Branch** → Push → Jenkins valida y testea
2. **Pull Request** → Merge a master
3. **Master** → Jenkins:
   - Bumps version automáticamente
   - Crea artifact
   - Despliega a producción
   - Ejecuta smoke tests
   - Notifica a Slack

## 📁 Estructura Esperada en Servidor

```
/var/www/inspeccion-baterias/
├── index.html
├── manifest.json
├── package.json
├── js/
├── api/
├── images/
└── sw.js

/backups/inspeccion-baterias/
└── inspeccion-baterias-1.2.4/
```

## ✅ Checklist Pre-Despliegue

- [ ] Crear repositorio en GitHub
- [ ] Clonar este repo a la nueva ubicación
- [ ] Cambiar URL remota a tu nuevo repo
- [ ] Instalar Jenkins en servidor privado
- [ ] Configurar credenciales en Jenkins
- [ ] Configurar webhook en GitHub
- [ ] Hacer push a master
- [ ] Verificar que se ejecute el pipeline

## 🔐 Seguridad

- Las credenciales se almacenan en Jenkins (no en el código)
- SSH key se usa solo en el servidor Jenkins
- No hay datos sensibles en el repositorio

## 📞 Soporte

Para problemas:
- Jenkins Logs: `/var/log/jenkins/jenkins.log`
- Deploy Logs: `/var/log/jenkins-deployments.log`
- Build Artifacts: Jenkins → Build History
