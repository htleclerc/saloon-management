# Audit UI - Phase 0

## Global Overview
The UI varies significantly in terms of data integration. Some pages (Calendar) are well-integrated with context providers, while others (Reports) are completely static. The design is generally consistent and uses `lucide-react` icons and a cohesive color scheme.

## Detailed Page Audit

### 1. Services (`app/services/page.tsx`)
- **Status:** 🟡 Partial (Hardcoded Data)
- **Features:**
  - List services (Grid view) with details (price, duration, etc.) - **MOCKED**
  - Search/Filter - **Functional (local state)**
  - Add/Edit Service Links - **Functional** (leads to forms)
  - Admin Stats Table - **MOCKED** (derived from mock list)
- **Issues:**
  - `services` array is hardcoded default export.
  - No connection to a `ServiceProvider` or API.
  - Image URLs are external (Unsplash).

### 2. Expenses (`app/expenses/page.tsx`)
- **Status:** 🟡 Partial (Hardcoded Data)
- **Features:**
  - Expense Categories Summary - **MOCKED** (`expenseCategories` array)
  - Recent Expenses Table - **MOCKED** (`recentExpenses` array)
  - Charts (Recharts) - **Functional** (but data is static)
  - Export CSV/PDF - **Functional** (but data is static)
- **Issues:**
  - Completely relies on hardcoded arrays.
  - Needs `ExpenseProvider` integration.

### 3. Income (`app/income/page.tsx`)
- **Status:** 🟠 Hybrid (Confusing Data Source)
- **Features:**
  - List Income - **Hybrid** (Merges `mockIncomes` with `useIncome()` data)
  - History/Comments - **Functional** (Component state)
  - Filter/Sort - **Functional** (Complex logic for mixed data types)
- **Issues:**
  - Logic handles both "Mock" (string names) and "Dynamic" (ID references) data, causing complexity.
  - Imports `SERVICES` and `WORKERS` from `lib/data` but usage in filters is tentative.
  - Hardcoded `mockIncomes` need to be removed or moved to a provider seed.

### 4. Calendar (`app/calendar/page.tsx`)
- **Status:** 🟢 Good (Integrated)
- **Features:**
  - Interactive Slots - **Functional** (Uses `useBooking`)
  - Day Capacity/Closure - **Functional** (Uses `useBooking`)
  - Overbooking Toggle - **Functional**
- **Issues:**
  - `DEFAULT_TIME_SLOTS` is hardcoded (might need configuration).
  - "New Appointment" button links to `/appointments/book` (needs verification).

### 5. Reports (`app/reports/page.tsx`)
- **Status:** 🔴 Static (Mockup Only)
- **Features:**
  - Extensive Charts & KPIs - **Visual Only**
  - Annual/Monthly/Quarterly data - **All Hardcoded**
- **Issues:**
  - This page is a pure UI shell. No data wiring whatsoever.
  - Needs substantial backend/provider work to function.

## Recommendations for Phase 1 & 2
1.  **Centralize Data:** Move `services`, `expenseCategories`, and static `mockIncomes` into their respective Providers (or a central `MockDataProvider` for Phase 2).
2.  **Unify Types:** Resolve the "String vs ID" conflict in Income page by enforcing proper types in the Provider.
3.  **Activate Reports:** De-prioritize full dynamic reports for Week 1 MVP unless standard "Bookings" data can easily feed them. Focus on `Income` and `Expenses` operational data first.
