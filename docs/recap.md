# User Prompt Recap

This document summarizes recent user prompts and objectives to track progress and identify areas for improvement.

## Evolution Summary (Saloon Management)

The platform has reached significant maturity through several specific development phases:

1.  **Core Architecture (Jan 2026)**: Implementation of Next.js 14 App Router, DDD (Domain Driven Design) for services, and full internationalization (EN/FR/ES).
2.  **Workflow & Permissions (late Jan 2026)**: Development of complex RBAC (Role-Based Access Control), read-only guards for workers, and the draft/pending/validated income lifecycle.
3.  **Financial & Payroll Integrity (Feb 2026)**: Launch of worker-specific payroll history, audit logs for payment edits, and persistent discussion notes to prevent data loss during disputes.
4.  **Data Visualization & UX (Feb 2026)**: Implementation of advanced "Safe Horizon" scaling for charts (preventing misleading small-volume spikes) and daily granularity for performance tracking.
5.  **Technical Debt & Stability (Feb 2026)**: Deployment of full Vitest/Playwright testing suite and migration to Supabase-driven dynamic configuration.

## Recent Conversations (Reverse Chronological)

### Debugging Booking Form (2026-02-12)
**Objective**: Resolve issues with the "New Client" form on the booking page.
- **UI Bug Fix**: Corrected the logic that caused the form to disappear unexpectedly.
- **Client Creation**: Ensured new clients are correctly created during the booking process.

### Creating Sp-Demo Branch & Repository Management (2026-02-10)
**Objective**: Manage branch creation and cross-repo pushing.
- **Branching**: Created `sp-demo` branch with an initialization message.
- **Repo Sync**: Pushed the frontend folder to a separate repository for demo purposes.

### Refining Payment Notes (2026-02-10)
**Objective**: Maintain a complete history of payment discussions.
- **Notes Appending**: Modified the salary payment system to append new notes instead of overwriting, preserving audit history.

### Implementing Worker Audit Log (2026-02-09)
**Objective**: Implement worker-specific audit logs for payments.
- **Audit Tracking**: Tracked manual actions in payment history.
- **Worker Context**: Enhanced the UI to display worker-specific history in the monthly overview.

### Adding Income Unit Tests (2026-02-05)
**Objective**: Improve test coverage for Income and Notification services.
- **Service Tests**: Wrote comprehensive unit tests for `IncomeService` and `NotificationService`.
- **i18n & Mocking**: Mocked `next/navigation` and handled hybrid notification logic verification.

### Implementing Refined Chart Filters & Consistent Scaling (2026-02-06)
**Objective**: Implement period-based filtering for salary charts and ensure consistent Y-axis scaling.
- **Period-Based Filtering**: Added interactive buttons for **Day, Week, Month, and Year** filtering for the "Salary / Performance Details" chart in both Team and Team Detail views.
- **Refined Data Services**: Refactored `StatsService` to support multiple aggregation periods (Day, Week, Month, Year) for salary performance, mirroring the Income Dashboard logic.
- **Fixed Empty Chart Issue**: Resolved a data mapping issue where `XAxis` `dataKey` mismatch caused bars to disappear.
- **Locked Y-Axis Scaling**: Implemented a minimum domain of `[0, 200]` for earnings/financial charts (Salary, Earnings Breakdown, and Overall Performance Summary) and `[0, 30]` for client volume trend to prevent misleading visual variations in sparse data.
- **Aesthetic Refinement**: Internationalized new labels and subtexts, ensuring a polished and informative display across all timeframes.
   
