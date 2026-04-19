pipeline {
    agent any

    // REMOVA A SEÇÃO TOOLS (Não precisamos instalar Node no Jenkins)
    // tools {
    //    nodejs 'node-lts'
    // }

    environment {
        NEXT_PUBLIC_API_URL = "${env.NEXT_PUBLIC_API_URL}"
        NEXT_PUBLIC_DISABLE_MSW = "${env.NEXT_PUBLIC_DISABLE_MSW}"
        NEXT_PUBLIC_TURNSTILE_SITEKEY = "${env.NEXT_PUBLIC_TURNSTILE_SITEKEY}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
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

                        ./docker-compose -p sml-phalis down
                        ./docker-compose -p sml-phalis up -d --build
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