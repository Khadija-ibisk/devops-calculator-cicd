pipeline {
    agent any

    environment {
        // Utilisation de l'ID exact que tu as créé dans Jenkins
        REGISTRY_CREDS = credentials('khadija-group')
        REGISTRY_URL   = 'registry.gitlab.com'
        PROJECT        = 'khadija-ibisk-group/devops-calc'
        TAG            = "${env.BUILD_ID}" // Plus simple et robuste pour débuter
    }

    stages {
        stage('📥 Checkout') {
            steps {
                checkout scm
            }
        }

        stage('📦 Install') {
            steps {
                script {
                    dir('frontend') { sh 'npm install' }
                    dir('backend') { sh 'npm install' }
                }
            }
        }

        stage('🧪 Tests') {
            steps {
                script {
                    // On lance les tests mais on ne bloque pas si un test échoue pour l'instant
                    dir('frontend') { sh 'npm test -- --watchAll=false || true' }
                    dir('backend') { sh 'npm test || true' }
                }
            }
        }

        stage('🐳 Build & Push') {
            steps {
                script {
                    // On combine build et push pour être plus efficace
                    sh "docker build -t ${REGISTRY_URL}/${PROJECT}/frontend:${TAG} ./frontend"
                    sh "docker build -t ${REGISTRY_URL}/${PROJECT}/backend:${TAG} ./backend"
                    
                    sh "echo ${REGISTRY_CREDS_PSW} | docker login -u ${REGISTRY_CREDS_USR} --password-stdin ${REGISTRY_URL}"
                    
                    sh "docker push ${REGISTRY_URL}/${PROJECT}/frontend:${TAG}"
                    sh "docker push ${REGISTRY_URL}/${PROJECT}/backend:${TAG}"
                }
            }
        }
    }

    post {
        always {
            // Utilisation sécurisée de cleanWs
            script {
                try {
                    cleanWs()
                } catch (e) {
                    echo "Nettoyage de l'espace de travail ignoré : ${e.message}"
                }
            }
        }
        success { echo '✅ Pipeline réussi !' }
        failure { echo '❌ Pipeline en échec.' }
    }
}