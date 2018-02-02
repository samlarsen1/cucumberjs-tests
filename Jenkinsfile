pipeline {

    options {
        skipDefaultCheckout true
    }
    agent {
        node {
            label "defra-poc-vs-nixbase"
        }
    }
    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Test') {
            steps {
                script{
                  sh 'node -v'
                  sh 'npm -v'
                  sh 'yarn -v'
                  //sh 'sudo chown -R $USER /home/jenkinsagent/.config/yarn/''
                  //sh 'ls -la'
                  //  attempting to clear the cache permission issue
                  //    https://github.com/termux/termux-packages/issues/1192
                  //sh 'curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -'
                  //sh 'echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list'
                  //sh 'sudo apt remove cmdtest -y'
                  //sh 'sudo apt-get update && sudo apt-get install yarn'
                  sh 'yarn install'
                  sh 'yarn test'
                }

            }
            post {
                always {
                    //generate cucumber reports
                    cucumber 'report.json'
                }
            }
        }

        stage('Cleanup'){
            steps {
                echo 'prune and cleanup'
                //sh 'npm prune'
                sh 'rm node_modules -rf'

                // mail body: 'project build successful',
                //             from: 'xxxx@yyyyy.com',
                //             replyTo: 'xxxx@yyyy.com',
                //             subject: 'project build successful',
                //             to: 'yyyyy@yyyy.com'
          }
        }
    }
}
