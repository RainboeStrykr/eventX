-- Shared structure for all event-specific registration tables
CREATE TABLE IF NOT EXISTS marriage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  email TEXT,
  num_guests INTEGER DEFAULT 0,
  meal_preferences TEXT[] DEFAULT '{}',
  veg_guests INTEGER DEFAULT 0,
  non_veg_guests INTEGER DEFAULT 0,
  chauffeur_coming BOOLEAN DEFAULT false,
  chauffeur_food_preference TEXT,
  special_requests TEXT,
  qr_code TEXT,
  checked_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reception (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  email TEXT,
  num_guests INTEGER DEFAULT 0,
  meal_preferences TEXT[] DEFAULT '{}',
  veg_guests INTEGER DEFAULT 0,
  non_veg_guests INTEGER DEFAULT 0,
  chauffeur_coming BOOLEAN DEFAULT false,
  chauffeur_food_preference TEXT,
  special_requests TEXT,
  qr_code TEXT,
  checked_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS birthday_party (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  email TEXT,
  num_guests INTEGER DEFAULT 0,
  meal_preferences TEXT[] DEFAULT '{}',
  veg_guests INTEGER DEFAULT 0,
  non_veg_guests INTEGER DEFAULT 0,
  chauffeur_coming BOOLEAN DEFAULT false,
  chauffeur_food_preference TEXT,
  special_requests TEXT,
  qr_code TEXT,
  checked_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure new event-specific question columns exist in case tables were created earlier
ALTER TABLE marriage ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE marriage ADD COLUMN IF NOT EXISTS meal_preferences TEXT[] DEFAULT '{}';
ALTER TABLE marriage ADD COLUMN IF NOT EXISTS veg_guests INTEGER DEFAULT 0;
ALTER TABLE marriage ADD COLUMN IF NOT EXISTS non_veg_guests INTEGER DEFAULT 0;
ALTER TABLE marriage ADD COLUMN IF NOT EXISTS chauffeur_coming BOOLEAN DEFAULT false;
ALTER TABLE marriage ADD COLUMN IF NOT EXISTS chauffeur_food_preference TEXT;

ALTER TABLE reception ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE reception ADD COLUMN IF NOT EXISTS meal_preferences TEXT[] DEFAULT '{}';
ALTER TABLE reception ADD COLUMN IF NOT EXISTS veg_guests INTEGER DEFAULT 0;
ALTER TABLE reception ADD COLUMN IF NOT EXISTS non_veg_guests INTEGER DEFAULT 0;
ALTER TABLE reception ADD COLUMN IF NOT EXISTS chauffeur_coming BOOLEAN DEFAULT false;
ALTER TABLE reception ADD COLUMN IF NOT EXISTS chauffeur_food_preference TEXT;

ALTER TABLE birthday_party ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE birthday_party ADD COLUMN IF NOT EXISTS meal_preferences TEXT[] DEFAULT '{}';
ALTER TABLE birthday_party ADD COLUMN IF NOT EXISTS veg_guests INTEGER DEFAULT 0;
ALTER TABLE birthday_party ADD COLUMN IF NOT EXISTS non_veg_guests INTEGER DEFAULT 0;
ALTER TABLE birthday_party ADD COLUMN IF NOT EXISTS chauffeur_coming BOOLEAN DEFAULT false;
ALTER TABLE birthday_party ADD COLUMN IF NOT EXISTS chauffeur_food_preference TEXT;

-- Disable RLS (service_role key is used, no need for row-level policies)
ALTER TABLE marriage DISABLE ROW LEVEL SECURITY;
ALTER TABLE reception DISABLE ROW LEVEL SECURITY;
ALTER TABLE birthday_party DISABLE ROW LEVEL SECURITY;

-- Create indexes for fast lookups and stats
CREATE INDEX IF NOT EXISTS idx_marriage_participant_id ON marriage (participant_id);
CREATE INDEX IF NOT EXISTS idx_marriage_checked_in ON marriage (checked_in);
CREATE INDEX IF NOT EXISTS idx_reception_participant_id ON reception (participant_id);
CREATE INDEX IF NOT EXISTS idx_reception_checked_in ON reception (checked_in);
CREATE INDEX IF NOT EXISTS idx_birthday_party_participant_id ON birthday_party (participant_id);
CREATE INDEX IF NOT EXISTS idx_birthday_party_checked_in ON birthday_party (checked_in);

-- Grant full access to all roles
GRANT ALL ON marriage TO anon;
GRANT ALL ON marriage TO authenticated;
GRANT ALL ON marriage TO service_role;

GRANT ALL ON reception TO anon;
GRANT ALL ON reception TO authenticated;
GRANT ALL ON reception TO service_role;

GRANT ALL ON birthday_party TO anon;
GRANT ALL ON birthday_party TO authenticated;
GRANT ALL ON birthday_party TO service_role;
