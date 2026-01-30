// ==========================================
// JENKINSFILE - Declarative Pipeline
// Proyecto: Inspección de Baterías
// ==========================================

@Library('shared-library') _

pipeline {
    agent any
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '30'))
        disableConcurrentBuilds()
        timeout(time: 1, unit: 'HOURS')
        ansiColor('xterm')
    }
    
    environment {
        GIT_REPO = 'https://github.com/tu-usuario/inspeccion-baterias.git'
        APP_NAME = 'inspeccion-baterias'
        PROD_SERVER = '192.168.1.100'
        PROD_USER = 'deployer'
        PROD_PATH = '/var/www/inspeccion-baterias'
        STAGING_PATH = '/var/www/staging'
        BACKUP_PATH = '/backups/inspeccion-baterias'
        SLACK_CHANNEL = '#deployments'
    }
    
    triggers {
        githubPush()
    }
    
    stages {
        stage('🔍 Validar Proyecto') {
            steps {
                echo "═══════════════════════════════════════"
                echo "🔍 VALIDANDO PROYECTO"
                echo "═══════════════════════════════════════"
                
                sh '''
                    echo "📋 Validando archivos JSON..."
                    python3 -m json.tool manifest.json > /dev/null || exit 1
                    python3 -m json.tool package.json > /dev/null || exit 1
                    python3 -m json.tool vercel.json > /dev/null || exit 1
                    echo "✅ JSON válido"
                    
                    echo ""
                    echo "📂 Verificando estructura..."
                    test -f index.html || { echo "❌ index.html no encontrado"; exit 1; }
                    test -d js/ || { echo "❌ directorio js/ no existe"; exit 1; }
                    test -d api/ || { echo "❌ directorio api/ no existe"; exit 1; }
                    echo "✅ Estructura OK"
                '''
            }
        }
        
        stage('🧪 Ejecutar Tests') {
            steps {
                echo "═══════════════════════════════════════"
                echo "🧪 EJECUTANDO TESTS"
                echo "═══════════════════════════════════════"
                
                sh '''
                    echo "📦 Verificando dependencias..."
                    if [ -f "package-lock.json" ]; then
                        npm ci --prefer-offline --no-audit
                    fi
                    
                    echo ""
                    echo "🔐 Verificando seguridad..."
                    if grep -r "password\|api_key\|secret" --include="*.js" . 2>/dev/null | grep -v node_modules | grep -v ".git"; then
                        echo "⚠️  ADVERTENCIA: Posibles credenciales en el código"
                    else
                        echo "✅ No se detectaron credenciales hardcoded"
                    fi
                '''
            }
        }
        
        stage('📌 Version Bump (Master)') {
            when {
                branch 'master'
            }
            steps {
                echo "═══════════════════════════════════════"
                echo "📌 GENERANDO VERSIÓN"
                echo "═══════════════════════════════════════"
                
                sh '''
                    COMMIT_MSG=$(git log -1 --pretty=%B)
                    
                    VERSION_TYPE="patch"
                    if [[ "${COMMIT_MSG}" == feat* ]]; then
                        VERSION_TYPE="minor"
                    elif [[ "${COMMIT_MSG}" == fix* ]]; then
                        VERSION_TYPE="patch"
                    fi
                    
                    if [ "${VERSION_TYPE}" != "skip" ]; then
                        npm version ${VERSION_TYPE} --git-tag-version=false
                        NEW_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d ' ')
                        echo "✅ Nueva versión: v${NEW_VERSION}"
                        echo "${NEW_VERSION}" > version.txt
                    fi
                '''
            }
        }
        
        stage('📦 Build') {
            when {
                branch 'master'
            }
            steps {
                echo "═══════════════════════════════════════"
                echo "📦 CONSTRUYENDO ARTIFACT"
                echo "═══════════════════════════════════════"
                
                sh '''
                    VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d ' ')
                    
                    zip -r ${APP_NAME}-${VERSION}.zip . \
                        -x "*.git*" "*.github/*" "node_modules/*" \
                        ".gitignore" "*.log" "documentacion/*"
                    
                    ls -lh ${APP_NAME}-${VERSION}.zip
                    echo "✅ Artifact creado"
                '''
                
                archiveArtifacts artifacts: '*.zip', allowEmptyArchive: true
            }
        }
        
        stage('🚀 Deploy') {
            when {
                branch 'master'
            }
            steps {
                echo "═══════════════════════════════════════"
                echo "🚀 DESPLEGANDO A PRODUCCIÓN"
                echo "═══════════════════════════════════════"
                
                sshagent(['prod-ssh-credentials']) {
                    sh '''
                        VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d ' ')
                        ARTIFACT="${APP_NAME}-${VERSION}.zip"
                        
                        echo "📤 Copiando artifact..."
                        scp -o StrictHostKeyChecking=no ${ARTIFACT} ${PROD_USER}@${PROD_SERVER}:/tmp/
                        
                        echo "📦 Desplegando..."
                        ssh -o StrictHostKeyChecking=no ${PROD_USER}@${PROD_SERVER} << ENDSSH
                            mkdir -p ${PROD_PATH}
                            unzip -o -q /tmp/${ARTIFACT} -d ${PROD_PATH}
                            chown -R www-data:www-data ${PROD_PATH}
                            chmod -R 755 ${PROD_PATH}
                            systemctl reload nginx
                            echo "✅ Deploy completado"
ENDSSH
                    '''
                }
            }
        }
        
        stage('✅ Smoke Tests') {
            when {
                branch 'master'
            }
            steps {
                echo "═══════════════════════════════════════"
                echo "✅ SMOKE TESTS"
                echo "═══════════════════════════════════════"
                
                sh '''
                    PROD_URL="https://inspeccion-baterias.com"
                    curl -f -s ${PROD_URL}/index.html > /dev/null && echo "✅ Sitio accesible" || exit 1
                '''
            }
        }
        
        stage('📢 Notificaciones') {
            steps {
                script {
                    def status = currentBuild.result ?: 'SUCCESS'
                    def emoji = status == 'SUCCESS' ? '✅' : '❌'
                    
                    slackSend(
                        channel: env.SLACK_CHANNEL,
                        color: status == 'SUCCESS' ? 'good' : 'danger',
                        message: """${emoji} Build ${status} - #${BUILD_NUMBER}
Rama: ${env.GIT_BRANCH}
Duración: ${currentBuild.durationString}""",
                        failOnError: false
                    )
                }
            }
        }
    }
    
    post {
        always {
            cleanWs(deleteDirs: true)
        }
    }
}
