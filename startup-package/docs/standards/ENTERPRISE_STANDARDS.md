# Standards de Développement Enterprise

> Bonnes pratiques utilisées par les grandes entreprises et applications internationales

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Standards de Code](#standards-de-code)
3. [Architecture Logicielle](#architecture-logicielle)
4. [Qualité et Tests](#qualité-et-tests)
5. [Sécurité](#sécurité)
6. [DevOps et CI/CD](#devops-et-cicd)
7. [Monitoring et Observabilité](#monitoring-et-observabilité)
8. [Documentation](#documentation)
9. [Gouvernance](#gouvernance)
10. [Conformité et Régulation](#conformité-et-régulation)

---

## 1. Vue d'Ensemble

### Standards Adoptés par les Leaders

| Entreprise | Standards Clés |
|------------|---------------|
| **Google** | Design Docs, Monorepo, Code Review obligatoire, SRE |
| **Amazon** | Two-Pizza Teams, Microservices, Working Backwards |
| **Meta** | Trunk-Based Development, Feature Flags, Continuous Deployment |
| **Netflix** | Chaos Engineering, Microservices, Full Cycle Developers |
| **Microsoft** | Inner Source, DevSecOps, Zero Trust |
| **Spotify** | Squads/Tribes/Chapters, Autonomous Teams |
| **Airbnb** | Design Systems, A/B Testing, Data-Driven Decisions |

### Principes Fondamentaux

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PRINCIPES ENTERPRISE                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    FIABILITÉ (Reliability)                  │    │
│  │  • SLA 99.99% uptime                                        │    │
│  │  • Disaster Recovery < 1h RTO                               │    │
│  │  • Zero downtime deployments                                │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    SCALABILITÉ (Scalability)                │    │
│  │  • Horizontal scaling                                       │    │
│  │  • Auto-scaling basé sur les métriques                     │    │
│  │  • Database sharding, CDN global                           │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    SÉCURITÉ (Security)                      │    │
│  │  • Zero Trust Architecture                                  │    │
│  │  • Security by Design                                       │    │
│  │  • Compliance (SOC2, ISO27001, GDPR)                       │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    MAINTENABILITÉ (Maintainability)         │    │
│  │  • Clean Code, SOLID principles                             │    │
│  │  • Comprehensive documentation                              │    │
│  │  • Automated testing > 80% coverage                        │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Standards de Code

### 2.1 Style Guide et Conventions

```typescript
// =============================================================================
// CONVENTIONS DE NOMMAGE (suivies par Google, Airbnb, Microsoft)
// =============================================================================

// Variables et fonctions: camelCase
const userProfile = {};
function getUserById(id: string) {}

// Constantes: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = process.env.API_URL;

// Classes et Types: PascalCase
class UserService {}
interface UserProfile {}
type PaymentMethod = 'card' | 'paypal';

// Fichiers de composants: PascalCase
// UserProfile.tsx, PaymentForm.tsx

// Fichiers utilitaires: camelCase ou kebab-case
// formatDate.ts, string-utils.ts

// Constantes globales: kebab-case
// api-endpoints.ts, error-codes.ts

// Tests: *.test.ts ou *.spec.ts
// UserService.test.ts
```

### 2.2 ESLint Configuration Enterprise

```javascript
// .eslintrc.js (Configuration stricte niveau enterprise)
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'import',
    'jsx-a11y',
    'security',
    'sonarjs',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
    'plugin:security/recommended',
    'plugin:sonarjs/recommended',
  ],
  rules: {
    // =========================================================================
    // TypeScript Strict Rules
    // =========================================================================
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',

    // =========================================================================
    // Import Rules
    // =========================================================================
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-cycle': 'error',
    'import/no-unresolved': 'error',
    'import/no-default-export': 'warn', // Prefer named exports

    // =========================================================================
    // Code Quality (SonarJS)
    // =========================================================================
    'sonarjs/cognitive-complexity': ['error', 15],
    'sonarjs/no-duplicate-string': ['error', { threshold: 3 }],
    'sonarjs/no-identical-functions': 'error',
    'sonarjs/no-collapsible-if': 'error',

    // =========================================================================
    // Security Rules
    // =========================================================================
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',

    // =========================================================================
    // React Rules
    // =========================================================================
    'react/prop-types': 'off', // TypeScript handles this
    'react/react-in-jsx-scope': 'off', // Next.js handles this
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',

    // =========================================================================
    // Accessibility (a11y)
    // =========================================================================
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',

    // =========================================================================
    // General Best Practices
    // =========================================================================
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-alert': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
    'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
    'complexity': ['error', 10],
  },
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: { project: './tsconfig.json' },
    },
  },
};
```

### 2.3 TypeScript Configuration Stricte

```json
// tsconfig.json (Enterprise strict mode)
{
  "compilerOptions": {
    // Strict Mode (all strict checks enabled)
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,

    // Additional Strict Checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "exactOptionalPropertyTypes": true,

    // Module Resolution
    "moduleResolution": "bundler",
    "module": "ESNext",
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,

    // Path Aliases
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/domain/*": ["./src/domain/*"],
      "@/application/*": ["./src/application/*"],
      "@/infrastructure/*": ["./src/infrastructure/*"]
    },

    // Output
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    // Other
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist", "coverage"]
}
```

### 2.4 Code Review Standards

```markdown
## Checklist de Code Review (Google-style)

### Avant de soumettre la PR
- [ ] Tests passent localement
- [ ] Lint sans erreurs
- [ ] Types valides (tsc --noEmit)
- [ ] Documentation mise à jour
- [ ] Changelog mis à jour (si applicable)

### Design
- [ ] Le code fait ce qu'il est censé faire
- [ ] Le design est cohérent avec l'architecture existante
- [ ] Pas de sur-ingénierie
- [ ] Considérations de performance
- [ ] Considérations de sécurité

### Lisibilité et Maintenabilité
- [ ] Le code est facile à comprendre
- [ ] Les noms sont descriptifs
- [ ] Les commentaires expliquent le "pourquoi", pas le "quoi"
- [ ] Pas de code mort ou commenté
- [ ] Pas de TODO non traqués

### Testing
- [ ] Couverture de test adéquate
- [ ] Tests lisibles et maintenables
- [ ] Edge cases couverts
- [ ] Tests d'intégration si nécessaire

### Sécurité
- [ ] Pas de secrets hardcodés
- [ ] Input validation
- [ ] Output encoding
- [ ] Pas de vulnérabilités connues
```

---

## 3. Architecture Logicielle

### 3.1 Patterns d'Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PATTERNS D'ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  MONOLITH MODULAIRE (Shopify, GitHub)                               │
│  ├── Avantages: Simple, cohérent, facile à déployer                 │
│  └── Usage: MVP, équipes < 20 devs                                  │
│                                                                      │
│  MICROSERVICES (Netflix, Uber, Amazon)                              │
│  ├── Avantages: Scalabilité indépendante, résilience               │
│  └── Usage: Grande échelle, équipes distribuées                     │
│                                                                      │
│  SERVERLESS (Vercel, AWS Lambda)                                    │
│  ├── Avantages: Pas de gestion serveur, pay-per-use               │
│  └── Usage: Workloads variables, fonctions isolées                  │
│                                                                      │
│  EVENT-DRIVEN (LinkedIn, Uber)                                      │
│  ├── Avantages: Découplage, async, résilience                      │
│  └── Usage: Systèmes distribués, workflows complexes                │
│                                                                      │
│  HEXAGONAL / CLEAN (Banking, FinTech)                               │
│  ├── Avantages: Testabilité, flexibilité, maintenabilité           │
│  └── Usage: Domaines complexes, long-term projects                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Domain-Driven Design (DDD)

```typescript
// =============================================================================
// STRUCTURE DDD (Utilisée par: ING, Zalando, Netflix)
// =============================================================================

// Bounded Contexts
src/
├── domains/
│   ├── appointments/           # Bounded Context: Rendez-vous
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── Appointment.ts
│   │   │   │   └── TimeSlot.ts
│   │   │   ├── value-objects/
│   │   │   │   ├── AppointmentStatus.ts
│   │   │   │   └── Duration.ts
│   │   │   ├── repositories/
│   │   │   │   └── IAppointmentRepository.ts
│   │   │   ├── services/
│   │   │   │   └── AppointmentScheduler.ts
│   │   │   └── events/
│   │   │       ├── AppointmentCreated.ts
│   │   │       └── AppointmentCancelled.ts
│   │   ├── application/
│   │   │   ├── commands/
│   │   │   │   ├── CreateAppointment.ts
│   │   │   │   └── CancelAppointment.ts
│   │   │   ├── queries/
│   │   │   │   ├── GetAppointmentById.ts
│   │   │   │   └── GetDailyAppointments.ts
│   │   │   └── handlers/
│   │   │       ├── CreateAppointmentHandler.ts
│   │   │       └── AppointmentEventHandler.ts
│   │   └── infrastructure/
│   │       ├── persistence/
│   │       │   └── PrismaAppointmentRepository.ts
│   │       └── messaging/
│   │           └── AppointmentEventPublisher.ts
│   │
│   ├── clients/                # Bounded Context: Clients
│   │   └── ...
│   │
│   ├── billing/                # Bounded Context: Facturation
│   │   └── ...
│   │
│   └── shared/                 # Shared Kernel
│       ├── domain/
│       │   ├── Entity.ts
│       │   ├── ValueObject.ts
│       │   └── DomainEvent.ts
│       └── infrastructure/
│           ├── EventBus.ts
│           └── UnitOfWork.ts
```

### 3.3 CQRS + Event Sourcing

```typescript
// =============================================================================
// CQRS Pattern (Command Query Responsibility Segregation)
// Utilisé par: LMAX, Axon, EventStore
// =============================================================================

// Command (Write)
interface CreateAppointmentCommand {
  clientId: string;
  serviceId: string;
  scheduledAt: Date;
  braiderId: string;
}

class CreateAppointmentHandler {
  constructor(
    private repository: IAppointmentRepository,
    private eventBus: IEventBus
  ) {}

  async execute(command: CreateAppointmentCommand): Promise<string> {
    // Validation métier
    const appointment = Appointment.create({
      clientId: ClientId.create(command.clientId),
      serviceId: ServiceId.create(command.serviceId),
      scheduledAt: command.scheduledAt,
      braiderId: BraiderId.create(command.braiderId),
    });

    // Persistance
    await this.repository.save(appointment);

    // Publication événement
    await this.eventBus.publish(
      new AppointmentCreatedEvent(appointment.id, command)
    );

    return appointment.id.value;
  }
}

// Query (Read) - Modèle optimisé pour la lecture
interface AppointmentReadModel {
  id: string;
  clientName: string;
  serviceName: string;
  braiderName: string;
  scheduledAt: Date;
  status: string;
  duration: number;
  price: number;
}

class GetDailyAppointmentsHandler {
  constructor(private readDb: IReadDatabase) {}

  async execute(date: Date): Promise<AppointmentReadModel[]> {
    // Lecture optimisée depuis une vue dénormalisée
    return this.readDb.query(`
      SELECT * FROM appointments_view
      WHERE DATE(scheduled_at) = $1
      ORDER BY scheduled_at ASC
    `, [date]);
  }
}

// Event Sourcing
class AppointmentAggregate {
  private events: DomainEvent[] = [];

  static fromEvents(events: DomainEvent[]): AppointmentAggregate {
    const aggregate = new AppointmentAggregate();
    events.forEach(event => aggregate.apply(event));
    return aggregate;
  }

  private apply(event: DomainEvent): void {
    switch (event.type) {
      case 'AppointmentCreated':
        this.id = event.data.id;
        this.status = 'scheduled';
        break;
      case 'AppointmentConfirmed':
        this.status = 'confirmed';
        break;
      case 'AppointmentCancelled':
        this.status = 'cancelled';
        break;
    }
    this.events.push(event);
  }
}
```

### 3.4 API Design Standards

```typescript
// =============================================================================
// REST API Standards (Google API Design Guide)
// =============================================================================

// Resource Naming
// ✅ /api/v1/clients/{clientId}/appointments
// ❌ /api/v1/getClientAppointments

// HTTP Methods
// GET    - Read (idempotent)
// POST   - Create
// PUT    - Full update (idempotent)
// PATCH  - Partial update
// DELETE - Delete (idempotent)

// Response Format (JSON:API or similar)
interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      totalPages: number;
      totalCount: number;
    };
    timestamp: string;
    requestId: string;
  };
  links?: {
    self: string;
    first?: string;
    prev?: string;
    next?: string;
    last?: string;
  };
}

// Error Response
interface ApiError {
  error: {
    code: string;           // Machine-readable
    message: string;        // Human-readable
    details?: Array<{
      field?: string;
      reason: string;
      message: string;
    }>;
    requestId: string;
    timestamp: string;
  };
}

// Versioning Strategy
// URL Path (Recommended): /api/v1/resource
// Header: Accept: application/vnd.api+json;version=1
// Query: /api/resource?version=1

// Rate Limiting Headers
// X-RateLimit-Limit: 1000
// X-RateLimit-Remaining: 999
// X-RateLimit-Reset: 1640995200
// Retry-After: 60

// Pagination (Cursor-based for large datasets)
// /api/v1/clients?cursor=eyJpZCI6MTAwfQ&limit=20
```

---

## 4. Qualité et Tests

### 4.1 Pyramide de Tests

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PYRAMIDE DE TESTS                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                        ┌─────────┐                                   │
│                        │   E2E   │  5-10%                           │
│                        │  Tests  │  Lents, coûteux                  │
│                        └────┬────┘                                   │
│                             │                                        │
│                    ┌────────┴────────┐                              │
│                    │   Integration   │  15-20%                      │
│                    │     Tests       │  API, DB                     │
│                    └────────┬────────┘                              │
│                             │                                        │
│           ┌─────────────────┴─────────────────┐                     │
│           │         Unit Tests                │  70-80%             │
│           │    Rapides, isolés, nombreux     │                     │
│           └───────────────────────────────────┘                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Standards de Tests

```typescript
// =============================================================================
// UNIT TESTS (Jest + Testing Library)
// =============================================================================

// Naming Convention: should_ExpectedBehavior_When_Condition
describe('AppointmentService', () => {
  describe('createAppointment', () => {
    it('should_createAppointment_when_validDataProvided', async () => {
      // Arrange
      const service = new AppointmentService(mockRepository);
      const dto = createValidAppointmentDTO();

      // Act
      const result = await service.createAppointment(dto);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('scheduled');
    });

    it('should_throwError_when_timeSlotNotAvailable', async () => {
      // Arrange
      const service = new AppointmentService(mockRepository);
      mockRepository.isTimeSlotAvailable.mockResolvedValue(false);

      // Act & Assert
      await expect(service.createAppointment(dto))
        .rejects
        .toThrow(TimeSlotNotAvailableError);
    });

    it('should_notifyClient_when_appointmentCreated', async () => {
      // Arrange
      const notificationService = mockNotificationService();
      const service = new AppointmentService(mockRepository, notificationService);

      // Act
      await service.createAppointment(dto);

      // Assert
      expect(notificationService.sendAppointmentConfirmation)
        .toHaveBeenCalledWith(expect.objectContaining({
          clientId: dto.clientId,
        }));
    });
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================
describe('Appointment API', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaTestInstance)
      .compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.appointment.deleteMany();
  });

  describe('POST /appointments', () => {
    it('should create appointment and return 201', async () => {
      const response = await request(app.getHttpServer())
        .post('/appointments')
        .send(validAppointmentPayload)
        .expect(201);

      expect(response.body.data).toMatchObject({
        clientId: validAppointmentPayload.clientId,
        status: 'scheduled',
      });

      // Verify in database
      const dbAppointment = await prisma.appointment.findUnique({
        where: { id: response.body.data.id },
      });
      expect(dbAppointment).not.toBeNull();
    });
  });
});

// =============================================================================
// E2E TESTS (Playwright)
// =============================================================================
test.describe('Appointment Booking Flow', () => {
  test('user can book an appointment successfully', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'user@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Navigate to booking
    await page.click('[data-testid="book-appointment"]');

    // Select service
    await page.click('[data-testid="service-braids"]');

    // Select date and time
    await page.click('[data-testid="date-picker"]');
    await page.click('[data-testid="date-2024-01-15"]');
    await page.click('[data-testid="time-slot-10:00"]');

    // Confirm booking
    await page.click('[data-testid="confirm-booking"]');

    // Verify success
    await expect(page.locator('[data-testid="booking-success"]')).toBeVisible();
    await expect(page).toHaveURL(/\/appointments\/[\w-]+/);
  });
});
```

### 4.3 Quality Gates

```yaml
# Quality Gates (SonarQube Configuration)
quality_gates:
  # Gate 1: New Code (Pull Requests)
  new_code:
    coverage:
      min_percentage: 80
      on_new_code: true
    duplications:
      max_percentage: 3
    maintainability_rating: A
    reliability_rating: A
    security_rating: A
    security_hotspots_reviewed: 100%

  # Gate 2: Overall Code (Main Branch)
  overall:
    coverage:
      min_percentage: 75
    duplications:
      max_percentage: 5
    maintainability_rating: B
    reliability_rating: A
    security_rating: A
    code_smells:
      max_count: 50
    bugs:
      max_count: 0
    vulnerabilities:
      max_count: 0

  # Gate 3: Production Release
  release:
    coverage:
      min_percentage: 85
    all_issues_resolved: true
    security_audit_passed: true
    performance_benchmarks_met: true
```

---

## 5. Sécurité

### 5.1 OWASP Top 10 Protection

```typescript
// =============================================================================
// PROTECTION OWASP TOP 10 (2021)
// =============================================================================

// A01: Broken Access Control
// - RBAC implementation
// - Resource-level authorization
const canAccessResource = (user: User, resource: Resource): boolean => {
  // Check role permissions
  if (!hasPermission(user.role, resource.requiredPermission)) {
    return false;
  }
  // Check ownership
  if (resource.ownerId && resource.ownerId !== user.id) {
    return user.role === 'admin';
  }
  return true;
};

// A02: Cryptographic Failures
// - Always use TLS 1.3
// - Strong encryption for sensitive data
import { createCipheriv, randomBytes } from 'crypto';

function encryptSensitiveData(data: string, key: Buffer): EncryptedData {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(data, 'utf8'),
    cipher.final(),
  ]);
  return {
    encrypted: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
  };
}

// A03: Injection
// - Parameterized queries (Prisma handles this)
// - Input validation with Zod
import { z } from 'zod';

const appointmentSchema = z.object({
  clientId: z.string().uuid(),
  serviceId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  notes: z.string().max(500).optional(),
});

// A05: Security Misconfiguration
// Security headers middleware
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://api.example.com",
    "frame-ancestors 'none'",
  ].join('; '),
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// A07: Cross-Site Scripting (XSS)
// - Output encoding
// - Content Security Policy
import DOMPurify from 'isomorphic-dompurify';

function sanitizeUserInput(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  });
}

// A08: Insecure Deserialization
// - Validate and sanitize all input
// - Use signed/encrypted tokens
import jwt from 'jsonwebtoken';

function createSecureToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    algorithm: 'RS256',
    expiresIn: '1h',
    issuer: 'saloon-management',
    audience: 'saloon-app',
  });
}
```

### 5.2 Zero Trust Architecture

```typescript
// =============================================================================
// ZERO TRUST IMPLEMENTATION
// Principe: "Never trust, always verify"
// =============================================================================

// 1. Identity Verification (Every Request)
async function verifyIdentity(request: Request): Promise<User> {
  const token = extractToken(request);
  if (!token) throw new UnauthorizedError('No token provided');

  const decoded = await verifyToken(token);
  const user = await findUserById(decoded.sub);

  // Verify user is still active
  if (!user || user.status !== 'active') {
    throw new UnauthorizedError('User not found or inactive');
  }

  // Verify token hasn't been revoked
  if (await isTokenRevoked(token)) {
    throw new UnauthorizedError('Token has been revoked');
  }

  return user;
}

// 2. Least Privilege Access
const permissions = {
  'appointment:read': ['admin', 'manager', 'braider', 'client'],
  'appointment:create': ['admin', 'manager', 'braider'],
  'appointment:update': ['admin', 'manager'],
  'appointment:delete': ['admin'],
  'client:read': ['admin', 'manager', 'braider'],
  'client:create': ['admin', 'manager'],
  'settings:update': ['admin'],
};

function checkPermission(user: User, permission: string): boolean {
  const allowedRoles = permissions[permission];
  return allowedRoles?.includes(user.role) ?? false;
}

// 3. Micro-segmentation
// Each service has its own authentication
const serviceTokens = {
  'appointment-service': process.env.APPOINTMENT_SERVICE_TOKEN,
  'notification-service': process.env.NOTIFICATION_SERVICE_TOKEN,
  'billing-service': process.env.BILLING_SERVICE_TOKEN,
};

// 4. Continuous Verification
class SessionManager {
  private readonly SESSION_DURATION = 15 * 60 * 1000; // 15 minutes

  async validateSession(sessionId: string): Promise<Session> {
    const session = await this.getSession(sessionId);

    // Check session expiry
    if (Date.now() > session.expiresAt) {
      await this.revokeSession(sessionId);
      throw new SessionExpiredError();
    }

    // Check for suspicious activity
    if (await this.detectAnomaly(session)) {
      await this.revokeSession(sessionId);
      throw new SuspiciousActivityError();
    }

    // Extend session on activity
    await this.extendSession(sessionId, this.SESSION_DURATION);

    return session;
  }
}

// 5. Encryption Everywhere
// - TLS 1.3 for transit
// - AES-256-GCM for data at rest
// - mTLS for service-to-service
```

---

## 6. DevOps et CI/CD

### 6.1 Pipeline Standards

```yaml
# =============================================================================
# CI/CD PIPELINE ENTERPRISE (GitHub Actions)
# =============================================================================

name: Enterprise CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # ===========================================================================
  # Stage 1: Quality Gates
  # ===========================================================================
  quality:
    name: Quality Checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Required for SonarQube

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type Check
        run: npm run type-check

      - name: Unit Tests
        run: npm run test:coverage

      - name: SonarQube Analysis
        uses: sonarqube-action@v2
        with:
          host: ${{ secrets.SONAR_HOST_URL }}
          token: ${{ secrets.SONAR_TOKEN }}

      - name: Quality Gate
        uses: sonarqube-quality-gate-action@v1

  # ===========================================================================
  # Stage 2: Security Scanning
  # ===========================================================================
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

      - name: SAST with Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: Check for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD

  # ===========================================================================
  # Stage 3: Build and Push
  # ===========================================================================
  build:
    name: Build & Push
    runs-on: ubuntu-latest
    needs: [quality, security]
    if: github.event_name == 'push'
    outputs:
      image_tag: ${{ steps.meta.outputs.tags }}
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha,prefix=
            type=ref,event=branch
            type=semver,pattern={{version}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            BUILD_NUMBER=${{ github.run_number }}
            GIT_COMMIT=${{ github.sha }}

  # ===========================================================================
  # Stage 4: Deploy to Staging
  # ===========================================================================
  deploy-staging:
    name: Deploy Staging
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: https://staging.example.com
    steps:
      - name: Deploy to Kubernetes
        uses: azure/k8s-deploy@v4
        with:
          namespace: staging
          manifests: |
            k8s/staging/
          images: |
            ${{ needs.build.outputs.image_tag }}

      - name: Run smoke tests
        run: |
          npm run test:e2e -- --env staging

  # ===========================================================================
  # Stage 5: Deploy to Production
  # ===========================================================================
  deploy-production:
    name: Deploy Production
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://example.com
    steps:
      - name: Blue-Green Deployment
        run: |
          # Deploy to green environment
          kubectl apply -f k8s/production/ --dry-run=client
          kubectl apply -f k8s/production/

          # Wait for rollout
          kubectl rollout status deployment/app -n production

          # Switch traffic
          kubectl patch service app -n production \
            -p '{"spec":{"selector":{"version":"green"}}}'

      - name: Verify deployment
        run: npm run test:smoke:production

      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
```

### 6.2 GitOps avec ArgoCD

```yaml
# =============================================================================
# ArgoCD Application Manifest
# =============================================================================
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: saloon-management
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default

  source:
    repoURL: https://github.com/company/saloon-management
    targetRevision: HEAD
    path: k8s/production

    helm:
      valueFiles:
        - values.yaml
        - values-production.yaml

  destination:
    server: https://kubernetes.default.svc
    namespace: production

  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
      - PrunePropagationPolicy=foreground
      - PruneLast=true

    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m

  # Health checks
  ignoreDifferences:
    - group: apps
      kind: Deployment
      jsonPointers:
        - /spec/replicas
```

---

## 7. Monitoring et Observabilité

### 7.1 Les 3 Piliers

```
┌─────────────────────────────────────────────────────────────────────┐
│                    OBSERVABILITÉ                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │    LOGS      │  │   METRICS    │  │   TRACES     │              │
│  │              │  │              │  │              │              │
│  │ What happened│  │ How much     │  │ Where it     │              │
│  │              │  │              │  │ happened     │              │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤              │
│  │ • ELK Stack  │  │ • Prometheus │  │ • Jaeger     │              │
│  │ • Loki       │  │ • Grafana    │  │ • Zipkin     │              │
│  │ • Datadog    │  │ • Datadog    │  │ • OpenTelemetry              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    SLA/SLO/SLI                               │   │
│  │                                                               │   │
│  │  SLI (Indicator): Request latency, Error rate, Throughput   │   │
│  │  SLO (Objective): 99.9% availability, P99 < 200ms           │   │
│  │  SLA (Agreement): Contractual commitment to customers        │   │
│  │                                                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.2 Structured Logging

```typescript
// =============================================================================
// STRUCTURED LOGGING (ELK/Datadog compatible)
// =============================================================================

import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: 'saloon-management',
    version: process.env.APP_VERSION,
    environment: process.env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['password', 'token', 'authorization', 'creditCard'],
    censor: '[REDACTED]',
  },
});

// Request context logging
function logRequest(req: Request, res: Response, duration: number) {
  logger.info({
    type: 'http_request',
    request: {
      method: req.method,
      url: req.url,
      path: req.path,
      query: req.query,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    },
    response: {
      statusCode: res.statusCode,
      duration,
    },
    user: req.user?.id,
    traceId: req.headers['x-trace-id'],
    spanId: req.headers['x-span-id'],
  });
}

// Business event logging
function logBusinessEvent(event: string, data: Record<string, any>) {
  logger.info({
    type: 'business_event',
    event,
    data,
    timestamp: new Date().toISOString(),
  });
}

// Error logging
function logError(error: Error, context: Record<string, any>) {
  logger.error({
    type: 'error',
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context,
    timestamp: new Date().toISOString(),
  });
}
```

### 7.3 OpenTelemetry

```typescript
// =============================================================================
// OPENTELEMETRY SETUP (Distributed Tracing)
// =============================================================================

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'saloon-management',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.APP_VERSION,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV,
  }),

  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT + '/v1/traces',
  }),

  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT + '/v1/metrics',
    }),
    exportIntervalMillis: 60000,
  }),

  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        ignoreIncomingPaths: ['/health', '/ready', '/metrics'],
      },
      '@opentelemetry/instrumentation-express': {},
      '@opentelemetry/instrumentation-pg': {},
      '@opentelemetry/instrumentation-redis': {},
    }),
  ],
});

