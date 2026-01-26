# Supabase Configuration for Demo Mode

## Environment Variables

Add these to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Get Credentials

1. Go to https://supabase.com/dashboard
2. Select your project (or create new one)
3. Go to Settings → API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Setup Database

### 1. Create Tables

In Supabase SQL Editor, run in order:

```bash
supabase/schema.sql     # Creates all tables
supabase/policies.sql   # Sets up RLS policies
supabase/cleanup.sql    # Auto-cleanup function
```

### 2. Enable pg_cron (for auto-cleanup)

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'cleanup-demo-data-daily',
  '0 3 * * *',
  $$SELECT cleanup_demo_data()$$
);
```

### 3. Verify Setup

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check policies
SELECT * FROM pg_policies;

-- Test cleanup (won't delete anything if < 7 days)
SELECT cleanup_demo_data();
```

## Security Notes

⚠️ **DEMO MODE ONLY**
- RLS policies are PUBLIC
- Anyone can read/write
- Auto-cleanup after 7 days
- Do NOT use in production

For production, implement proper auth:
- User authentication (Supabase Auth)
- RLS policies with `auth.uid()`
- Private data isolation
