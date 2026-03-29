# Guide Jenkins CI/CD

> Configuration et utilisation de Jenkins pour l'intégration et le déploiement continus

## Table des Matières

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Pipelines Déclaratifs](#pipelines-déclaratifs)
5. [Pipelines Scriptés](#pipelines-scriptés)
6. [Intégration Docker](#intégration-docker)
7. [Multibranch Pipeline](#multibranch-pipeline)
8. [Shared Libraries](#shared-libraries)
9. [Sécurité](#sécurité)
10. [Best Practices](#best-practices)

---

## Introduction

### Pourquoi Jenkins ?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Jenkins CI/CD                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Avantages:                                                                  │
│  ✅ Open source et gratuit                                                  │
│  ✅ Hautement extensible (1800+ plugins)                                    │
│  ✅ Auto-hébergé (contrôle total)                                          │
│  ✅ Pipeline as Code (Jenkinsfile)                                         │
│  ✅ Intégration native Docker                                              │
│  ✅ Scalable (agents distribués)                                           │
│  ✅ Large communauté                                                        │
│                                                                              │
│  Cas d'usage:                                                               │
│  • Entreprises avec infrastructure on-premise                              │
│  • Projets nécessitant des builds personnalisés                            │
│  • Environnements avec contraintes de sécurité                             │
│  • Intégration avec outils enterprise (SonarQube, Fortify, etc.)          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Architecture Jenkins

```
┌─────────────────────────────────────────────────────────────────┐
│                    Jenkins Architecture                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ┌─────────────┐                              │
│                    │   Master    │                              │
│                    │  (Controller)│                              │
│                    └──────┬──────┘                              │
│                           │                                      │
│           ┌───────────────┼───────────────┐                     │
│           │               │               │                     │
│           ▼               ▼               ▼                     │
│    ┌──────────┐    ┌──────────┐    ┌──────────┐               │
│    │  Agent   │    │  Agent   │    │  Agent   │               │
│    │  Linux   │    │  Docker  │    │ Windows  │               │
│    └──────────┘    └──────────┘    └──────────┘               │
│                                                                  │
│  Master: Orchestration, UI, scheduling                         │
│  Agents: Exécution des builds                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Installation

### Docker Compose (Recommandé)

```yaml
# docker-compose.jenkins.yml
version: '3.8'

services:
  jenkins:
    image: jenkins/jenkins:lts-jdk17
    container_name: jenkins
    restart: unless-stopped
    privileged: true
    user: root
    ports:
      - "8080:8080"
      - "50000:50000"
    volumes:
      - jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker
    environment:
      - JAVA_OPTS=-Djenkins.install.runSetupWizard=false
      - JENKINS_OPTS=--prefix=/jenkins
    networks:
      - jenkins-network

  jenkins-agent:
    image: jenkins/inbound-agent:latest
    container_name: jenkins-agent
    restart: unless-stopped
    environment:
      - JENKINS_URL=http://jenkins:8080
      - JENKINS_AGENT_NAME=docker-agent
      - JENKINS_SECRET=${JENKINS_AGENT_SECRET}
      - JENKINS_AGENT_WORKDIR=/home/jenkins/agent
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - agent_workspace:/home/jenkins/agent
    depends_on:
      - jenkins
    networks:
      - jenkins-network

volumes:
  jenkins_home:
  agent_workspace:

networks:
  jenkins-network:
    driver: bridge
```

### Kubernetes (Helm)

```bash
# Ajouter le repo Helm
helm repo add jenkins https://charts.jenkins.io
helm repo update

# Installer Jenkins
helm install jenkins jenkins/jenkins \
  --namespace jenkins \
  --create-namespace \
  --set controller.serviceType=LoadBalancer \
  --set controller.installPlugins="kubernetes:latest,workflow-aggregator:latest,git:latest,docker-workflow:latest"
```

```yaml
# values.yaml personnalisé
controller:
  image: jenkins/jenkins
  tag: lts-jdk17

  installPlugins:
    - kubernetes:latest
    - workflow-aggregator:latest
    - git:latest
    - github:latest
    - docker-workflow:latest
    - docker-plugin:latest
    - blueocean:latest
    - pipeline-stage-view:latest
    - sonar:latest
    - fortify:latest

  JCasC:
    configScripts:
      welcome-message: |
        jenkins:
          systemMessage: "Jenkins CI/CD Server"

agent:
  enabled: true
  image: jenkins/inbound-agent
  containerCap: 10
  resources:
    requests:
      cpu: "500m"
      memory: "512Mi"
    limits:
      cpu: "1"
      memory: "1Gi"

persistence:
  enabled: true
  size: 50Gi
```

### Plugins Essentiels

```groovy
// Liste des plugins recommandés
def plugins = [
    // Core
    'workflow-aggregator',           // Pipeline
    'pipeline-stage-view',           // Stage View
    'blueocean',                     // Blue Ocean UI

    // SCM
    'git',
    'github',
    'gitlab-plugin',
    'bitbucket',

    // Build
    'docker-workflow',               // Docker Pipeline
    'docker-plugin',                 // Docker
    'nodejs',                        // Node.js

    // Quality
    'sonar',                         // SonarQube
    'fortify',                       // Fortify SAST
    'warnings-ng',                   // Code warnings

    // Deploy
    'kubernetes',                    // Kubernetes
    'ssh-agent',                     // SSH
    'publish-over-ssh',              // SSH publishing

    // Notifications
    'slack',                         // Slack
    'email-ext',                     // Email
    'msteams',                       // Microsoft Teams

    // Security
    'credentials',                   // Credentials
    'credentials-binding',           // Credentials Binding
    'role-strategy',                 // Role-based auth

    // Utilities
    'timestamper',                   // Timestamps
    'ansicolor',                     // ANSI colors
    'build-timeout',                 // Build timeout
    'throttle-concurrents',          // Throttle builds
]
```

---

## Configuration

### Configuration as Code (JCasC)

```yaml
# jenkins.yaml - Configuration as Code
jenkins:
  systemMessage: "Jenkins CI/CD - Managed by JCasC"

  securityRealm:
    ldap:
      configurations:
        - server: ldap.example.com
          rootDN: dc=example,dc=com
          userSearchBase: ou=users
          groupSearchBase: ou=groups

  authorizationStrategy:
    roleBased:
      roles:
        global:
          - name: admin
            permissions:
              - Overall/Administer
            entries:
              - group: jenkins-admins
          - name: developer
            permissions:
              - Overall/Read
              - Job/Build
              - Job/Read
              - Job/Workspace
            entries:
              - group: developers

  nodes:
    - permanent:
        name: docker-agent
        remoteFS: /home/jenkins
        launcher:
          ssh:
            host: agent.example.com
            credentialsId: ssh-agent-key
        labels: docker linux

  globalNodeProperties:
    - envVars:
        env:
          - key: DOCKER_REGISTRY
            value: registry.example.com
          - key: SONAR_HOST
            value: https://sonar.example.com

unclassified:
  location:
    url: https://jenkins.example.com/

  sonarGlobalConfiguration:
    installations:
      - name: SonarQube
        serverUrl: https://sonar.example.com
        credentialsId: sonar-token

  slackNotifier:
    teamDomain: myteam
    tokenCredentialId: slack-token
    room: "#jenkins"

credentials:
  system:
    domainCredentials:
      - credentials:
          - usernamePassword:
              scope: GLOBAL
              id: github-credentials
              username: ${GITHUB_USER}
              password: ${GITHUB_TOKEN}
          - string:
              scope: GLOBAL
              id: sonar-token
              secret: ${SONAR_TOKEN}
          - file:
              scope: GLOBAL
              id: kubeconfig
              fileName: kubeconfig
              secretBytes: ${KUBECONFIG_BASE64}
```

### Global Tool Configuration

```yaml
# tools.yaml
tool:
  nodejs:
    installations:
      - name: NodeJS-20
        properties:
          - installSource:
              installers:
                - nodeJSInstaller:
                    id: "20.10.0"
                    npmPackages: "pnpm@latest"

  docker:
    installations:
      - name: Docker
        properties:
          - installSource:
              installers:
                - fromDocker:
                    version: latest

  sonarRunnerInstallation:
    installations:
      - name: SonarScanner
        properties:
          - installSource:
              installers:
                - sonarRunnerInstaller:
                    id: "5.0.1.3006"
```

---

## Pipelines Déclaratifs

### Jenkinsfile Complet

```groovy
// Jenkinsfile
pipeline {
    agent {
        kubernetes {
            yaml '''
                apiVersion: v1
                kind: Pod
                spec:
                  containers:
                  - name: node
                    image: node:20-alpine
                    command:
                    - cat
                    tty: true
                  - name: docker
                    image: docker:24-dind
                    securityContext:
                      privileged: true
                    volumeMounts:
                    - name: docker-socket
                      mountPath: /var/run/docker.sock
                  - name: sonar
                    image: sonarsource/sonar-scanner-cli:latest
                    command:
                    - cat
                    tty: true
                  volumes:
                  - name: docker-socket
                    hostPath:
                      path: /var/run/docker.sock
            '''
        }
    }

    environment {
        // Credentials
        DOCKER_CREDENTIALS = credentials('docker-registry')
        GITHUB_TOKEN = credentials('github-token')
        SONAR_TOKEN = credentials('sonar-token')

        // Configuration
        DOCKER_REGISTRY = 'registry.example.com'
        IMAGE_NAME = 'myapp'
        SONAR_HOST = 'https://sonar.example.com'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
        ansiColor('xterm')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    triggers {
        // Webhook GitHub
        githubPush()
        // Ou polling SCM
        // pollSCM('H/5 * * * *')
    }

    stages {
        // ================================================================
        // STAGE: Checkout
        // ================================================================
        stage('Checkout') {
            steps {
                checkout scm

                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()

                    env.GIT_BRANCH_NAME = sh(
                        script: 'git rev-parse --abbrev-ref HEAD',
                        returnStdout: true
                    ).trim()

                    env.IMAGE_TAG = "${env.GIT_BRANCH_NAME}-${env.GIT_COMMIT_SHORT}"
                }
            }
        }

        // ================================================================
        // STAGE: Install Dependencies
        // ================================================================
        stage('Install') {
            steps {
                container('node') {
                    sh '''
                        corepack enable
                        corepack prepare pnpm@latest --activate
                        pnpm install --frozen-lockfile
                    '''
                }
            }
        }

        // ================================================================
        // STAGE: Lint & Format
        // ================================================================
        stage('Lint') {
            parallel {
                stage('ESLint') {
                    steps {
                        container('node') {
                            sh 'pnpm lint --format checkstyle --output-file eslint-report.xml || true'
                        }
                    }
                    post {
                        always {
                            recordIssues(
                                tools: [esLint(pattern: 'eslint-report.xml')],
                                qualityGates: [[threshold: 10, type: 'TOTAL', unstable: true]]
                            )
                        }
                    }
                }

                stage('TypeScript') {
                    steps {
                        container('node') {
                            sh 'pnpm type-check'
                        }
                    }
                }

                stage('Prettier') {
                    steps {
                        container('node') {
                            sh 'pnpm format:check'
                        }
                    }
                }
            }
        }

        // ================================================================
        // STAGE: Tests
        // ================================================================
        stage('Test') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        container('node') {
                            sh 'pnpm test:unit --coverage --reporters=default --reporters=jest-junit'
                        }
                    }
                    post {
                        always {
                            junit 'junit.xml'
                            publishHTML(target: [
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Coverage Report'
                            ])
                        }
                    }
                }

                stage('Integration Tests') {
                    steps {
                        container('node') {
                            sh 'pnpm test:integration'
                        }
                    }
                }
            }
        }

        // ================================================================
        // STAGE: Security Scan
        // ================================================================
        stage('Security') {
            parallel {
                stage('Dependency Audit') {
                    steps {
                        container('node') {
                            sh 'pnpm audit --audit-level=high || true'
                        }
                    }
                }

                stage('SAST - SonarQube') {
                    steps {
                        container('sonar') {
                            withSonarQubeEnv('SonarQube') {
                                sh '''
                                    sonar-scanner \
                                        -Dsonar.projectKey=${JOB_NAME} \
                                        -Dsonar.projectName=${JOB_NAME} \
                                        -Dsonar.sources=src \
                                        -Dsonar.tests=tests \
                                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                                        -Dsonar.testExecutionReportPaths=test-report.xml
                                '''
                            }
                        }
                    }
                }

                stage('SAST - Fortify') {
                    when {
                        branch 'main'
                    }
                    steps {
                        container('node') {
                            fortifyBuild buildID: "${JOB_NAME}-${BUILD_NUMBER}"
                            fortifyScan buildID: "${JOB_NAME}-${BUILD_NUMBER}"
                            fortifyUpload appName: "${JOB_NAME}",
                                         appVersion: "${env.IMAGE_TAG}",
                                         resultsFile: "fortify-results.fpr"
                        }
                    }
                }
            }
        }

        // ================================================================
        // STAGE: Quality Gate
        // ================================================================
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        // ================================================================
        // STAGE: Build
        // ================================================================
        stage('Build') {
            steps {
                container('node') {
                    sh 'pnpm build'
                }
            }
        }

        // ================================================================
        // STAGE: Docker Build & Push
        // ================================================================
        stage('Docker') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                container('docker') {
                    sh '''
                        docker login -u $DOCKER_CREDENTIALS_USR -p $DOCKER_CREDENTIALS_PSW $DOCKER_REGISTRY

                        docker build \
                            --build-arg VERSION=${IMAGE_TAG} \
                            --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
                            -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} \
                            -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest \
                            .

                        docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
                        docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest
                    '''
                }
            }
        }

        // ================================================================
        // STAGE: Deploy Staging
        // ================================================================
        stage('Deploy Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    kubernetesDeploy(
                        configs: 'k8s/staging/*.yaml',
                        kubeconfigId: 'kubeconfig-staging'
                    )
                }
            }
            post {
                success {
                    slackSend(
                        channel: '#deployments',
                        color: 'good',
                        message: "✅ Staging deployed: ${env.JOB_NAME} - ${env.IMAGE_TAG}"
                    )
                }
            }
        }

        // ================================================================
        // STAGE: E2E Tests
        // ================================================================
        stage('E2E Tests') {
            when {
                branch 'develop'
            }
            steps {
                container('node') {
                    sh '''
                        npx playwright install --with-deps chromium
                        pnpm test:e2e
                    '''
                }
            }
            post {
                always {
                    publishHTML(target: [
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright Report'
                    ])
                }
            }
        }

        // ================================================================
        // STAGE: Deploy Production
        // ================================================================
        stage('Deploy Production') {
            when {
                branch 'main'
            }
            steps {
                // Approbation manuelle
                input(
                    message: 'Deploy to production?',
                    ok: 'Deploy',
                    submitter: 'admin,deployer'
                )

                script {
                    kubernetesDeploy(
                        configs: 'k8s/production/*.yaml',
                        kubeconfigId: 'kubeconfig-production'
                    )
                }
            }
            post {
                success {
                    slackSend(
                        channel: '#deployments',
                        color: 'good',
                        message: "🚀 Production deployed: ${env.JOB_NAME} - ${env.IMAGE_TAG}"
                    )

                    // Tag Git
                    sh '''
                        git tag -a "v${IMAGE_TAG}" -m "Release ${IMAGE_TAG}"
                        git push origin "v${IMAGE_TAG}"
                    '''
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }

        success {
            echo '✅ Pipeline completed successfully!'
        }

        failure {
            slackSend(
                channel: '#alerts',
                color: 'danger',
                message: "❌ Pipeline FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}\n${env.BUILD_URL}"
            )

            emailext(
                subject: "Jenkins Build Failed: ${env.JOB_NAME}",
                body: """
                    <h2>Build Failed</h2>
                    <p>Job: ${env.JOB_NAME}</p>
                    <p>Build: #${env.BUILD_NUMBER}</p>
                    <p>URL: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                """,
                to: '${DEFAULT_RECIPIENTS}',
                mimeType: 'text/html'
            )
        }

        unstable {
            slackSend(
                channel: '#alerts',
                color: 'warning',
                message: "⚠️ Pipeline UNSTABLE: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )
        }
    }
}
```

---

## Pipelines Scriptés

### Pipeline Scripté Avancé

```groovy
// Jenkinsfile (Scripted)
node('docker') {
    def imageTag = ''
    def dockerImage = null

    try {
        stage('Checkout') {
            checkout scm
            imageTag = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
        }

        stage('Build') {
            docker.image('node:20-alpine').inside {
                sh '''
                    corepack enable
                    pnpm install --frozen-lockfile
                    pnpm build
                '''
            }
        }

        stage('Test') {
            docker.image('node:20-alpine').inside {
                sh 'pnpm test'
            }
        }

        stage('Docker Build') {
            dockerImage = docker.build("myapp:${imageTag}")
        }

        stage('Docker Push') {
            docker.withRegistry('https://registry.example.com', 'docker-credentials') {
                dockerImage.push()
                dockerImage.push('latest')
            }
        }

        stage('Deploy') {
            if (env.BRANCH_NAME == 'main') {
                input message: 'Deploy to production?'
                sh "kubectl set image deployment/myapp myapp=myapp:${imageTag}"
            }
        }

    } catch (Exception e) {
        currentBuild.result = 'FAILURE'
        throw e
    } finally {
        cleanWs()
    }
}
```

---

## Intégration Docker

### Docker Agent

```groovy
// Jenkinsfile avec Docker Agent
pipeline {
    agent {
        docker {
            image 'node:20-alpine'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }

    stages {
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
    }
}
```

### Docker Compose dans Pipeline

```groovy
// Pipeline avec Docker Compose
stage('Integration Tests') {
    steps {
        sh 'docker-compose -f docker-compose.test.yml up -d'

        sh '''
            # Attendre que les services soient prêts
            ./scripts/wait-for-services.sh

            # Exécuter les tests
            docker-compose -f docker-compose.test.yml exec -T app pnpm test:integration
        '''
    }
    post {
        always {
            sh 'docker-compose -f docker-compose.test.yml down -v'
        }
    }
}
```

### Multi-stage Docker Build

```dockerfile
# Dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG VERSION
ENV NEXT_PUBLIC_VERSION=$VERSION
RUN pnpm build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

---

## Multibranch Pipeline

### Configuration Multibranch

```groovy
// Jenkinsfile pour Multibranch
pipeline {
    agent any

    stages {
        stage('Branch Logic') {
            steps {
                script {
                    switch(env.BRANCH_NAME) {
                        case 'main':
                            env.DEPLOY_ENV = 'production'
                            env.DEPLOY_ENABLED = 'true'
                            break
                        case 'develop':
                            env.DEPLOY_ENV = 'staging'
                            env.DEPLOY_ENABLED = 'true'
                            break
                        case ~/^feature\/.*/:
                            env.DEPLOY_ENV = 'preview'
                            env.DEPLOY_ENABLED = 'true'
                            break
                        default:
                            env.DEPLOY_ENV = 'none'
                            env.DEPLOY_ENABLED = 'false'
                    }
                }
            }
        }

        stage('Build') {
            steps {
                sh 'pnpm build'
            }
        }

        stage('Deploy') {
            when {
                environment name: 'DEPLOY_ENABLED', value: 'true'
            }
            steps {
                echo "Deploying to ${env.DEPLOY_ENV}"
                // Deploy logic
            }
        }
    }
}
```

### Organisation GitHub

```yaml
# Jenkins Configuration as Code pour GitHub Organization
jenkins:
  organizationFolder:
    organizations:
      - github:
          apiUri: https://api.github.com
          credentialsId: github-app
          repoOwner: my-org
          traits:
            - gitHubBranchDiscovery:
                strategyId: 1
            - gitHubPullRequestDiscovery:
                strategyId: 1
            - gitHubForkDiscovery:
                strategyId: 1
                trust:
                  class: TrustContributors
```

---

## Shared Libraries

### Structure de la Library

```
jenkins-shared-library/
├── vars/
│   ├── buildPipeline.groovy      # Pipeline complet
│   ├── dockerBuild.groovy        # Build Docker
│   ├── deployToK8s.groovy        # Deploy Kubernetes
│   ├── notifySlack.groovy        # Notifications
│   └── sonarScan.groovy          # SonarQube
├── src/
│   └── com/
│       └── mycompany/
│           └── jenkins/
│               ├── Docker.groovy
│               ├── Kubernetes.groovy
│               └── Notifications.groovy
└── resources/
    └── templates/
        └── email.html
```

### buildPipeline.groovy

```groovy
// vars/buildPipeline.groovy

def call(Map config = [:]) {
    def defaults = [
        nodeVersion: '20',
        dockerRegistry: 'registry.example.com',
        slackChannel: '#deployments',
        sonarEnabled: true,
        fortifyEnabled: false,
    ]

    config = defaults + config

    pipeline {
        agent {
            kubernetes {
                yaml libraryResource('pod-templates/build-agent.yaml')
            }
        }

        environment {
            DOCKER_REGISTRY = "${config.dockerRegistry}"
        }

        stages {
            stage('Setup') {
                steps {
                    script {
                        env.IMAGE_TAG = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    }
                }
            }

            stage('Install') {
                steps {
                    container('node') {
                        sh "pnpm install --frozen-lockfile"
                    }
                }
            }

            stage('Lint & Test') {
                parallel {
                    stage('Lint') {
                        steps {
                            container('node') {
                                sh 'pnpm lint'
                            }
                        }
                    }
                    stage('Test') {
                        steps {
                            container('node') {
                                sh 'pnpm test:unit --coverage'
                            }
                        }
                    }
                }
            }

            stage('Security Scan') {
                when {
                    expression { config.sonarEnabled }
                }
                steps {
                    sonarScan(projectKey: env.JOB_NAME)
                }
            }

            stage('Build') {
                steps {
                    container('node') {
                        sh 'pnpm build'
                    }
                }
            }

            stage('Docker') {
                when {
                    anyOf {
                        branch 'main'
                        branch 'develop'
                    }
                }
                steps {
                    dockerBuild(
                        imageName: config.imageName ?: env.JOB_NAME,
                        tag: env.IMAGE_TAG
                    )
                }
            }

            stage('Deploy') {
                when {
                    branch 'main'
                }
                steps {
                    deployToK8s(
                        environment: 'production',
                        imageTag: env.IMAGE_TAG
                    )
                }
            }
        }

        post {
            success {
                notifySlack(
                    channel: config.slackChannel,
                    status: 'SUCCESS'
                )
            }
            failure {
                notifySlack(
                    channel: config.slackChannel,
                    status: 'FAILURE'
                )
            }
        }
    }
}
```

### sonarScan.groovy

```groovy
// vars/sonarScan.groovy

def call(Map config = [:]) {
    def projectKey = config.projectKey ?: env.JOB_NAME
    def sources = config.sources ?: 'src'

    container('sonar') {
        withSonarQubeEnv('SonarQube') {
            sh """
                sonar-scanner \
                    -Dsonar.projectKey=${projectKey} \
                    -Dsonar.sources=${sources} \
                    -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
            """
        }
    }

    timeout(time: 5, unit: 'MINUTES') {
        def qg = waitForQualityGate()
        if (qg.status != 'OK') {
            error "Quality Gate failed: ${qg.status}"
        }
    }
}
```

### Utilisation de la Library

```groovy
// Jenkinsfile utilisant la shared library
@Library('my-shared-library@main') _

buildPipeline(
    imageName: 'my-app',
    sonarEnabled: true,
    fortifyEnabled: true,
    slackChannel: '#my-team'
)
```

---

## Sécurité

### Gestion des Credentials

```groovy
// Utilisation sécurisée des credentials
pipeline {
    environment {
        // Credentials automatiquement masqués dans les logs
        DOCKER_CREDS = credentials('docker-registry')
        AWS_CREDS = credentials('aws-credentials')
        SSH_KEY = credentials('ssh-deploy-key')
    }

    stages {
        stage('Deploy') {
            steps {
                // Username/Password
                sh 'docker login -u $DOCKER_CREDS_USR -p $DOCKER_CREDS_PSW'

                // AWS
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding',
                                  credentialsId: 'aws-credentials']]) {
                    sh 'aws s3 sync ./dist s3://my-bucket'
                }

                // SSH
                sshagent(['ssh-deploy-key']) {
                    sh 'ssh user@server "deploy.sh"'
                }
            }
        }
    }
}
```

### RBAC et Permissions

```yaml
# Matrice de permissions
jenkins:
  authorizationStrategy:
    roleBased:
      roles:
        global:
          - name: admin
            permissions:
              - Overall/Administer
            entries:
              - group: admins

          - name: developer
            permissions:
              - Overall/Read
              - Job/Build
              - Job/Cancel
              - Job/Read
              - Job/Workspace
              - View/Read
            entries:
              - group: developers

          - name: viewer
            permissions:
              - Overall/Read
              - Job/Read
              - View/Read
            entries:
              - group: viewers

        items:
          - name: project-admin
            pattern: "my-project.*"
            permissions:
              - Job/Configure
              - Job/Delete
              - Job/Build
            entries:
              - user: project-lead
```

---

## Best Practices

### Checklist Jenkins

```markdown
## Configuration
- [ ] Jenkins as Code (JCasC) configuré
- [ ] Plugins maintenus à jour
- [ ] Agents dynamiques (Kubernetes/Docker)
- [ ] Credentials sécurisés (pas de hardcoding)
- [ ] RBAC configuré

## Pipelines
- [ ] Jenkinsfile versionné dans le repo
- [ ] Pipelines déclaratifs préférés
- [ ] Shared Libraries pour réutilisation
- [ ] Timeout configuré
- [ ] Cleanup automatique (cleanWs)

## Qualité
- [ ] SonarQube intégré
- [ ] Quality Gates bloquants
- [ ] Tests avec couverture
- [ ] Rapports publiés (HTML Publisher)

## Sécurité
- [ ] Fortify/SAST intégré
- [ ] Audit des dépendances
- [ ] Scan des images Docker
- [ ] Credentials non exposés

## Notifications
- [ ] Slack/Teams configuré
- [ ] Email pour les failures
- [ ] Alertes PagerDuty pour prod

## Maintenance
- [ ] Backup automatique
- [ ] Log rotation
- [ ] Monitoring Jenkins
- [ ] Cleanup des anciens builds
```

### Anti-Patterns à Éviter

```groovy
// ❌ NE PAS FAIRE

// 1. Credentials en clair
sh 'docker login -u admin -p mysecretpassword'

// 2. Ignorer les erreurs
sh 'npm test || true'  // ❌ Masque les échecs

// 3. Pas de timeout
// Le build peut bloquer indéfiniment

// 4. Script inline trop long
sh '''
    # 200 lignes de code...
'''

// 5. Pas de cleanup
// Workspace grandit indéfiniment


// ✅ BONNES PRATIQUES

// 1. Utiliser credentials
withCredentials([usernamePassword(credentialsId: 'docker', ...)]) {
    sh 'docker login -u $USER -p $PASS'
}

// 2. Échouer explicitement
sh 'npm test'
// Ou gérer l'erreur proprement
script {
    def result = sh(script: 'npm test', returnStatus: true)
    if (result != 0) {
        unstable('Tests failed')
    }
}

// 3. Toujours un timeout
options {
    timeout(time: 30, unit: 'MINUTES')
}

// 4. Scripts externes
sh './scripts/build.sh'

// 5. Cleanup automatique
post {
    always {
        cleanWs()
    }
}
```
