-- Create the participants table
CREATE TABLE IF NOT EXISTS participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  email TEXT,
  num_guests INTEGER DEFAULT 0,
  food_preference TEXT DEFAULT 'veg',
  special_requests TEXT,
  qr_code TEXT,
  checked_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Disable RLS (service_role key is used, no need for row-level policies)
ALTER TABLE participants DISABLE ROW LEVEL SECURITY;

-- Drop any existing restrictive policies
DROP POLICY IF EXISTS "Service role full access" ON participants;

-- Create index on participant_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_participant_id ON participants (participant_id);

-- Create index on checked_in for stats queries
CREATE INDEX IF NOT EXISTS idx_checked_in ON participants (checked_in);

-- Grant full access to all roles
GRANT ALL ON participants TO anon;
GRANT ALL ON participants TO authenticated;
GRANT ALL ON participants TO service_role;
