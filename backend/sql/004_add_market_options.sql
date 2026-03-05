-- Add options column to markets table
-- Stores valid prediction selections for each market as a JSON array
-- e.g. [{"code": "VER", "label": "Max Verstappen"}, ...]
ALTER TABLE markets ADD COLUMN IF NOT EXISTS options JSONB;
