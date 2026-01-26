# User Tracking System - Setup Guide

## Overview

All database operations now track who created/modified each record using unique user codes.

## User Code Format

**Format:** `[ROLE][FIRST_2][LAST_3][SUFFIX?]`
- **Length:** 7-12 characters
- **ROLE:** 2-char prefix (AD, MG, WK, SY)
- **FIRST_2:** First 2 letters of first name
- **LAST_3:** First 3 letters of last name
- **SUFFIX:** Optional 3-digit number if collision

## Examples

| User | Role | Code | Notes |
|------|------|------|-------|
| John Doe | Admin | `ADJODO` | 7 chars |
| Sophie Martin | Worker | `WKSOMART` | 8 chars |
| Sophie Martin | Worker | `WKSOMART001` | If duplicate exists |
| System User | System | `SYSYSTEM` | Special system code |

## Role Prefixes

- `AD` - Admin
- `MG` - Manager
- `WK` - Worker
- `SY` - System
- `US` - User (default)

## Database Setup

### 1. Run Migration

Execute in Supabase SQL Editor:

```bash
supabase/migration_user_tracking.sql
```

This adds:
- `created_by` and `updated_by` columns to all tables
- `user_codes` table
- `generate_user_code()` function
- `get_or_create_user_code()` function
- Automatic triggers to set codes

### 2. Create User Codes

```sql
-- Create user code manually
SELECT get_or_create_user_code('Sophie', 'Laurent', 'Worker', 'sophie@example.com');
-- Returns: WKSOLAU

-- Create admin user
SELECT get_or_create_user_code('John', 'Doe', 'Admin', 'john@example.com');
-- Returns: ADJODO

-- System user already exists
SELECT * FROM user_codes WHERE is_system = true;
-- Returns: SYSYSTEM
```

### 3. Usage in Application

The tracking columns are automatically set:

```typescript
// Create worker
await supabase
  .from('workers')
  .insert([{
    name: 'New Worker',
    // created_by will be set automatically to SYSYSTEM (demo mode)
  }]);

// Update worker
await supabase
  .from('workers')
  .update({ 
    name: 'Updated Name'
    // updated_by will be set automatically
  })
  .eq('id', 1);
```

## Frontend Usage

```typescript
import { generateUserCode, parseUserCode, getCurrentUserCode } from '@/lib/utils/userCode';

// Generate code
const code = generateUserCode({
  firstName: 'Sophie',
  lastName: 'Martin',
  role: 'Worker'
});
// Returns: WKSOMART

// Parse code
const info = parseUserCode('WKSOMART001');
// Returns: { role: 'Worker', initials: 'SOMART', hasSuffix: true, suffix: 1 }

// Get current user (demo mode = SYSTEM)
const currentUser = getCurrentUserCode();
// Returns: SYSYSTEM
```

## Benefits

1. **Audit Trail** - Know who created/modified each record
2. **Accountability** - Track user actions
3. **Debugging** - Easier to trace issues
4. **Compliance** - Meet audit requirements

## Future: Multi-User Auth

When implementing real auth:

1. Create user codes on signup
2. Store in user profile
3. Pass to all CRUD operations
4. Update `getCurrentUserCode()` to read from auth context

```typescript
// Future implementation
export function getCurrentUserCode(): string {
  const { user } = useAuth();
  return user?.userCode || SYSTEM_USER_CODE;
}
```

## Querying Tracking Data

```sql
-- See who created workers
SELECT id, name, created_by, created_at 
FROM workers 
ORDER BY created_at DESC;

-- See all actions by a user
SELECT 
  'workers' as table_name, id, name, created_by, updated_by 
FROM workers 
WHERE created_by = 'WKSOMART' OR updated_by = 'WKSOMART'
UNION ALL
SELECT 
  'bookings' as table_name, id::text, client_name, created_by, updated_by 
FROM bookings 
WHERE created_by = 'WKSOMART' OR updated_by = 'WKSOMART';

-- List all user codes
SELECT * FROM user_codes ORDER BY created_at DESC;
```
