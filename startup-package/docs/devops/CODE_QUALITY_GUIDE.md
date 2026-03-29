# Guide Analyse de Code & Qualité

> SonarQube, Fortify, et outils d'analyse statique pour code enterprise-grade

## Table des Matières

1. [Introduction](#introduction)
2. [SonarQube](#sonarqube)
3. [Fortify SAST](#fortify-sast)
4. [ESLint & Prettier](#eslint--prettier)
5. [Code Coverage](#code-coverage)
6. [Quality Gates](#quality-gates)
7. [Intégration CI/CD](#intégration-cicd)
8. [Best Practices](#best-practices)

---

## Introduction

### Pyramide de la Qualité

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Code Quality Pyramid                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                           ┌─────────┐                                       │
│                           │ Security│  ← Fortify, Snyk, OWASP              │
│                           │  SAST   │                                       │
│                        ┌──┴─────────┴──┐                                   │
│                        │   Code Smells  │  ← SonarQube                     │
│                        │  Tech Debt     │                                   │
│                     ┌──┴───────────────┴──┐                                │
│                     │    Code Coverage    │  ← Jest, Istanbul              │
│                     │    Unit Tests       │                                 │
│                  ┌──┴─────────────────────┴──┐                             │
│                  │   Linting & Formatting    │  ← ESLint, Prettier         │
│                  │   Type Checking           │  ← TypeScript               │
│               ┌──┴───────────────────────────┴──┐                          │
│               │        Code Review              │  ← GitHub/GitLab          │
│               │        Pull Requests            │                           │
│               └─────────────────────────────────┘                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Outils par Catégorie

| Catégorie | Outils | Usage |
|-----------|--------|-------|
| **SAST** | Fortify, Checkmarx, SonarQube | Vulnérabilités de sécurité |
| **Code Quality** | SonarQube, CodeClimate | Maintenabilité, dette technique |
| **Linting** | ESLint, Biome | Style, bonnes pratiques |
| **Formatting** | Prettier | Formatage consistant |
| **Type Check** | TypeScript | Types statiques |
| **Coverage** | Istanbul, Jest | Couverture de tests |
| **Dependencies** | Snyk, npm audit | Vulnérabilités dépendances |

---

## SonarQube

### Installation Docker

```yaml
# docker-compose.sonarqube.yml
version: '3.8'

services:
  sonarqube:
    image: sonarqube:lts-community
    container_name: sonarqube
    restart: unless-stopped
    ports:
      - "9000:9000"
    environment:
      - SONAR_JDBC_URL=jdbc:postgresql://sonar-db:5432/sonar
      - SONAR_JDBC_USERNAME=sonar
      - SONAR_JDBC_PASSWORD=sonar
    volumes:
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_extensions:/opt/sonarqube/extensions
      - sonarqube_logs:/opt/sonarqube/logs
    depends_on:
      - sonar-db
    networks:
      - sonar-network

  sonar-db:
    image: postgres:15-alpine
    container_name: sonar-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=sonar
      - POSTGRES_PASSWORD=sonar
      - POSTGRES_DB=sonar
    volumes:
      - sonar_postgres_data:/var/lib/postgresql/data
    networks:
      - sonar-network

volumes:
  sonarqube_data:
  sonarqube_extensions:
  sonarqube_logs:
  sonar_postgres_data:

networks:
  sonar-network:
    driver: bridge
```

### Configuration Projet

```properties
# sonar-project.properties
sonar.projectKey=myapp
sonar.projectName=My Application
sonar.projectVersion=1.0.0

# Sources
sonar.sources=src
sonar.tests=tests
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts

# Exclusions
sonar.exclusions=\
  **/node_modules/**,\
  **/*.test.ts,\
  **/*.spec.ts,\
  **/coverage/**,\
  **/.next/**,\
  **/dist/**

# TypeScript/JavaScript
sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.javascript.lcov.reportPaths=coverage/lcov.info

# Test reports
sonar.testExecutionReportPaths=test-report.xml

# Encoding
sonar.sourceEncoding=UTF-8

# Quality Gate
sonar.qualitygate.wait=true
```

### Scanner CLI

```bash
#!/bin/bash
# scripts/sonar-scan.sh

# Variables
SONAR_HOST="${SONAR_HOST:-http://localhost:9000}"
SONAR_TOKEN="${SONAR_TOKEN}"
PROJECT_VERSION=$(node -p "require('./package.json').version")

# Exécuter les tests avec couverture
pnpm test:unit --coverage --reporters=default --reporters=jest-sonar

# Scanner SonarQube
docker run --rm \
  -e SONAR_HOST_URL="${SONAR_HOST}" \
  -e SONAR_TOKEN="${SONAR_TOKEN}" \
  -v "$(pwd):/usr/src" \
  sonarsource/sonar-scanner-cli \
  -Dsonar.projectVersion="${PROJECT_VERSION}" \
  -Dsonar.branch.name="${BRANCH_NAME:-main}"
```

### Règles Personnalisées

```json
// .sonarqube/quality-profile.json
{
  "name": "MyApp TypeScript Profile",
  "language": "ts",
  "rules": [
    {
      "key": "typescript:S1186",
      "severity": "MAJOR",
      "parameters": {}
    },
    {
      "key": "typescript:S3776",
      "severity": "CRITICAL",
      "parameters": {
        "threshold": "15"
      }
    },
    {
      "key": "typescript:S1541",
      "severity": "MAJOR",
      "parameters": {
        "threshold": "10"
      }
    }
  ]
}
```

### Quality Gate Custom

```json
// Quality Gate Configuration
{
  "name": "MyApp Quality Gate",
  "conditions": [
    {
      "metric": "new_reliability_rating",
      "op": "GT",
      "error": "1"
    },
    {
      "metric": "new_security_rating",
      "op": "GT",
      "error": "1"
    },
    {
      "metric": "new_maintainability_rating",
      "op": "GT",
      "error": "1"
    },
    {
      "metric": "new_coverage",
      "op": "LT",
      "error": "80"
    },
    {
      "metric": "new_duplicated_lines_density",
      "op": "GT",
      "error": "3"
    },
    {
      "metric": "new_security_hotspots_reviewed",
      "op": "LT",
      "error": "100"
    }
  ]
}
```

---

## Fortify SAST

### Introduction Fortify

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Fortify SAST                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Fortify Static Code Analyzer (SCA) est un outil enterprise de              │
│  Micro Focus pour l'analyse de sécurité du code source.                     │
│                                                                              │
│  Détections:                                                                 │
│  • Injection (SQL, OS, LDAP, XPath)                                        │
│  • Cross-Site Scripting (XSS)                                              │
│  • Cross-Site Request Forgery (CSRF)                                       │
│  • Buffer Overflow                                                          │
│  • Path Manipulation                                                         │
│  • Privacy Violations                                                        │
│  • Weak Cryptography                                                         │
│  • Race Conditions                                                          │
│                                                                              │
│  Standards supportés:                                                        │
│  • OWASP Top 10                                                             │
│  • CWE/SANS Top 25                                                          │
│  • PCI DSS                                                                  │
│  • HIPAA                                                                    │
│  • GDPR                                                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Configuration Fortify

```xml
<!-- fortify-sca.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<Configuration>
    <Project>
        <Name>MyApp</Name>
        <Version>1.0.0</Version>
    </Project>

    <Build>
        <SourceBasePath>./src</SourceBasePath>
        <ExcludePath>./node_modules</ExcludePath>
        <ExcludePath>./coverage</ExcludePath>
        <ExcludePath>./.next</ExcludePath>
        <ExcludePath>./tests</ExcludePath>
    </Build>

    <Scan>
        <EnableDataflow>true</EnableDataflow>
        <EnableControlflow>true</EnableControlflow>
        <EnableSemantic>true</EnableSemantic>
        <EnableStructural>true</EnableStructural>
        <EnableConfiguration>true</EnableConfiguration>
    </Scan>

    <Rules>
        <RulePack>JavaScript</RulePack>
        <RulePack>TypeScript</RulePack>
        <CustomRulePack>./fortify-rules/custom.xml</CustomRulePack>
    </Rules>

    <Filters>
        <MinSeverity>Low</MinSeverity>
        <Categories>
            <Include>Injection</Include>
            <Include>Cross-Site Scripting</Include>
            <Include>Insecure Storage</Include>
            <Include>Privacy Violation</Include>
        </Categories>
    </Filters>
</Configuration>
```

### Script d'Analyse Fortify

```bash
#!/bin/bash
# scripts/fortify-scan.sh

set -e

# Variables
BUILD_ID="${BUILD_ID:-$(date +%Y%m%d_%H%M%S)}"
PROJECT_NAME="MyApp"
PROJECT_VERSION="${PROJECT_VERSION:-1.0.0}"
FPR_FILE="fortify-results.fpr"

echo "=== Fortify SAST Scan ==="
echo "Build ID: ${BUILD_ID}"
echo "Project: ${PROJECT_NAME} v${PROJECT_VERSION}"

# 1. Nettoyer les scans précédents
echo "Cleaning previous scans..."
sourceanalyzer -b "${BUILD_ID}" -clean

# 2. Traduire le code source
echo "Translating source code..."
sourceanalyzer -b "${BUILD_ID}" \
    -source 1.8 \
    -exclude "**/node_modules/**" \
    -exclude "**/coverage/**" \
    -exclude "**/.next/**" \
    -exclude "**/dist/**" \
    -exclude "**/*.test.ts" \
    -exclude "**/*.spec.ts" \
    src/**/*.ts src/**/*.tsx

# 3. Exécuter l'analyse
echo "Running security analysis..."
sourceanalyzer -b "${BUILD_ID}" \
    -scan \
    -f "${FPR_FILE}" \
    -rules fortify-rules/custom.xml

# 4. Générer le rapport
echo "Generating reports..."
ReportGenerator \
    -format pdf \
    -f "fortify-report.pdf" \
    -source "${FPR_FILE}"

ReportGenerator \
    -format xml \
    -f "fortify-report.xml" \
    -source "${FPR_FILE}"

# 5. Vérifier les seuils de sécurité
echo "Checking security thresholds..."
FPRUtility -information -categoryIssueCounts -project "${FPR_FILE}" > issues.txt

CRITICAL=$(grep "Critical:" issues.txt | awk '{print $2}' || echo "0")
HIGH=$(grep "High:" issues.txt | awk '{print $2}' || echo "0")

echo "Critical issues: ${CRITICAL}"
echo "High issues: ${HIGH}"

if [ "${CRITICAL}" -gt 0 ]; then
    echo "❌ FAILED: ${CRITICAL} critical vulnerabilities found!"
    exit 1
fi

if [ "${HIGH}" -gt 5 ]; then
    echo "❌ FAILED: More than 5 high vulnerabilities found!"
    exit 1
fi

echo "✅ Security scan passed!"

# 6. Upload vers Fortify SSC (Software Security Center)
if [ -n "${SSC_URL}" ] && [ -n "${SSC_TOKEN}" ]; then
    echo "Uploading to Fortify SSC..."
    fortifyclient \
        -url "${SSC_URL}" \
        -authtoken "${SSC_TOKEN}" \
        -application "${PROJECT_NAME}" \
        -applicationVersion "${PROJECT_VERSION}" \
        uploadFPR \
        -file "${FPR_FILE}"
fi
```

### Intégration Jenkins Fortify

```groovy
// Jenkinsfile - Stage Fortify
stage('Security Scan - Fortify') {
    when {
        anyOf {
            branch 'main'
            branch 'develop'
        }
    }
    steps {
        // Analyse Fortify
        fortifyClean(buildID: "${JOB_NAME}-${BUILD_NUMBER}")

        fortifyTranslate(
            buildID: "${JOB_NAME}-${BUILD_NUMBER}",
            projectScanType: 'javascript',
            excludeList: 'node_modules,coverage,.next,dist'
        )

        fortifyScan(
            buildID: "${JOB_NAME}-${BUILD_NUMBER}",
            resultsFile: 'fortify-results.fpr',
            customRulesFile: 'fortify-rules/custom.xml'
        )

        // Upload vers SSC
        fortifyUpload(
            appName: env.JOB_NAME,
            appVersion: env.IMAGE_TAG,
            resultsFile: 'fortify-results.fpr'
        )

        // Vérifier les seuils
        script {
            def issues = fortifyReport(
                resultsFile: 'fortify-results.fpr'
            )

            if (issues.critical > 0) {
                error("Critical vulnerabilities found: ${issues.critical}")
            }

            if (issues.high > 5) {
                unstable("High vulnerabilities exceed threshold: ${issues.high}")
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'fortify-*.fpr,fortify-*.pdf'
        }
    }
}
```

---

## ESLint & Prettier

### Configuration ESLint Stricte

```javascript
// eslint.config.js (Flat Config)
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import securityPlugin from 'eslint-plugin-security';
import sonarjsPlugin from 'eslint-plugin-sonarjs';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      import: importPlugin,
      security: securityPlugin,
      sonarjs: sonarjsPlugin,
    },

    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    rules: {
      // TypeScript Strict
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',

      // React
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Import
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc' },
      }],
      'import/no-duplicates': 'error',
      'import/no-cycle': 'error',

      // Security
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'error',
      'security/detect-eval-with-expression': 'error',

      // SonarJS (cognitive complexity)
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-duplicate-string': ['error', 3],
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-collapsible-if': 'error',

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
    },
  },

  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'coverage/**',
      'dist/**',
      '*.config.js',
    ],
  }
);
```

### Configuration Prettier

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindFunctions": ["clsx", "cn", "cva"]
}
```

```gitignore
# .prettierignore
node_modules
.next
coverage
dist
pnpm-lock.yaml
*.min.js
*.min.css
```

---

## Code Coverage

### Configuration Jest

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',

  // Coverage
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/index.{js,ts}',
    '!src/types/**/*',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'cobertura'],

  // Seuils de couverture
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Seuils par dossier
    './src/lib/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },

  // Reporters
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-results',
      outputName: 'junit.xml',
    }],
    ['jest-sonar', {
      outputDirectory: './test-results',
      outputName: 'test-report.xml',
    }],
  ],
};

module.exports = createJestConfig(customJestConfig);
```

---

## Quality Gates

### Définition Quality Gates

```yaml
# quality-gates.yml
quality_gates:
  development:
    coverage:
      min_percentage: 70
    duplications:
      max_percentage: 5
    issues:
      max_critical: 0
      max_high: 10
      max_medium: 50
    complexity:
      max_cognitive: 20
      max_cyclomatic: 15

  staging:
    coverage:
      min_percentage: 80
    duplications:
      max_percentage: 3
    issues:
      max_critical: 0
      max_high: 5
      max_medium: 25
    security:
      max_vulnerabilities: 0
      max_hotspots_unreviewed: 0

  production:
    coverage:
      min_percentage: 85
    duplications:
      max_percentage: 2
    issues:
      max_critical: 0
      max_high: 0
      max_medium: 10
    security:
      max_vulnerabilities: 0
      max_hotspots_unreviewed: 0
    maintainability:
      max_debt_ratio: 5
```

### Script de Vérification

```typescript
// scripts/quality-gate.ts
import { execSync } from 'child_process';
import fs from 'fs';

interface QualityMetrics {
  coverage: number;
  duplications: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  cognitiveComplexity: number;
  technicalDebt: number;
}

interface QualityThresholds {
  minCoverage: number;
  maxDuplications: number;
  maxCritical: number;
  maxHigh: number;
  maxMedium: number;
  maxComplexity: number;
  maxDebtRatio: number;
}

const thresholds: Record<string, QualityThresholds> = {
  development: {
    minCoverage: 70,
    maxDuplications: 5,
    maxCritical: 0,
    maxHigh: 10,
    maxMedium: 50,
    maxComplexity: 20,
    maxDebtRatio: 10,
  },
  staging: {
    minCoverage: 80,
    maxDuplications: 3,
    maxCritical: 0,
    maxHigh: 5,
    maxMedium: 25,
    maxComplexity: 15,
    maxDebtRatio: 7,
  },
  production: {
    minCoverage: 85,
    maxDuplications: 2,
    maxCritical: 0,
    maxHigh: 0,
    maxMedium: 10,
    maxComplexity: 15,
    maxDebtRatio: 5,
  },
};

async function checkQualityGate(env: string): Promise<boolean> {
  const threshold = thresholds[env] || thresholds.development;
  const metrics = await getMetrics();
  const failures: string[] = [];

  if (metrics.coverage < threshold.minCoverage) {
    failures.push(`Coverage ${metrics.coverage}% < ${threshold.minCoverage}%`);
  }

  if (metrics.duplications > threshold.maxDuplications) {
    failures.push(`Duplications ${metrics.duplications}% > ${threshold.maxDuplications}%`);
  }

  if (metrics.criticalIssues > threshold.maxCritical) {
    failures.push(`Critical issues ${metrics.criticalIssues} > ${threshold.maxCritical}`);
  }

  if (metrics.highIssues > threshold.maxHigh) {
    failures.push(`High issues ${metrics.highIssues} > ${threshold.maxHigh}`);
  }

  if (failures.length > 0) {
    console.error('❌ Quality Gate FAILED:');
    failures.forEach((f) => console.error(`  - ${f}`));
    return false;
  }

  console.log('✅ Quality Gate PASSED');
  return true;
}

async function getMetrics(): Promise<QualityMetrics> {
  // Récupérer depuis SonarQube API
  const response = await fetch(
    `${process.env.SONAR_HOST}/api/measures/component?component=${process.env.PROJECT_KEY}&metricKeys=coverage,duplicated_lines_density,critical_violations,major_violations`
  );
  const data = await response.json();

  return {
    coverage: parseFloat(data.component.measures.find((m: any) => m.metric === 'coverage')?.value || '0'),
    duplications: parseFloat(data.component.measures.find((m: any) => m.metric === 'duplicated_lines_density')?.value || '0'),
    criticalIssues: parseInt(data.component.measures.find((m: any) => m.metric === 'critical_violations')?.value || '0'),
    highIssues: parseInt(data.component.measures.find((m: any) => m.metric === 'major_violations')?.value || '0'),
    mediumIssues: 0,
    cognitiveComplexity: 0,
    technicalDebt: 0,
  };
}

// Exécution
const env = process.argv[2] || 'development';
checkQualityGate(env).then((passed) => {
  process.exit(passed ? 0 : 1);
});
```

---

## Intégration CI/CD

### GitHub Actions avec SonarQube

```yaml
# .github/workflows/quality.yml
name: Code Quality

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      # ESLint
      - name: Run ESLint
        run: pnpm lint --format json --output-file eslint-report.json
        continue-on-error: true

      # Tests avec couverture
      - name: Run Tests
        run: pnpm test:unit --coverage

      # SonarQube
      - name: SonarQube Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        with:
          args: >
            -Dsonar.projectKey=${{ github.repository_owner }}_${{ github.event.repository.name }}
            -Dsonar.organization=${{ github.repository_owner }}
            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
            -Dsonar.eslint.reportPaths=eslint-report.json

      # Quality Gate
      - name: Quality Gate
        uses: SonarSource/sonarqube-quality-gate-action@master
        timeout-minutes: 5
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### Jenkins Pipeline Complet

```groovy
// Jenkinsfile - Quality Pipeline
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                sh 'pnpm install --frozen-lockfile'
            }
        }

        stage('Quality Checks') {
            parallel {
                stage('ESLint') {
                    steps {
                        sh 'pnpm lint --format checkstyle -o eslint-report.xml || true'
                    }
                    post {
                        always {
                            recordIssues(
                                tools: [esLint(pattern: 'eslint-report.xml')]
                            )
                        }
                    }
                }

                stage('TypeScript') {
                    steps {
                        sh 'pnpm type-check'
                    }
                }

                stage('Unit Tests') {
                    steps {
                        sh 'pnpm test:unit --coverage'
                    }
                    post {
                        always {
                            junit 'test-results/junit.xml'
                            publishHTML([
                                reportDir: 'coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Coverage Report'
                            ])
                        }
                    }
                }
            }
        }

        stage('SonarQube') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        sonar-scanner \
                            -Dsonar.projectKey=${JOB_NAME} \
                            -Dsonar.sources=src \
                            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Fortify') {
            when {
                branch 'main'
            }
            steps {
                fortifyClean buildID: "${JOB_NAME}"
                fortifyTranslate buildID: "${JOB_NAME}", projectScanType: 'javascript'
                fortifyScan buildID: "${JOB_NAME}", resultsFile: 'fortify.fpr'
                fortifyUpload appName: "${JOB_NAME}", appVersion: "${BUILD_NUMBER}", resultsFile: 'fortify.fpr'
            }
        }
    }
}
```

---

## Best Practices

### Checklist Qualité de Code

```markdown
## Configuration
- [ ] ESLint avec règles strictes
- [ ] Prettier configuré
- [ ] TypeScript strict mode
- [ ] Pre-commit hooks (Husky)
- [ ] SonarQube intégré
- [ ] Fortify pour branches principales

## Quality Gates
- [ ] Couverture minimum définie (80%+)
- [ ] Seuils de duplication (< 3%)
- [ ] Zéro vulnérabilité critique
- [ ] Complexité cognitive limitée
- [ ] Dette technique trackée

## CI/CD
- [ ] Analyse sur chaque PR
- [ ] Quality Gate bloquant
- [ ] Rapports publiés
- [ ] Tendances suivies
- [ ] Alertes configurées

## Sécurité
- [ ] SAST sur chaque build
- [ ] Scan des dépendances
- [ ] Revue des hotspots
- [ ] Conformité OWASP
```

### Métriques à Suivre

| Métrique | Cible | Critique |
|----------|-------|----------|
| **Coverage** | > 80% | < 60% |
| **Duplications** | < 3% | > 10% |
| **Complexité cognitive** | < 15 | > 25 |
| **Dette technique** | < 5% | > 15% |
| **Vulnérabilités** | 0 | > 0 Critical |
| **Code Smells** | < 50 | > 200 |
| **Bugs** | 0 | > 5 |
