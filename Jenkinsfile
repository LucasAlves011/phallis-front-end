pipeline {
    agent any

    // REMOVA A SEÇÃO TOOLS (Não precisamos instalar Node no Jenkins)
    // tools {
    //    nodejs 'node-lts'
    // }

    environment {
        NEXT_PUBLIC_API_URL = "${env.NEXT_PUBLIC_API_URL ?: 'https://back-end.phalis.luukelab.space/'}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // ALTERAÇÃO AQUI: Rodamos este estágio dentro de um container Node oficial
        stage('Build Local') {
            agent {
                docker {
                    image 'node:22-alpine' // Usa uma imagem leve do Node
                    reuseNode true         // Mantém o workspace atual
                }
            }
            steps {
                echo 'Rodando Build de verificação dentro do container Node...'
                sh 'npm ci'
                sh 'npm run build'

                // Nota: Como rodamos dentro do docker, a pasta node_modules gerada
                // pode ficar com permissão de root. Vamos limpar antes de sair.
                sh 'rm -rf node_modules .next'
            }
        }

        stage('Build & Deploy Docker') {
            steps {
                script {
                    // Seus comandos de docker-compose continuam iguais aqui...
                    // Como este passo roda no 'agent any' (o host Jenkins),
                    // ele tem acesso ao comando 'docker' e 'docker-compose'
                    sh """
                        if [ ! -f "./docker-compose" ]; then
                             echo "--- Baixando Docker Compose... ---"
                             curl -SL https://github.com/docker/compose/releases/download/v2.29.0/docker-compose-linux-x86_64 -o docker-compose
                             chmod +x docker-compose
                        fi

                        ./docker-compose -p sml-front-phalis down
                        ./docker-compose -p sml-front-phalis up -d --build
                    """
                }
            }
        }

        stage('Cleanup') {
            steps {
                sh 'docker image prune -f'
            }
        }
    }
}