sdk.start();

// Custom span creation
import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('saloon-management');

async function createAppointment(data: CreateAppointmentDTO) {
  return tracer.startActiveSpan('createAppointment', async (span) => {
    try {
      span.setAttributes({
        'appointment.client_id': data.clientId,
        'appointment.service_id': data.serviceId,
      });

      const result = await appointmentService.create(data);

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

---

## 8. Documentation

### 8.1 Documentation as Code

```typescript
// =============================================================================
// API DOCUMENTATION (OpenAPI/Swagger)
// =============================================================================

/**
 * @openapi
 * /api/v1/appointments:
 *   post:
 *     summary: Create a new appointment
 *     description: |
 *       Creates a new appointment for a client with a specific service.
 *       The time slot must be available for the selected braider.
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAppointmentRequest'
 *           example:
 *             clientId: "123e4567-e89b-12d3-a456-426614174000"
 *             serviceId: "123e4567-e89b-12d3-a456-426614174001"
 *             braiderId: "123e4567-e89b-12d3-a456-426614174002"
 *             scheduledAt: "2024-01-15T10:00:00Z"
 *             notes: "Client prefers soft braids"
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentResponse'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Time slot not available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
```

### 8.2 Architecture Decision Records (ADRs)

```markdown
# ADR 001: Use PostgreSQL for Primary Database

## Status
Accepted

## Context
We need to choose a primary database for the Saloon Management application.
The database must handle:
- Transactional data (appointments, payments)
- Complex queries for reporting
- ACID compliance for financial data
- Scalability for future growth

## Decision
We will use PostgreSQL as our primary database.

## Rationale
1. **ACID Compliance**: Essential for financial transactions
2. **JSON Support**: JSONB for flexible schema when needed
3. **Performance**: Excellent query optimizer, parallel queries
4. **Ecosystem**: Prisma ORM, pgvector for AI features
5. **Scalability**: Read replicas, connection pooling, partitioning
6. **Cost**: Open source, cloud-agnostic

## Alternatives Considered
- **MySQL**: Less feature-rich, weaker JSON support
- **MongoDB**: Not ideal for transactional data
- **CockroachDB**: Overkill for current scale

## Consequences

### Positive
- Strong data integrity
- Rich querying capabilities
- Well-known technology, easy to hire

### Negative
- Requires more operational knowledge than managed NoSQL
- Vertical scaling limitations (mitigated by read replicas)

## Related Decisions
- ADR 002: Use Prisma as ORM
- ADR 003: Implement CQRS for reporting
```

---

## 9. Gouvernance

### 9.1 Team Structure (Spotify Model)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SPOTIFY MODEL                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  TRIBE: Product Development                                         │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                                                              │    │
│  │  SQUAD: Booking        SQUAD: Payments       SQUAD: Mobile  │    │
│  │  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐│    │
│  │  │ PM           │     │ PM           │     │ PM           ││    │
│  │  │ Designer     │     │ Designer     │     │ Designer     ││    │
│  │  │ 3 Engineers  │     │ 3 Engineers  │     │ 3 Engineers  ││    │
│  │  │ QA           │     │ QA           │     │ QA           ││    │
│  │  └──────────────┘     └──────────────┘     └──────────────┘│    │
│  │                                                              │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  CHAPTERS (Cross-squad expertise)                                   │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                                                              │    │
│  │  Frontend Chapter    Backend Chapter    QA Chapter          │    │
│  │  (All FE devs)       (All BE devs)      (All QA)           │    │
│  │                                                              │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  GUILDS (Interest groups)                                           │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                                                              │    │
│  │  Security Guild    Performance Guild    DevOps Guild        │    │
│  │  (Anyone interested)                                        │    │
│  │                                                              │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 9.2 RACI Matrix

| Activité | Product Owner | Tech Lead | Developer | QA | DevOps |
|----------|--------------|-----------|-----------|-----|--------|
| Définir les requirements | **R/A** | C | C | I | I |
| Architecture decisions | C | **R/A** | C | I | C |
| Code implementation | I | C | **R/A** | C | I |
| Code review | I | **R** | **A** | C | I |
| Testing | I | C | C | **R/A** | I |
| Deployment | I | C | C | C | **R/A** |
| Incident response | I | **R** | C | I | **A** |
| Security compliance | C | **R** | C | C | **A** |

**R** = Responsible, **A** = Accountable, **C** = Consulted, **I** = Informed

---

## 10. Conformité et Régulation

### 10.1 Checklist de Conformité

```markdown
## GDPR (Europe)
- [ ] Privacy by Design
- [ ] Data Processing Agreement (DPA)
- [ ] Cookie consent mechanism
- [ ] Right to access (DSAR)
- [ ] Right to deletion
- [ ] Right to portability
- [ ] Data breach notification (72h)
- [ ] DPO (Data Protection Officer) si requis

## SOC 2 Type II
- [ ] Security policies documented
- [ ] Access controls
- [ ] Change management
- [ ] Risk assessment
- [ ] Incident response plan
- [ ] Vendor management
- [ ] Business continuity

## PCI DSS (Payments)
- [ ] Secure network
- [ ] Cardholder data protection
- [ ] Vulnerability management
- [ ] Access control
- [ ] Monitoring and testing
- [ ] Security policy

## ISO 27001
- [ ] ISMS (Information Security Management System)
- [ ] Risk assessment
- [ ] Statement of Applicability
- [ ] Security controls
- [ ] Internal audits
- [ ] Management review

## Accessibility (WCAG 2.1 AA)
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast
- [ ] Alt text for images
- [ ] Form labels
- [ ] Focus indicators
- [ ] Responsive design
```

### 10.2 Data Retention Policy

```typescript
// =============================================================================
// DATA RETENTION POLICIES
// =============================================================================

const dataRetentionPolicies = {
  // User data
  userAccounts: {
    active: 'indefinite',
    inactive: '3 years',
    deleted: '30 days',
  },

  // Appointment data
  appointments: {
    active: 'indefinite',
    completed: '7 years', // Tax/legal requirements
    cancelled: '1 year',
  },

  // Payment data
  payments: {
    records: '10 years', // Financial regulations
    cardDetails: 'never stored', // PCI DSS
  },

  // Logs
  accessLogs: '90 days',
  errorLogs: '1 year',
  auditLogs: '7 years',

  // Backups
  dailyBackups: '30 days',
  weeklyBackups: '6 months',
  monthlyBackups: '7 years',
};

// Automated data cleanup
async function enforceRetentionPolicies() {
  // Delete inactive users after 3 years
  await prisma.user.deleteMany({
    where: {
      status: 'inactive',
      lastActiveAt: {
        lt: subYears(new Date(), 3),
      },
    },
  });

  // Archive old appointments
  await prisma.appointment.updateMany({
    where: {
      status: 'completed',
      completedAt: {
        lt: subYears(new Date(), 5),
      },
    },
    data: {
      archived: true,
    },
  });

  // Purge old logs
  await prisma.accessLog.deleteMany({
    where: {
      createdAt: {
        lt: subDays(new Date(), 90),
      },
    },
  });
}
```

---

## 📚 Ressources

### Standards et Guidelines
- [Google Engineering Practices](https://google.github.io/eng-practices/)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

### Books
- "Clean Code" - Robert C. Martin
- "Designing Data-Intensive Applications" - Martin Kleppmann
- "The Phoenix Project" - Gene Kim
- "Site Reliability Engineering" - Google
- "Building Microservices" - Sam Newman

### Certifications
- AWS Solutions Architect
- Google Cloud Professional
- Kubernetes CKA/CKAD
- ISO 27001 Lead Implementer

---

**Dernière mise à jour** : 2026-01-18