### Refining Team Performance & Chart Visuals (2026-02-05)
**Objective**: Improve the Team Detail page by refining the Activity History and data visualization in charts.
- **Enhanced Activity History**: Refactored `StatsService.getRecentWorkerActivity` to fetch precise worker earnings (commission + tips) instead of total income, and internationalized all activity labels.
- **Symbolic Zero Visualization**: Implemented a "visual floor" (dynamic 5% of max) for zero-value data in Bar and Line charts to ensure they remain visible while preserving accuracy in tooltips.
- **Chart Label Refinement**: Replaced generic labels (`value1`, `value2`) with meaningful, localized names (`Total Income`, `Commission`, etc.) across all performance charts.
- **Fixed Service Time Distribution**: Updated Pie Chart to show placeholder slices when all categories are zero, ensuring the chart doesn't appear blank.
**Objective**: Implement "Day" filter on Worker Detail and resolve data loading issues on Income Dashboard.
- **Implemented Day Filter (Worker Detail)**: Added daily granularity to `DateRangeFilter` and integrated it into the Worker Detail page for fine-grained transaction tracking.
- **Fixed Income Dashboard 400 Errors**: Resolved SQL join syntax issues in `SupabaseProvider` that caused failed data fetching for team performance.
- **Enhanced Dashboard Navigation**: Refactored the period navigation (Daily, Monthly, Annual) with robust date state management and selectors.
- **Refined Data Display**: Added fallbacks for workers with zero revenue to ensure the dashboard remains stable and complete.

### Routine Verification (2026-01-30)
**Objective**: Ensure application stability and persist user customizations.
- Performed routine build and restart.
- Verified application availability.

### User Customization & Build Fixes (2026-01-29)
**Objective**: Stabilize build and verify user customizations.
- Resolved `SalonStats` type error in data providers.
- Verified user's manual updates to Income Dashboard.
- Fixed Settings Navigation visibility for 'owner' role.

### Implementing Global Loading State (2026-01-27)
**Objective**: Implement a consistent and simpler loading spinner across all pages.
- Reverted dashboard loading indicator to a less intrusive style.
- Created global `app/loading.tsx`.

### Implementing Testing Strategy (2026-01-26)
**Objective**: Implement comprehensive automated testing strategy (Unit, Component, E2E).
- Set up Vitest and Playwright.
- Wrote initial tests and debugged E2E failures.

### Creating Sp-Demo Branch (2026-01-15)
**Objective**: Manage repository branching for a demo version.
- Created 'sp-demo' branch.
- Committed changes with specific V1.0 message.
- Pushed frontend folder to a separate repository.

### Paeille pour la page login (2026-01-23)
**Objective**: Login page adjustments (Details implicit in conversation).

### Il reste le titre du formulaire (2026-01-26)
**Objective**: Fix form title issues (Details implicit in conversation).

### La page configuration ne marche pas (2026-01-26)
**Objective**: Debug configuration page issues.

### Internationalizing Team Pages (2026-01-23)
**Objective**: Internationalize `app/team` pages.
- Handled `add-advanced`, `edit-advanced`, and `feedback` pages.
- Replaced hardcoded strings with translation keys.

### Investigating File Management (2026-01-25)
**Objective**: Implement file upload functionality for team member photos.
- Investigated existing patterns.
- Implemented `IStorageProvider` and `SupabaseStorageProvider`.
- Integrated uploads into `add-advanced` page.

### UI Audit and Development (2026-01-18)
**Objective**: Audit and improve UI for Services, Expenses, Income, Calendar, and Reports.
- Refactored hardcoded data.
- Optimized component structures.

### Finalize Read-Only Enforcement (2026-01-20)
**Objective**: Finalize read-only mode by guarding interactive elements.
- Applied `ReadOnlyGuard` to "Add" and "Edit" buttons in Team and Services pages.

### Refactor Dashboard Action Buttons (2026-01-19)
**Objective**: Centralize management of action button visibility.
- Refactored Dashboards to use `canPerformBookingAction`.
- Audited management actions across the app.

### Updating Course Scripts Comprehensively (2026-01-13)
**Objective**: Update 6 frontend course video scripts.
- Merged functionality into cohesive video scripts (Intro, Theming, Auth, i18n, Advanced Dashboard, Responsive Design).
- Updated `README.md`.

### Ensure Antigravity Guide Compliance (2026-01-18)
**Objective**: Align project with `ANTIGRAVITY_GUIDE.md`.
- Verified code against new rules (no `any`, testing requirements).
