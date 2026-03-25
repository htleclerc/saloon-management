-- Migration: Add auth_id column to users table
-- Links application users to Supabase Auth identities (auth.users.id)

-- Add auth_id column (nullable to preserve existing demo/seed users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;

-- Create index for fast lookups by auth_id
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- Comment for documentation
COMMENT ON COLUMN users.auth_id IS 'References auth.users.id from Supabase Auth. NULL for demo/seed users.';
